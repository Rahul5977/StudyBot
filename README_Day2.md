# StudyBuddy AI - Day 2 RAG Pipeline

AI-powered study companion with **RAG (Retrieval-Augmented Generation)** pipeline, featuring document processing, vector search, and intelligent chat with step-by-step agent visualization.

## 🚀 Day 2 Features

### ✅ Completed Features

- **Document Processing**: PDF and Excel upload with intelligent chunking
- **Vector Embeddings**: OpenAI embeddings with Qdrant vector store
- **RAG Pipeline**: Semantic search + AI chat with context
- **Agent Visualization**: Real-time step-by-step processing display
- **Interactive Chat**: Ask questions about your uploaded documents
- **Logging**: Complete interaction logging for analysis

### 🏗️ Architecture

```
StudyBuddy Day 2/
├── backend/                    # FastAPI + RAG Pipeline
│   ├── app/
│   │   ├── main.py            # FastAPI app with chat routes
│   │   ├── api/
│   │   │   ├── routes_docs.py # Document upload + processing
│   │   │   └── routes_chat.py # Chat endpoints
│   │   ├── core/
│   │   │   ├── config.py      # App configuration
│   │   │   ├── db.py          # Qdrant vector store integration
│   │   │   ├── embeddings.py  # OpenAI embeddings wrapper
│   │   │   └── logger.py      # Interaction logging
│   │   ├── services/
│   │   │   └── simple_rag.py  # RAG pipeline implementation
│   │   └── agents/
│   │       └── chunker.py     # Text chunking utilities
├── frontend/                   # React + Tailwind UI
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatBox.jsx         # Chat interface
│   │   │   ├── StepsVisualizer.jsx # Agent steps display
│   │   │   └── UploadForm.jsx      # Document upload
│   │   ├── pages/
│   │   │   └── Home.jsx            # Main app with tabs
│   │   └── utils/
│   │       └── api.js              # API client
├── docs/
│   ├── system_design.md       # Architecture documentation
│   └── interaction_logs.json  # Chat interaction logs
├── scripts/
│   └── test_chat.py          # RAG pipeline testing
├── docker-compose.yml        # Complete stack deployment
├── setup_day2.sh            # One-click setup script
└── .env.example             # Environment template
```

## 🛠️ Quick Start (Day 2)

### Option 1: One-Click Setup

```bash
# Clone and run complete setup
git clone <your-repo>
cd StudyBuddy
./setup_day2.sh
```

This script will:

- Set up Qdrant vector database
- Install all dependencies
- Start backend and frontend
- Display all service URLs

### Option 2: Docker Compose

```bash
# Add your OpenAI API key to .env
cp .env.example .env
# Edit .env and add: OPENAI_API_KEY=sk-your-key-here

# Start all services
docker-compose up -d

# Access the application
open http://localhost:3000
```

### Option 3: Manual Setup

1. **Environment Setup**

   ```bash
   cp .env.example .env
   # Add your OpenAI API key to .env
   ```

2. **Start Qdrant Vector Database**

   ```bash
   docker run -d --name qdrant -p 6333:6333 qdrant/qdrant:latest
   ```

3. **Backend Setup**

   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt

   cd backend
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

4. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

## 🎯 Usage Guide

### 1. Upload Documents

- Navigate to http://localhost:3000
- Click **"📤 Upload Documents"** tab
- Upload PDF or Excel files
- Documents are automatically chunked and embedded

### 2. Chat with Your Documents

- Switch to **"💬 AI Chat"** tab
- Ask questions about your uploaded content
- Watch the **agent steps visualization** in real-time:
  - 🔍 **Retrieve Context**: Searches vector store
  - 🧠 **Generate Response**: AI processes with context
  - 📝 **Log Interaction**: Saves for analysis

### 3. API Endpoints

#### Document Processing

- `POST /api/upload/pdf` - Upload and process PDF
- `POST /api/upload/excel` - Upload and process Excel
- `DELETE /api/documents/{doc_id}` - Delete document
- `GET /api/documents/{doc_id}/status` - Check processing status

#### Chat System

- `POST /api/chat` - Send chat message
- `GET /api/chat/logs` - Get interaction history
- `GET /api/chat/health` - System health check

### 4. Example Chat Flow

```json
POST /api/chat
{
  "query": "What is machine learning?",
  "session_id": "user_123"
}

Response:
{
  "response": "Machine learning is a subset of AI...",
  "context_chunks": [
    {
      "text": "ML chapter content...",
      "page": 5,
      "score": 0.89
    }
  ],
  "agent_steps": [
    {
      "step": "retrieve_context",
      "status": "completed",
      "result": "Retrieved 3 relevant chunks"
    },
    {
      "step": "generate_response",
      "status": "completed",
      "result": "Response generated successfully"
    }
  ],
  "session_id": "user_123"
}
```

## 🧪 Testing

### Backend Testing

```bash
# Test RAG pipeline
python scripts/test_chat.py

# Test API endpoints
curl http://localhost:8000/ping
curl http://localhost:8000/api/chat/health
```

### Upload Test Documents

1. Upload a PDF with educational content
2. Wait for processing (check backend logs)
3. Ask questions like:
   - "What are the main topics covered?"
   - "Explain [specific concept] from the document"
   - "What examples are provided?"

## 🔧 Configuration

### Environment Variables (.env)

```bash
# Required
OPENAI_API_KEY=sk-your-openai-api-key

# Optional
QDRANT_HOST=localhost
QDRANT_PORT=6333
CHUNK_SIZE=1000
CHUNK_OVERLAP=100
MAX_CONTEXT_CHUNKS=5
```

### Qdrant Vector Database

- **URL**: http://localhost:6333
- **Collection**: studybuddy_docs
- **Vector Size**: 1536 (OpenAI ada-002)

## 📊 Monitoring

### Logs and Analytics

- **Interaction Logs**: `docs/interaction_logs.json`
- **App Logs**: `logs/app.log`
- **Vector Store**: Browse at http://localhost:6333/dashboard

### Health Checks

- Backend: http://localhost:8000/ping
- Chat System: http://localhost:8000/api/chat/health
- Frontend: http://localhost:3000

## 🚀 What's New in Day 2

1. **RAG Pipeline**: Complete retrieval-augmented generation
2. **Vector Search**: Semantic similarity using OpenAI embeddings
3. **Agent Steps**: Visual workflow showing AI processing
4. **Qdrant Integration**: Production-ready vector database
5. **Enhanced UI**: Tabbed interface with chat and upload
6. **Comprehensive Logging**: Track all interactions
7. **Health Monitoring**: System status endpoints
8. **Docker Support**: Full containerization

## 🔄 Day 3+ Roadmap

- [ ] **Advanced LangGraph**: Multi-agent workflows
- [ ] **Study Plans**: AI-generated learning paths
- [ ] **Flashcards**: Automatic card generation
- [ ] **Progress Tracking**: Learning analytics
- [ ] **Multi-modal**: Image and video processing
- [ ] **Collaboration**: Shared study sessions

## 🛟 Troubleshooting

### Common Issues

1. **OpenAI API Key Missing**

   ```bash
   # Add to .env file
   OPENAI_API_KEY=sk-your-key-here
   ```

2. **Qdrant Connection Failed**

   ```bash
   # Restart Qdrant
   docker restart studybuddy-qdrant
   ```

3. **Frontend Build Errors**

   ```bash
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **No Chat Responses**
   - Ensure documents are uploaded first
   - Check backend logs for processing status
   - Verify OpenAI API key is valid

### Support

- Check logs in `logs/app.log`
- Monitor Qdrant at http://localhost:6333
- Test endpoints at http://localhost:8000/docs

---

**StudyBuddy AI Day 2** - Building intelligent learning with RAG pipelines! 🧠✨
