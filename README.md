# Enterprise ChatGPT-Like System

A production-ready, enterprise-grade conversational AI system similar to ChatGPT, built with modern technologies and best practices.

## 🌟 Features

### Core Capabilities
- **Real-time Chat Interface** - Streaming responses with beautiful UI
- **Multiple LLM Support** - OpenAI GPT-4, Claude 3, Azure OpenAI
- **RAG (Retrieval Augmented Generation)** - Knowledge base integration
- **File Upload & Analysis** - Process documents, PDFs, and more
- **Conversation Management** - Save, search, and organize chats
- **User Authentication** - Secure JWT-based auth with RBAC
- **Usage Tracking** - Monitor token usage and costs

### Enterprise Features
- **Multi-tenant Support** - Isolated data per organization
- **API Access** - RESTful API for integrations
- **Admin Dashboard** - User management and analytics
- **Rate Limiting** - Prevent abuse and ensure fair usage
- **Audit Logging** - Complete audit trail for compliance
- **SSO Integration** - SAML, OAuth2 support

## 🏗️ Architecture

![Systems Architecture Diagram](Systems%20Architecture%20Diagram.png)

*Visual representation of the complete system architecture with all layers and components.*

```
┌─────────────┐
│   Frontend  │  React/HTML+CSS+JS
│   (Web App) │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ API Gateway │  Load Balancing, Rate Limiting
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Backend   │  FastAPI (Python)
│   Services  │
└──────┬──────┘
       │
       ├──────► PostgreSQL (User Data, Messages)
       ├──────► Redis (Cache, Sessions)
       ├──────► Vector DB (Embeddings)
       ├──────► S3 (File Storage)
       └──────► LLM APIs (OpenAI, Anthropic)
```

## 📁 Project Structure

```
.
├── backend/
│   ├── main.py                 # FastAPI application entry point
│   ├── core/
│   │   ├── config.py          # Configuration settings
│   │   ├── database.py        # Database connection
│   │   ├── auth.py            # Authentication logic
│   │   └── middleware.py      # Custom middleware
│   ├── api/
│   │   └── routes/
│   │       ├── auth.py        # Auth endpoints
│   │       ├── chat.py        # Chat endpoints
│   │       ├── conversations.py
│   │       ├── users.py
│   │       └── admin.py
│   ├── models/
│   │   ├── user.py
│   │   ├── conversation.py
│   │   └── message.py
│   ├── schemas/
│   │   ├── auth.py
│   │   ├── chat.py
│   │   └── user.py
│   └── services/
│       ├── llm_service.py     # LLM integration
│       ├── rag_service.py     # RAG implementation
│       └── file_service.py    # File handling
│
├── frontend/
│   ├── index.html             # Main HTML
│   ├── styles.css             # Styling
│   └── app.js                 # JavaScript logic
│
├── deployment/
│   ├── docker-compose.yml     # Local development
│   ├── Dockerfile             # Container image
│   └── kubernetes/            # K8s manifests
│
├── docs/
│   └── ChatGPT_System_Design.md
│
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+ (for frontend build tools)
- PostgreSQL 14+
- Redis 7+
- OpenAI API Key or Anthropic API Key

### Backend Setup

1. **Clone the repository**
```bash
cd backend
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. **Initialize database**
```bash
alembic upgrade head
```

6. **Run the server**
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Open in browser**
```bash
# Simply open index.html in your browser
# Or use a local server:
python -m http.server 3000
```

3. **Access the application**
```
http://localhost:3000
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Application
DEBUG=False
SECRET_KEY=your-secret-key-here

# Database
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/chatgpt_db

# Redis
REDIS_URL=redis://localhost:6379/0

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4-turbo-preview

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# AWS S3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET_NAME=chatgpt-files

# Vector Database (Pinecone)
PINECONE_API_KEY=...
PINECONE_INDEX_NAME=chatgpt-embeddings
```

## 📊 API Documentation

Once the backend is running, access the interactive API documentation:

- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc

### Key Endpoints

#### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token

#### Chat
- `POST /api/v1/chat` - Send message (regular)
- `POST /api/v1/chat/stream` - Send message (streaming)
- `POST /api/v1/chat/upload` - Upload file
- `GET /api/v1/chat/{conversation_id}/messages` - Get messages

#### Conversations
- `GET /api/v1/conversations` - List conversations
- `POST /api/v1/conversations` - Create conversation
- `DELETE /api/v1/conversations/{id}` - Delete conversation

## 🎨 Frontend Features

### Modern UI/UX
- **Dark Theme** - Easy on the eyes with premium gradients
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Smooth Animations** - Polished micro-interactions
- **Streaming Responses** - Real-time token-by-token display
- **Code Highlighting** - Syntax highlighting for code blocks
- **File Attachments** - Drag-and-drop file uploads

### Keyboard Shortcuts
- `Enter` - Send message
- `Shift + Enter` - New line
- `Ctrl/Cmd + K` - New chat

## 🔒 Security

### Authentication
- JWT tokens with short expiration
- Refresh token rotation
- Password hashing with bcrypt
- Rate limiting per user

### Data Protection
- TLS 1.3 for all communications
- AES-256 encryption at rest
- PII detection and masking
- SQL injection prevention
- XSS protection

### Compliance
- GDPR compliant
- SOC 2 Type II ready
- Audit logging
- Data retention policies

## 📈 Monitoring & Observability

### Metrics
- Request latency (p50, p95, p99)
- Token usage per user
- Error rates
- Model performance
- Cost tracking

### Logging
- Structured JSON logging
- Centralized log aggregation
- Request/response logging
- Error tracking with Sentry

### Alerting
- High error rates
- Increased latency
- Quota exhaustion
- Security incidents

## 🚢 Deployment

### Docker

```bash
# Build image
docker build -t enterprise-chatgpt .

# Run with docker-compose
docker-compose up -d
```

### Kubernetes

```bash
# Apply manifests
kubectl apply -f deployment/kubernetes/

# Check status
kubectl get pods -n chatgpt
```

### Cloud Platforms
- **AWS**: ECS, EKS, Lambda
- **Azure**: AKS, Container Instances
- **GCP**: GKE, Cloud Run

## 🧪 Testing

```bash
# Run unit tests
pytest tests/unit

# Run integration tests
pytest tests/integration

# Run with coverage
pytest --cov=. --cov-report=html
```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.


## 🙏 Acknowledgments

- OpenAI for GPT models
- Anthropic for Claude models
- FastAPI framework
- React community



---

<img src="https://capsule-render.vercel.app/api?type=rect&color=gradient&customColorList=24,20,12,6&height=3" width="100%">


# 📞 **CONTACT & NETWORKING** 📞


### 💼 Professional Networks

[![LinkedIn](https://img.shields.io/badge/💼_LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/ratneshkumar1998/)
[![GitHub](https://img.shields.io/badge/🐙_GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Ratnesh-181998)
[![X](https://img.shields.io/badge/X-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/RatneshS16497)
[![Portfolio](https://img.shields.io/badge/🌐_Portfolio-FF6B6B?style=for-the-badge&logo=google-chrome&logoColor=white)](https://share.streamlit.io/user/ratnesh-181998)
[![Email](https://img.shields.io/badge/✉️_Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:rattudacsit2021gate@gmail.com)
[![Medium](https://img.shields.io/badge/Medium-000000?style=for-the-badge&logo=medium&logoColor=white)](https://medium.com/@rattudacsit2021gate)
[![Stack Overflow](https://img.shields.io/badge/Stack_Overflow-F58025?style=for-the-badge&logo=stack-overflow&logoColor=white)](https://stackoverflow.com/users/32068937/ratnesh-kumar)

### 🚀 AI/ML & Data Science
[![Streamlit](https://img.shields.io/badge/Streamlit-FF4B4B?style=for-the-badge&logo=streamlit&logoColor=white)](https://share.streamlit.io/user/ratnesh-181998)
[![HuggingFace](https://img.shields.io/badge/HuggingFace-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black)](https://huggingface.co/RattuDa98)
[![Kaggle](https://img.shields.io/badge/Kaggle-20BEFF?style=for-the-badge&logo=kaggle&logoColor=white)](https://www.kaggle.com/rattuda)

### 💻 Competitive Programming ( Including all coding plateform's 5000+ Problems/Questions solved )
[![LeetCode](https://img.shields.io/badge/LeetCode-FFA116?style=for-the-badge&logo=leetcode&logoColor=black)](https://leetcode.com/u/Ratnesh_1998/)
[![HackerRank](https://img.shields.io/badge/HackerRank-00EA64?style=for-the-badge&logo=hackerrank&logoColor=black)](https://www.hackerrank.com/profile/rattudacsit20211)
[![CodeChef](https://img.shields.io/badge/CodeChef-5B4638?style=for-the-badge&logo=codechef&logoColor=white)](https://www.codechef.com/users/ratnesh_181998)
[![Codeforces](https://img.shields.io/badge/Codeforces-1F8ACB?style=for-the-badge&logo=codeforces&logoColor=white)](https://codeforces.com/profile/Ratnesh_181998)
[![GeeksforGeeks](https://img.shields.io/badge/GeeksforGeeks-2F8D46?style=for-the-badge&logo=geeksforgeeks&logoColor=white)](https://www.geeksforgeeks.org/profile/ratnesh1998)
[![HackerEarth](https://img.shields.io/badge/HackerEarth-323754?style=for-the-badge&logo=hackerearth&logoColor=white)](https://www.hackerearth.com/@ratnesh138/)
[![InterviewBit](https://img.shields.io/badge/InterviewBit-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://www.interviewbit.com/profile/rattudacsit2021gate_d9a25bc44230/)

---

## 📊 **GitHub Stats & Metrics** 📊



![Profile Views](https://komarev.com/ghpvc/?username=Ratnesh-181998&color=blueviolet&style=for-the-badge&label=PROFILE+VIEWS)



<img 
  src="https://streak-stats.demolab.com?user=Ratnesh-181998&theme=radical&hide_border=true&background=0D1117&stroke=4ECDC4&ring=F38181&fire=FF6B6B&currStreakLabel=4ECDC4"
  alt="GitHub Streak Stats"
width="48%"/>


<img src="https://github-readme-activity-graph.vercel.app/graph?username=Ratnesh-181998&theme=react-dark&hide_border=true&bg_color=0D1117&color=4ECDC4&line=F38181&point=FF6B6B" width="48%" />

---

<img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&size=24&duration=3000&pause=1000&color=4ECDC4&center=true&vCenter=true&width=600&lines=Ratnesh+Kumar+Singh;Data+Scientist+%7C+AI%2FML+Engineer;4%2B+Years+Building+Production+AI+Systems" alt="Typing SVG" />

<img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&size=18&duration=2000&pause=1000&color=F38181&center=true&vCenter=true&width=600&lines=Built+with+passion+for+the+AI+Community+🚀;Innovating+the+Future+of+AI+%26+ML;MLOps+%7C+LLMOps+%7C+AIOps+%7C+GenAI+%7C+AgenticAI+Excellence" alt="Footer Typing SVG" />


<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=120&section=footer" width="100%">

    
