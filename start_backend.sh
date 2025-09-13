#!/bin/bash

# StudyBuddy - Start Backend Server

echo "Starting StudyBuddy Backend..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Start FastAPI server
echo "Starting FastAPI server on http://localhost:8000"
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
