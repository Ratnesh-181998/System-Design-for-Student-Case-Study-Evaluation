"""
LLM Service - Handles interactions with various LLM providers
"""

from typing import List, Dict, Optional, AsyncGenerator
import openai
from anthropic import AsyncAnthropic
import asyncio
from core.config import settings
import logging

logger = logging.getLogger(__name__)

class LLMService:
    """Service for interacting with Large Language Models"""
    
    def __init__(self):
        self.openai_client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.anthropic_client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
        self.default_model = settings.OPENAI_MODEL
    
    async def generate_response(
        self,
        message: str,
        history: List[Dict[str, str]] = None,
        context: Optional[str] = None,
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 4096
    ) -> tuple[str, int]:
        """
        Generate a response from the LLM
        
        Args:
            message: User message
            history: Conversation history
            context: Additional context from RAG
            model: Model to use (defaults to configured model)
            temperature: Sampling temperature
            max_tokens: Maximum tokens in response
            
        Returns:
            Tuple of (response_text, token_count)
        """
        try:
            model = model or self.default_model
            
            # Build messages array
            messages = self._build_messages(message, history, context)
            
            # Route to appropriate provider
            if model.startswith("gpt"):
                return await self._generate_openai(messages, model, temperature, max_tokens)
            elif model.startswith("claude"):
                return await self._generate_anthropic(messages, model, temperature, max_tokens)
            else:
                raise ValueError(f"Unsupported model: {model}")
                
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            raise
    
    async def stream_response(
        self,
        message: str,
        history: List[Dict[str, str]] = None,
        context: Optional[str] = None,
        model: Optional[str] = None,
        temperature: float = 0.7
    ) -> AsyncGenerator[str, None]:
        """
        Stream response from LLM
        
        Yields:
            Response chunks as they are generated
        """
        try:
            model = model or self.default_model
            messages = self._build_messages(message, history, context)
            
            if model.startswith("gpt"):
                async for chunk in self._stream_openai(messages, model, temperature):
                    yield chunk
            elif model.startswith("claude"):
                async for chunk in self._stream_anthropic(messages, model, temperature):
                    yield chunk
            else:
                raise ValueError(f"Unsupported model: {model}")
                
        except Exception as e:
            logger.error(f"Error streaming response: {e}")
            raise
    
    def _build_messages(
        self,
        message: str,
        history: List[Dict[str, str]] = None,
        context: Optional[str] = None
    ) -> List[Dict[str, str]]:
        """Build messages array for LLM"""
        messages = []
        
        # System message with context if available
        system_content = "You are a helpful AI assistant."
        if context:
            system_content += f"\n\nRelevant context:\n{context}"
        
        messages.append({"role": "system", "content": system_content})
        
        # Add conversation history
        if history:
            messages.extend(history)
        
        # Add current message
        messages.append({"role": "user", "content": message})
        
        return messages
    
    async def _generate_openai(
        self,
        messages: List[Dict[str, str]],
        model: str,
        temperature: float,
        max_tokens: int
    ) -> tuple[str, int]:
        """Generate response using OpenAI"""
        try:
            response = await self.openai_client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens
            )
            
            content = response.choices[0].message.content
            tokens = response.usage.total_tokens
            
            return content, tokens
            
        except Exception as e:
            logger.error(f"OpenAI API error: {e}")
            raise
    
    async def _stream_openai(
        self,
        messages: List[Dict[str, str]],
        model: str,
        temperature: float
    ) -> AsyncGenerator[str, None]:
        """Stream response using OpenAI"""
        try:
            stream = await self.openai_client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=temperature,
                stream=True
            )
            
            async for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
                    
        except Exception as e:
            logger.error(f"OpenAI streaming error: {e}")
            raise
    
    async def _generate_anthropic(
        self,
        messages: List[Dict[str, str]],
        model: str,
        temperature: float,
        max_tokens: int
    ) -> tuple[str, int]:
        """Generate response using Anthropic Claude"""
        try:
            # Extract system message
            system_msg = next((m["content"] for m in messages if m["role"] == "system"), "")
            user_messages = [m for m in messages if m["role"] != "system"]
            
            response = await self.anthropic_client.messages.create(
                model=model,
                max_tokens=max_tokens,
                temperature=temperature,
                system=system_msg,
                messages=user_messages
            )
            
            content = response.content[0].text
            tokens = response.usage.input_tokens + response.usage.output_tokens
            
            return content, tokens
            
        except Exception as e:
            logger.error(f"Anthropic API error: {e}")
            raise
    
    async def _stream_anthropic(
        self,
        messages: List[Dict[str, str]],
        model: str,
        temperature: float
    ) -> AsyncGenerator[str, None]:
        """Stream response using Anthropic Claude"""
        try:
            system_msg = next((m["content"] for m in messages if m["role"] == "system"), "")
            user_messages = [m for m in messages if m["role"] != "system"]
            
            async with self.anthropic_client.messages.stream(
                model=model,
                max_tokens=4096,
                temperature=temperature,
                system=system_msg,
                messages=user_messages
            ) as stream:
                async for text in stream.text_stream:
                    yield text
                    
        except Exception as e:
            logger.error(f"Anthropic streaming error: {e}")
            raise
