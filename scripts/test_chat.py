"""
Test script for StudyBuddy RAG pipeline
"""
import asyncio
import requests
import json
import os
import sys
from pathlib import Path

# Add backend app to path
sys.path.append(str(Path(__file__).parent.parent / "backend"))

async def test_chat_pipeline():
    """Test the complete RAG pipeline"""
    
    # Test data
    test_query = "What is machine learning?"
    
    print("🧪 Testing StudyBuddy RAG Pipeline\n")
    
    # 1. Test health check
    print("1. Testing health check...")
    try:
        response = requests.get("http://localhost:8000/ping")
        if response.status_code == 200:
            print("✅ Backend is running")
        else:
            print("❌ Backend health check failed")
            return
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend. Make sure it's running on localhost:8000")
        return
    
    # 2. Test chat health
    print("\n2. Testing chat system health...")
    try:
        response = requests.get("http://localhost:8000/api/chat/health")
        if response.status_code == 200:
            print("✅ Chat system is healthy")
            print(f"   Status: {response.json()}")
        else:
            print("❌ Chat system health check failed")
    except requests.exceptions.RequestException as e:
        print(f"❌ Chat health check error: {e}")
    
    # 3. Test chat query
    print(f"\n3. Testing chat query: '{test_query}'")
    try:
        chat_data = {
            "query": test_query,
            "session_id": "test_session_123"
        }
        
        response = requests.post(
            "http://localhost:8000/api/chat",
            json=chat_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Chat query successful!")
            print(f"   Response: {result['response'][:100]}...")
            print(f"   Context chunks: {len(result['context_chunks'])}")
            print(f"   Agent steps: {len(result['agent_steps'])}")
            print(f"   Session ID: {result['session_id']}")
            
            # Print agent steps
            print("\n   🔄 Agent Steps:")
            for i, step in enumerate(result['agent_steps'], 1):
                status_emoji = "✅" if step['status'] == 'completed' else "⏳" if step['status'] == 'running' else "❌"
                print(f"   {i}. {status_emoji} {step['step']}: {step.get('action', 'N/A')}")
                if step.get('result'):
                    print(f"      Result: {step['result']}")
                if step.get('error'):
                    print(f"      Error: {step['error']}")
            
        else:
            print(f"❌ Chat query failed with status {response.status_code}")
            print(f"   Error: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Chat query error: {e}")
    
    # 4. Test chat logs
    print("\n4. Testing chat logs retrieval...")
    try:
        response = requests.get("http://localhost:8000/api/chat/logs?limit=5")
        if response.status_code == 200:
            logs = response.json()
            print(f"✅ Retrieved {logs['total']} log entries")
        else:
            print(f"❌ Failed to retrieve logs: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Logs retrieval error: {e}")
    
    print("\n🎉 Test completed!")

def test_document_upload():
    """Test document upload functionality"""
    print("\n📤 Testing Document Upload")
    
    # Create a simple test PDF content (this is a mock - you'd need a real PDF for full testing)
    test_files_dir = Path(__file__).parent / "test_files"
    test_files_dir.mkdir(exist_ok=True)
    
    # Test with a simple text file as PDF (for demo purposes)
    test_content = """
    Machine Learning Basics
    
    Machine learning is a subset of artificial intelligence that enables computers to learn and improve from experience without being explicitly programmed.
    
    Types of Machine Learning:
    1. Supervised Learning
    2. Unsupervised Learning  
    3. Reinforcement Learning
    
    Applications include:
    - Image recognition
    - Natural language processing
    - Recommendation systems
    """
    
    print("ℹ️  Note: For full testing, upload a real PDF through the web interface")
    print(f"   Test content prepared: {len(test_content)} characters")

if __name__ == "__main__":
    print("StudyBuddy Test Suite")
    print("=" * 50)
    
    # Test document upload
    test_document_upload()
    
    # Test RAG pipeline
    asyncio.run(test_chat_pipeline())
    
    print("\n📝 Next Steps:")
    print("1. Upload a PDF document through the web interface")
    print("2. Wait for processing to complete")
    print("3. Try asking questions about the document content")
    print("4. Check the agent steps visualization in the frontend")
