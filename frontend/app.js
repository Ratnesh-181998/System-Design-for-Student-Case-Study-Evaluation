/**
 * Enterprise ChatGPT System - Frontend Application
 */

// Configuration
const API_BASE_URL = 'http://localhost:8000/api/v1';
let currentConversationId = null;
let currentUser = null;
let isStreaming = false;

// DOM Elements
const elements = {
    sidebar: document.getElementById('sidebar'),
    menuToggle: document.getElementById('menuToggle'),
    newChatBtn: document.getElementById('newChatBtn'),
    conversationsList: document.getElementById('conversationsList'),
    chatTitle: document.getElementById('chatTitle'),
    modelSelect: document.getElementById('modelSelect'),
    welcomeScreen: document.getElementById('welcomeScreen'),
    messagesContainer: document.getElementById('messagesContainer'),
    messageInput: document.getElementById('messageInput'),
    sendBtn: document.getElementById('sendBtn'),
    attachBtn: document.getElementById('attachBtn'),
    fileInput: document.getElementById('fileInput'),
    filePreview: document.getElementById('filePreview'),
    fileName: document.getElementById('fileName'),
    removeFile: document.getElementById('removeFile'),
    ragToggle: document.getElementById('ragToggle'),
    charCount: document.getElementById('charCount'),
    loadingIndicator: document.getElementById('loadingIndicator')
};

// Initialize Application
async function init() {
    console.log('🚀 Initializing Enterprise ChatGPT System...');
    
    // Check authentication
    const token = localStorage.getItem('access_token');
    if (!token) {
        // For demo purposes, we'll simulate a logged-in user
        simulateLogin();
    }
    
    // Load conversations
    await loadConversations();
    
    // Setup event listeners
    setupEventListeners();
    
    // Auto-resize textarea
    autoResizeTextarea();
    
    console.log('✅ Application initialized');
}

// Simulate login (for demo)
function simulateLogin() {
    currentUser = {
        id: 'demo-user-123',
        name: 'John Doe',
        email: 'john@company.com',
        plan: 'Pro Plan'
    };
    
    // In production, this would be a real JWT token
    localStorage.setItem('access_token', 'demo-token-123');
}

// Setup Event Listeners
function setupEventListeners() {
    // Menu toggle
    elements.menuToggle.addEventListener('click', () => {
        elements.sidebar.classList.toggle('open');
    });
    
    // New chat button
    elements.newChatBtn.addEventListener('click', startNewChat);
    
    // Message input
    elements.messageInput.addEventListener('input', (e) => {
        updateCharCount();
        updateSendButton();
        autoResizeTextarea();
    });
    
    elements.messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Send button
    elements.sendBtn.addEventListener('click', sendMessage);
    
    // File attachment
    elements.attachBtn.addEventListener('click', () => {
        elements.fileInput.click();
    });
    
    elements.fileInput.addEventListener('change', handleFileSelect);
    elements.removeFile.addEventListener('click', removeFile);
    
    // Capability cards
    document.querySelectorAll('.capability-card').forEach(card => {
        card.addEventListener('click', () => {
            const prompts = {
                0: "Help me brainstorm creative solutions for improving team productivity",
                1: "Analyze this dataset and provide insights",
                2: "Write a Python function to calculate fibonacci numbers",
                3: "Write a professional email to schedule a meeting"
            };
            const index = Array.from(card.parentElement.children).indexOf(card);
            elements.messageInput.value = prompts[index];
            updateCharCount();
            updateSendButton();
            elements.messageInput.focus();
        });
    });
}

// Load Conversations
async function loadConversations() {
    try {
        // In production, this would fetch from API
        const conversations = getDemoConversations();
        
        elements.conversationsList.innerHTML = '';
        
        conversations.forEach(conv => {
            const item = createConversationItem(conv);
            elements.conversationsList.appendChild(item);
        });
        
    } catch (error) {
        console.error('Error loading conversations:', error);
    }
}

// Create Conversation Item
function createConversationItem(conversation) {
    const div = document.createElement('div');
    div.className = 'conversation-item';
    div.dataset.id = conversation.id;
    
    div.innerHTML = `
        <svg class="conversation-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <span class="conversation-title">${conversation.title}</span>
        <span class="conversation-time">${conversation.time}</span>
    `;
    
    div.addEventListener('click', () => loadConversation(conversation.id));
    
    return div;
}

// Start New Chat
function startNewChat() {
    currentConversationId = null;
    elements.chatTitle.textContent = 'New Conversation';
    elements.messagesContainer.innerHTML = '';
    elements.welcomeScreen.style.display = 'flex';
    
    // Remove active class from all conversations
    document.querySelectorAll('.conversation-item').forEach(item => {
        item.classList.remove('active');
    });
    
    elements.messageInput.focus();
}

// Load Conversation
async function loadConversation(conversationId) {
    try {
        currentConversationId = conversationId;
        
        // Update UI
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.classList.toggle('active', item.dataset.id === conversationId);
        });
        
        // Hide welcome screen
        elements.welcomeScreen.style.display = 'none';
        
        // In production, fetch messages from API
        const messages = getDemoMessages(conversationId);
        
        // Display messages
        elements.messagesContainer.innerHTML = '';
        messages.forEach(msg => {
            appendMessage(msg.role, msg.content, false);
        });
        
        // Update title
        const conversation = getDemoConversations().find(c => c.id === conversationId);
        elements.chatTitle.textContent = conversation?.title || 'Conversation';
        
        // Scroll to bottom
        scrollToBottom();
        
    } catch (error) {
        console.error('Error loading conversation:', error);
    }
}

// Send Message
async function sendMessage() {
    const message = elements.messageInput.value.trim();
    
    if (!message || isStreaming) return;
    
    // Hide welcome screen
    elements.welcomeScreen.style.display = 'none';
    
    // Append user message
    appendMessage('user', message);
    
    // Clear input
    elements.messageInput.value = '';
    updateCharCount();
    updateSendButton();
    autoResizeTextarea();
    
    // Show typing indicator
    const typingIndicator = showTypingIndicator();
    
    try {
        isStreaming = true;
        
        // Get selected model
        const model = elements.modelSelect.value;
        const useRag = elements.ragToggle.checked;
        
        // In production, this would call the real API
        await simulateStreamingResponse(message, model, useRag);
        
    } catch (error) {
        console.error('Error sending message:', error);
        appendMessage('assistant', 'Sorry, I encountered an error. Please try again.');
    } finally {
        isStreaming = false;
        typingIndicator.remove();
    }
}

// Simulate Streaming Response (Demo)
async function simulateStreamingResponse(userMessage, model, useRag) {
    // Create assistant message container
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message assistant';
    
    messageDiv.innerHTML = `
        <div class="message-header">
            <div class="message-avatar">AI</div>
            <span class="message-role">Assistant</span>
            <span class="message-time">${getCurrentTime()}</span>
        </div>
        <div class="message-content"></div>
    `;
    
    elements.messagesContainer.appendChild(messageDiv);
    const contentDiv = messageDiv.querySelector('.message-content');
    
    // Simulate streaming
    const responses = {
        default: "I'm an AI assistant designed to help you with various tasks. I can help with creative problem-solving, data analysis, code generation, content creation, and much more. How can I assist you today?",
        code: "Here's a Python function to calculate Fibonacci numbers:\n\n```python\ndef fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)\n\n# More efficient iterative version\ndef fibonacci_iterative(n):\n    if n <= 1:\n        return n\n    a, b = 0, 1\n    for _ in range(2, n + 1):\n        a, b = b, a + b\n    return b\n```\n\nThe recursive version is simple but inefficient for large numbers. The iterative version is much faster!",
        analysis: "I'd be happy to help analyze your data! To provide the most accurate insights, I'll need:\n\n1. **Data Format**: What type of data do you have? (CSV, JSON, Excel, etc.)\n2. **Data Size**: How many records/rows?\n3. **Analysis Goals**: What specific insights are you looking for?\n4. **Key Metrics**: Which variables or metrics are most important?\n\nOnce you provide this information, I can help with statistical analysis, visualization recommendations, and actionable insights.",
    };
    
    let response = responses.default;
    if (userMessage.toLowerCase().includes('python') || userMessage.toLowerCase().includes('code')) {
        response = responses.code;
    } else if (userMessage.toLowerCase().includes('data') || userMessage.toLowerCase().includes('analyze')) {
        response = responses.analysis;
    }
    
    // Stream the response character by character
    let index = 0;
    const streamInterval = setInterval(() => {
        if (index < response.length) {
            contentDiv.textContent += response[index];
            index++;
            scrollToBottom();
        } else {
            clearInterval(streamInterval);
            
            // Format code blocks if present
            formatMessageContent(contentDiv);
        }
    }, 20);
    
    // Wait for streaming to complete
    await new Promise(resolve => {
        const checkComplete = setInterval(() => {
            if (index >= response.length) {
                clearInterval(checkComplete);
                resolve();
            }
        }, 100);
    });
}

// Append Message
function appendMessage(role, content, animate = true) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    if (animate) {
        messageDiv.style.animation = 'fadeIn 0.3s ease';
    }
    
    const avatar = role === 'user' ? 'You' : 'AI';
    const roleName = role === 'user' ? 'You' : 'Assistant';
    
    messageDiv.innerHTML = `
        <div class="message-header">
            <div class="message-avatar">${avatar}</div>
            <span class="message-role">${roleName}</span>
            <span class="message-time">${getCurrentTime()}</span>
        </div>
        <div class="message-content">${escapeHtml(content)}</div>
    `;
    
    elements.messagesContainer.appendChild(messageDiv);
    
    // Format code blocks
    const contentDiv = messageDiv.querySelector('.message-content');
    formatMessageContent(contentDiv);
    
    scrollToBottom();
    
    return messageDiv;
}

// Show Typing Indicator
function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'message assistant';
    indicator.innerHTML = `
        <div class="message-header">
            <div class="message-avatar">AI</div>
            <span class="message-role">Assistant</span>
        </div>
        <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;
    
    elements.messagesContainer.appendChild(indicator);
    scrollToBottom();
    
    return indicator;
}

// Format Message Content (code blocks, etc.)
function formatMessageContent(contentDiv) {
    let html = contentDiv.innerHTML;
    
    // Format code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        return `<pre><code>${escapeHtml(code.trim())}</code></pre>`;
    });
    
    // Format inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    contentDiv.innerHTML = html;
}

// File Handling
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Show file preview
    elements.filePreview.style.display = 'flex';
    elements.fileName.textContent = file.name;
    
    // In production, upload file to server
    console.log('File selected:', file.name);
}

function removeFile() {
    elements.fileInput.value = '';
    elements.filePreview.style.display = 'none';
    elements.fileName.textContent = '';
}

// Utility Functions
function updateCharCount() {
    const count = elements.messageInput.value.length;
    elements.charCount.textContent = `${count} / 4000`;
}

function updateSendButton() {
    const hasText = elements.messageInput.value.trim().length > 0;
    elements.sendBtn.disabled = !hasText || isStreaming;
}

function autoResizeTextarea() {
    elements.messageInput.style.height = 'auto';
    elements.messageInput.style.height = elements.messageInput.scrollHeight + 'px';
}

function scrollToBottom() {
    const container = document.querySelector('.chat-container');
    container.scrollTop = container.scrollHeight;
}

function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Demo Data
function getDemoConversations() {
    return [
        { id: '1', title: 'Python Data Analysis Help', time: '2h ago' },
        { id: '2', title: 'Marketing Strategy Ideas', time: '5h ago' },
        { id: '3', title: 'Code Review Request', time: '1d ago' },
        { id: '4', title: 'Email Template Creation', time: '2d ago' }
    ];
}

function getDemoMessages(conversationId) {
    const messages = {
        '1': [
            { role: 'user', content: 'Can you help me analyze a dataset in Python?' },
            { role: 'assistant', content: 'Of course! I\'d be happy to help you with Python data analysis. What kind of dataset are you working with, and what insights are you looking to extract?' }
        ],
        '2': [
            { role: 'user', content: 'I need ideas for a new marketing campaign' },
            { role: 'assistant', content: 'I can help you brainstorm marketing campaign ideas! To provide the most relevant suggestions, could you tell me:\n\n1. What product/service are you marketing?\n2. Who is your target audience?\n3. What\'s your budget range?\n4. What channels are you considering?' }
        ]
    };
    
    return messages[conversationId] || [];
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);
