"""
Chat API endpoints with streaming support
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
import json
import asyncio

from core.database import get_db
from core.auth import get_current_user
from models.user import User
from models.conversation import Conversation, Message
from schemas.chat import (
    ChatRequest, ChatResponse, MessageResponse,
    StreamChatRequest, FileUploadRequest
)
from services.llm_service import LLMService
from services.rag_service import RAGService
from services.file_service import FileService

router = APIRouter()

@router.post("/", response_model=ChatResponse)
async def send_message(
    request: ChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Send a chat message and get response
    """
    try:
        # Get or create conversation
        conversation = await get_or_create_conversation(
            db, request.conversation_id, current_user.id
        )
        
        # Save user message
        user_message = Message(
            conversation_id=conversation.id,
            role="user",
            content=request.message,
            metadata={"model": request.model or "default"}
        )
        db.add(user_message)
        await db.commit()
        
        # Get conversation history
        history = await get_conversation_history(db, conversation.id, limit=10)
        
        # Get relevant context from RAG if enabled
        context = None
        if request.use_rag:
            rag_service = RAGService()
            context = await rag_service.get_relevant_context(
                request.message,
                user_id=current_user.id,
                top_k=5
            )
        
        # Generate response using LLM
        llm_service = LLMService()
        response_text, token_count = await llm_service.generate_response(
            message=request.message,
            history=history,
            context=context,
            model=request.model,
            temperature=request.temperature
        )
        
        # Save assistant message
        assistant_message = Message(
            conversation_id=conversation.id,
            role="assistant",
            content=response_text,
            token_count=token_count,
            model=request.model or llm_service.default_model,
            metadata={"context_used": context is not None}
        )
        db.add(assistant_message)
        
        # Update conversation title if first message
        if not conversation.title:
            conversation.title = request.message[:100]
        
        await db.commit()
        
        return ChatResponse(
            conversation_id=str(conversation.id),
            message=response_text,
            role="assistant",
            token_count=token_count,
            model=assistant_message.model
        )
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing chat request: {str(e)}"
        )

@router.post("/stream")
async def stream_message(
    request: StreamChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Send a chat message and stream the response
    """
    async def generate_stream():
        try:
            # Get or create conversation
            conversation = await get_or_create_conversation(
                db, request.conversation_id, current_user.id
            )
            
            # Save user message
            user_message = Message(
                conversation_id=conversation.id,
                role="user",
                content=request.message
            )
            db.add(user_message)
            await db.commit()
            
            # Get conversation history
            history = await get_conversation_history(db, conversation.id, limit=10)
            
            # Get RAG context if enabled
            context = None
            if request.use_rag:
                rag_service = RAGService()
                context = await rag_service.get_relevant_context(
                    request.message,
                    user_id=current_user.id
                )
            
            # Stream response from LLM
            llm_service = LLMService()
            full_response = ""
            token_count = 0
            
            async for chunk in llm_service.stream_response(
                message=request.message,
                history=history,
                context=context,
                model=request.model
            ):
                full_response += chunk
                token_count += 1
                
                # Send chunk to client
                yield f"data: {json.dumps({'chunk': chunk, 'done': False})}\n\n"
            
            # Save assistant message
            assistant_message = Message(
                conversation_id=conversation.id,
                role="assistant",
                content=full_response,
                token_count=token_count,
                model=request.model or llm_service.default_model
            )
            db.add(assistant_message)
            await db.commit()
            
            # Send completion signal
            yield f"data: {json.dumps({'chunk': '', 'done': True, 'message_id': str(assistant_message.id)})}\n\n"
            
        except Exception as e:
            error_data = json.dumps({'error': str(e), 'done': True})
            yield f"data: {error_data}\n\n"
    
    return StreamingResponse(
        generate_stream(),
        media_type="text/event-stream"
    )

@router.post("/upload")
async def upload_file(
    request: FileUploadRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Upload and process a file for RAG
    """
    try:
        file_service = FileService()
        rag_service = RAGService()
        
        # Upload file to S3
        file_url = await file_service.upload_file(
            file=request.file,
            user_id=current_user.id
        )
        
        # Extract text content
        content = await file_service.extract_text(request.file)
        
        # Generate embeddings and store in vector DB
        await rag_service.index_document(
            content=content,
            metadata={
                "user_id": str(current_user.id),
                "filename": request.file.filename,
                "file_url": file_url
            }
        )
        
        return {
            "status": "success",
            "filename": request.file.filename,
            "file_url": file_url,
            "message": "File uploaded and indexed successfully"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading file: {str(e)}"
        )

@router.get("/{conversation_id}/messages", response_model=List[MessageResponse])
async def get_messages(
    conversation_id: str,
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get messages for a conversation
    """
    from sqlalchemy import select
    from uuid import UUID
    
    # Verify conversation belongs to user
    stmt = select(Conversation).where(
        Conversation.id == UUID(conversation_id),
        Conversation.user_id == current_user.id
    )
    result = await db.execute(stmt)
    conversation = result.scalar_one_or_none()
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    # Get messages
    stmt = select(Message).where(
        Message.conversation_id == UUID(conversation_id)
    ).order_by(Message.created_at.desc()).limit(limit).offset(offset)
    
    result = await db.execute(stmt)
    messages = result.scalars().all()
    
    return [
        MessageResponse(
            id=str(msg.id),
            role=msg.role,
            content=msg.content,
            created_at=msg.created_at,
            token_count=msg.token_count,
            model=msg.model
        )
        for msg in reversed(messages)
    ]

# Helper functions
async def get_or_create_conversation(
    db: AsyncSession,
    conversation_id: Optional[str],
    user_id: str
) -> Conversation:
    """Get existing conversation or create new one"""
    from sqlalchemy import select
    from uuid import UUID
    
    if conversation_id:
        stmt = select(Conversation).where(
            Conversation.id == UUID(conversation_id),
            Conversation.user_id == UUID(user_id)
        )
        result = await db.execute(stmt)
        conversation = result.scalar_one_or_none()
        
        if conversation:
            return conversation
    
    # Create new conversation
    conversation = Conversation(user_id=UUID(user_id))
    db.add(conversation)
    await db.commit()
    await db.refresh(conversation)
    
    return conversation

async def get_conversation_history(
    db: AsyncSession,
    conversation_id: str,
    limit: int = 10
) -> List[dict]:
    """Get conversation history for context"""
    from sqlalchemy import select
    from uuid import UUID
    
    stmt = select(Message).where(
        Message.conversation_id == UUID(conversation_id)
    ).order_by(Message.created_at.desc()).limit(limit)
    
    result = await db.execute(stmt)
    messages = result.scalars().all()
    
    return [
        {"role": msg.role, "content": msg.content}
        for msg in reversed(messages)
    ]
