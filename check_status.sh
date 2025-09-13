#!/bin/bash

echo "🚀 StudyBuddy Status Check"
echo "=========================="

# Check if backend is running
echo "📡 Backend Status:"
if curl -s http://localhost:8000/ping > /dev/null; then
    echo "✅ Backend is running on http://localhost:8000"
    echo "📚 API Documentation: http://localhost:8000/docs"
else
    echo "❌ Backend is not running"
fi

echo ""

# Check if frontend is running
echo "🌐 Frontend Status:"
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend is running on http://localhost:3000"
else
    echo "❌ Frontend is not running"
fi

echo ""

# Check if storage directory exists
echo "💾 Storage Status:"
if [ -d "backend/storage" ]; then
    echo "✅ Storage directory exists"
    echo "📁 Storage location: backend/storage/"
else
    echo "❌ Storage directory not found"
fi

echo ""

# Test API endpoints
echo "🔧 API Test:"
if curl -s http://localhost:8000/ping | grep -q "pong"; then
    echo "✅ Health check endpoint working"
else
    echo "❌ Health check endpoint failed"
fi

echo ""
echo "🎯 Ready to test file uploads!"
echo "Visit http://localhost:3000 to upload documents"
