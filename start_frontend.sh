#!/bin/bash

# StudyBuddy - Start Frontend Server

echo "Starting StudyBuddy Frontend..."

cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing Node.js dependencies..."
    npm install
fi

# Start React development server
echo "Starting React development server on http://localhost:3000"
npm start
