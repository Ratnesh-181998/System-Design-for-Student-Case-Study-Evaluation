# Enterprise ChatGPT System - Deployment Guide

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Production Deployment](#production-deployment)
4. [Configuration](#configuration)
5. [Monitoring](#monitoring)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- **Python**: 3.11 or higher
- **Node.js**: 18 or higher (optional, for frontend build tools)
- **PostgreSQL**: 14 or higher
- **Redis**: 7 or higher
- **Docker**: 24.0 or higher (for containerized deployment)
- **Git**: For version control

### API Keys Required
- **OpenAI API Key** (for GPT models) - Get from https://platform.openai.com
- **Anthropic API Key** (for Claude models) - Get from https://console.anthropic.com
- **AWS Credentials** (for S3 file storage) - Optional
- **Pinecone API Key** (for vector database) - Optional

---

## Local Development Setup

### Step 1: Clone and Setup Environment

```bash
# Navigate to project directory
cd c:\Users\rattu\Downloads\L22

# Create Python virtual environment
cd backend
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Step 2: Database Setup

#### Option A: Using Docker (Recommended)

```bash
# Start PostgreSQL and Redis using Docker Compose
docker-compose up -d postgres redis

# Wait for services to be healthy
docker-compose ps
```

#### Option B: Manual Installation

**PostgreSQL:**
```bash
# Install PostgreSQL (Windows)
# Download from: https://www.postgresql.org/download/windows/

# Create database
psql -U postgres
CREATE DATABASE chatgpt_db;
CREATE USER chatgpt_user WITH PASSWORD 'chatgpt_password';
GRANT ALL PRIVILEGES ON DATABASE chatgpt_db TO chatgpt_user;
\q
```

**Redis:**
```bash
# Install Redis (Windows)
# Download from: https://github.com/microsoftarchive/redis/releases

# Start Redis server
redis-server
```

### Step 3: Configure Environment Variables

Create `.env` file in the `backend` directory:

```env
# Application Settings
DEBUG=True
SECRET_KEY=dev-secret-key-change-in-production
WORKERS=4

# Database
DATABASE_URL=postgresql+asyncpg://chatgpt_user:chatgpt_password@localhost:5432/chatgpt_db

# Redis
REDIS_URL=redis://localhost:6379/0

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_MAX_TOKENS=4096
OPENAI_TEMPERATURE=0.7

# Anthropic Configuration (Optional)
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here
ANTHROPIC_MODEL=claude-3-opus-20240229

# AWS S3 (Optional - for file uploads)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
S3_BUCKET_NAME=chatgpt-files

# Vector Database (Optional - for RAG)
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_ENVIRONMENT=us-west1-gcp
PINECONE_INDEX_NAME=chatgpt-embeddings

# Rate Limiting
RATE_LIMIT_PER_MINUTE=60
RATE_LIMIT_PER_HOUR=1000

# CORS
ALLOWED_ORIGINS=["http://localhost:3000","http://localhost:5173","http://127.0.0.1:3000"]
```

### Step 4: Initialize Database

```bash
# Run database migrations
cd backend
alembic upgrade head

# Or create tables directly (for development)
python -c "from core.database import init_db; import asyncio; asyncio.run(init_db())"
```

### Step 5: Start the Backend Server

```bash
# From backend directory
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Server will start at: http://localhost:8000
# API docs available at: http://localhost:8000/api/docs
```

### Step 6: Start the Frontend

```bash
# Option 1: Simple HTTP server (Python)
cd frontend
python -m http.server 3000

# Option 2: Using Node.js http-server
npm install -g http-server
cd frontend
http-server -p 3000

# Frontend will be available at: http://localhost:3000
```

### Step 7: Verify Installation

1. **Check Backend Health:**
   ```bash
   curl http://localhost:8000/health
   ```
   Expected response: `{"status":"healthy","database":"connected","cache":"connected"}`

2. **Check API Documentation:**
   Open browser: http://localhost:8000/api/docs

3. **Check Frontend:**
   Open browser: http://localhost:3000

---

## Production Deployment

### Option 1: Docker Compose (Recommended for Small-Medium Scale)

```bash
# 1. Create production .env file
cp .env.example .env
# Edit .env with production values

# 2. Build and start all services
docker-compose up -d

# 3. Check logs
docker-compose logs -f

# 4. Access services
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# PGAdmin: http://localhost:5050 (optional)
```

### Option 2: Kubernetes (Recommended for Large Scale)

```bash
# 1. Create namespace
kubectl create namespace chatgpt

# 2. Create secrets
kubectl create secret generic chatgpt-secrets \
  --from-literal=database-url=postgresql://... \
  --from-literal=openai-api-key=sk-... \
  --from-literal=secret-key=... \
  -n chatgpt

# 3. Apply configurations
kubectl apply -f deployment/kubernetes/ -n chatgpt

# 4. Check deployment status
kubectl get pods -n chatgpt
kubectl get services -n chatgpt

# 5. Access application
kubectl port-forward svc/chatgpt-frontend 3000:80 -n chatgpt
```

### Option 3: Cloud Platform Specific

#### AWS Deployment

**Using ECS (Elastic Container Service):**
```bash
# 1. Build and push Docker image
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
docker build -t chatgpt-backend ./backend
docker tag chatgpt-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/chatgpt-backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/chatgpt-backend:latest

# 2. Create ECS task definition and service
aws ecs create-cluster --cluster-name chatgpt-cluster
aws ecs register-task-definition --cli-input-json file://ecs-task-definition.json
aws ecs create-service --cluster chatgpt-cluster --service-name chatgpt-service --task-definition chatgpt-task
```

**Using Lambda + API Gateway:**
```bash
# 1. Install Mangum for ASGI support
pip install mangum

# 2. Create Lambda handler
# See deployment/lambda/handler.py

# 3. Deploy using AWS SAM or Serverless Framework
sam deploy --guided
```

#### Azure Deployment

```bash
# 1. Create resource group
az group create --name chatgpt-rg --location eastus

# 2. Create container registry
az acr create --resource-group chatgpt-rg --name chatgptacr --sku Basic

# 3. Build and push image
az acr build --registry chatgptacr --image chatgpt-backend:latest ./backend

# 4. Deploy to Azure Container Instances
az container create \
  --resource-group chatgpt-rg \
  --name chatgpt-backend \
  --image chatgptacr.azurecr.io/chatgpt-backend:latest \
  --dns-name-label chatgpt-api \
  --ports 8000
```

#### GCP Deployment

```bash
# 1. Build and push to Container Registry
gcloud builds submit --tag gcr.io/PROJECT_ID/chatgpt-backend ./backend

# 2. Deploy to Cloud Run
gcloud run deploy chatgpt-backend \
  --image gcr.io/PROJECT_ID/chatgpt-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

---

## Configuration

### Environment-Specific Settings

#### Development
```env
DEBUG=True
LOG_LEVEL=DEBUG
WORKERS=1
ALLOWED_ORIGINS=["http://localhost:3000"]
```

#### Staging
```env
DEBUG=False
LOG_LEVEL=INFO
WORKERS=4
ALLOWED_ORIGINS=["https://staging.yourcompany.com"]
SENTRY_DSN=https://...@sentry.io/...
```

#### Production
```env
DEBUG=False
LOG_LEVEL=WARNING
WORKERS=8
ALLOWED_ORIGINS=["https://yourcompany.com"]
SENTRY_DSN=https://...@sentry.io/...
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=10
```

### SSL/TLS Configuration

**Using Nginx as Reverse Proxy:**

```nginx
server {
    listen 443 ssl http2;
    server_name yourcompany.com;

    ssl_certificate /etc/ssl/certs/yourcompany.crt;
    ssl_certificate_key /etc/ssl/private/yourcompany.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket support for streaming
    location /api/v1/chat/stream {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

---

## Monitoring

### Application Metrics

**Prometheus Configuration:**
```yaml
scrape_configs:
  - job_name: 'chatgpt-backend'
    static_configs:
      - targets: ['localhost:8000']
    metrics_path: '/metrics'
```

**Grafana Dashboard:**
- Import dashboard from `deployment/grafana/dashboard.json`
- Key metrics to monitor:
  - Request rate
  - Response latency (p50, p95, p99)
  - Error rate
  - Token usage
  - Database connection pool

### Logging

**Centralized Logging with ELK Stack:**

```yaml
# docker-compose.yml addition
elasticsearch:
  image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
  environment:
    - discovery.type=single-node
  ports:
    - "9200:9200"

logstash:
  image: docker.elastic.co/logstash/logstash:8.11.0
  volumes:
    - ./deployment/logstash/pipeline:/usr/share/logstash/pipeline
  ports:
    - "5000:5000"

kibana:
  image: docker.elastic.co/kibana/kibana:8.11.0
  ports:
    - "5601:5601"
```

### Health Checks

```bash
# Backend health
curl http://localhost:8000/health

# Database connectivity
curl http://localhost:8000/health/db

# Redis connectivity
curl http://localhost:8000/health/redis
```

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors

**Problem:** `sqlalchemy.exc.OperationalError: could not connect to server`

**Solution:**
```bash
# Check if PostgreSQL is running
docker-compose ps postgres
# Or on Windows:
sc query postgresql-x64-14

# Check connection string in .env
# Ensure DATABASE_URL format: postgresql+asyncpg://user:password@host:port/dbname

# Test connection manually
psql -h localhost -U chatgpt_user -d chatgpt_db
```

#### 2. Redis Connection Errors

**Problem:** `redis.exceptions.ConnectionError: Error connecting to Redis`

**Solution:**
```bash
# Check if Redis is running
docker-compose ps redis
# Or:
redis-cli ping

# Should return: PONG
```

#### 3. OpenAI API Errors

**Problem:** `openai.error.AuthenticationError: Invalid API key`

**Solution:**
```bash
# Verify API key is set correctly
echo $OPENAI_API_KEY  # Linux/Mac
echo %OPENAI_API_KEY%  # Windows

# Test API key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

#### 4. CORS Errors in Frontend

**Problem:** `Access to fetch at 'http://localhost:8000' from origin 'http://localhost:3000' has been blocked by CORS policy`

**Solution:**
```python
# In backend/main.py, ensure CORS middleware is configured:
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### 5. Port Already in Use

**Problem:** `Error: Port 8000 is already in use`

**Solution:**
```bash
# Windows - Find and kill process
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9
```

### Performance Optimization

#### Database Optimization
```sql
-- Create indexes for better query performance
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at);
```

#### Redis Caching
```python
# Cache frequently accessed data
# Example: Cache user profile for 1 hour
await redis.setex(f"user:{user_id}", 3600, json.dumps(user_data))
```

#### Connection Pooling
```python
# Adjust pool size based on load
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=10
```

---

## Security Checklist

- [ ] Change default SECRET_KEY in production
- [ ] Use strong database passwords
- [ ] Enable SSL/TLS for all connections
- [ ] Set up firewall rules (only allow necessary ports)
- [ ] Enable rate limiting
- [ ] Implement API key rotation
- [ ] Set up monitoring and alerting
- [ ] Regular security audits
- [ ] Keep dependencies updated
- [ ] Enable audit logging
- [ ] Implement backup strategy
- [ ] Set up disaster recovery plan

---

## Backup and Recovery

### Database Backup

```bash
# Automated daily backup
0 2 * * * pg_dump -U chatgpt_user chatgpt_db > /backups/chatgpt_$(date +\%Y\%m\%d).sql

# Restore from backup
psql -U chatgpt_user chatgpt_db < /backups/chatgpt_20240101.sql
```

### Redis Backup

```bash
# Enable AOF persistence in redis.conf
appendonly yes
appendfilename "appendonly.aof"

# Manual backup
redis-cli BGSAVE
```

---

## Support

For issues or questions:
- **Documentation**: See README.md
- **GitHub Issues**: Create an issue in the repository
- **Email**: support@yourcompany.com

---

**Last Updated:** 2024-11-24
**Version:** 1.0.0
