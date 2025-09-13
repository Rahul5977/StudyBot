#!/bin/bash

# StudyBuddy Day 2 - Complete Setup Script

echo "🚀 Setting up StudyBuddy Day 2 (RAG Pipeline + Chat)"
echo "=================================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning "No .env file found. Creating from template..."
    cp .env.example .env
    print_warning "Please edit .env file and add your OPENAI_API_KEY"
fi

# Check for OpenAI API key
if ! grep -q "^OPENAI_API_KEY=sk-" .env 2>/dev/null; then
    print_error "OpenAI API key not found in .env file!"
    print_warning "Please add your OpenAI API key to the .env file:"
    print_warning "OPENAI_API_KEY=sk-your-key-here"
    echo
fi

# Start Qdrant vector database
print_status "Starting Qdrant vector database..."
docker run -d \
    --name studybuddy-qdrant \
    -p 6333:6333 \
    -v qdrant_storage:/qdrant/storage \
    qdrant/qdrant:latest

if [ $? -eq 0 ]; then
    print_success "Qdrant started successfully on port 6333"
else
    print_warning "Qdrant container might already be running"
fi

# Wait for Qdrant to be ready
print_status "Waiting for Qdrant to be ready..."
sleep 5

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    print_status "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install Python dependencies
print_status "Installing Python dependencies..."
pip install -r requirements.txt

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p storage/uploads
mkdir -p docs
mkdir -p logs

# Start backend
print_status "Starting StudyBuddy backend..."
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
print_status "Waiting for backend to start..."
sleep 10

# Check backend health
if curl -s http://localhost:8000/ping > /dev/null; then
    print_success "Backend is running on http://localhost:8000"
else
    print_error "Backend failed to start"
    exit 1
fi

# Install frontend dependencies and start
print_status "Setting up frontend..."
cd frontend

if [ ! -d "node_modules" ]; then
    print_status "Installing Node.js dependencies..."
    npm install
fi

print_status "Starting frontend..."
npm start &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
print_status "Waiting for frontend to start..."
sleep 10

print_success "StudyBuddy Day 2 setup complete!"
echo
echo "🌟 What's Available:"
echo "   📝 Frontend: http://localhost:3000"
echo "   🔧 Backend API: http://localhost:8000"
echo "   📚 API Docs: http://localhost:8000/docs"
echo "   🗄️  Qdrant: http://localhost:6333"
echo
echo "🎯 Features:"
echo "   ✅ Document upload (PDF/Excel)"
echo "   ✅ Vector embeddings & search"
echo "   ✅ AI chat with RAG pipeline"
echo "   ✅ Agent step visualization"
echo "   ✅ Interaction logging"
echo
echo "📋 Next Steps:"
echo "   1. Upload documents via the web interface"
echo "   2. Switch to 'AI Chat' tab"
echo "   3. Ask questions about your documents"
echo "   4. Watch the agent steps visualization"
echo
echo "🛑 To stop services:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo "   docker stop studybuddy-qdrant"

# Keep script running
wait
