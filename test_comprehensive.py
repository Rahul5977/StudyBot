#!/usr/bin/env python3
"""
Complete test script for StudyBuddy AI RAG Pipeline
Tests document upload, chunking, embedding, retrieval, and chat functionality
"""

import requests
import json
from pathlib import Path

API_BASE = "http://localhost:8000/api"

def test_health_checks():
    """Test basic health endpoints"""
    print("🏥 Testing Health Checks")
    print("=" * 50)
    
    # Basic health
    try:
        response = requests.get("http://localhost:8000/ping")
        print(f"✅ Basic Health: {response.json()}")
    except Exception as e:
        print(f"❌ Basic Health Failed: {e}")
    
    # Chat health
    try:
        response = requests.get(f"{API_BASE}/chat/health")
        print(f"✅ Chat Health: {response.json()}")
    except Exception as e:
        print(f"❌ Chat Health Failed: {e}")

def test_chat_functionality():
    """Test chat with existing documents"""
    print("\n💬 Testing Chat Functionality")
    print("=" * 50)
    
    queries = [
        "What are the key features of StudyBuddy AI?",
        "What is informed search and how does it work?",
        "Explain the difference between blind search and informed search",
        "What is heuristic search?"
    ]
    
    for i, query in enumerate(queries, 1):
        print(f"\n{i}. Query: {query}")
        try:
            response = requests.post(
                f"{API_BASE}/chat",
                json={"query": query},
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Retrieved {len(data['context_chunks'])} chunks")
                print(f"   📝 Response length: {len(data['response'])} characters")
                print(f"   🔧 Agent steps: {len(data['agent_steps'])}")
                
                # Show context sources
                if data['context_chunks']:
                    sources = set()
                    for chunk in data['context_chunks']:
                        if 'metadata' in chunk and 'source_file' in chunk['metadata']:
                            sources.add(chunk['metadata']['source_file'])
                    print(f"   📚 Sources: {', '.join(sources)}")
                    
                    # Show top score
                    top_score = max(chunk['score'] for chunk in data['context_chunks'])
                    print(f"   🎯 Top similarity score: {top_score:.3f}")
                else:
                    print("   ⚠️  No context chunks retrieved")
            else:
                print(f"   ❌ Chat failed: {response.status_code} - {response.text}")
                
        except Exception as e:
            print(f"   ❌ Error: {e}")

def test_document_status():
    """Check status of uploaded documents"""
    print("\n📄 Testing Document Status")
    print("=" * 50)
    
    # Get some document IDs from the chat logs or try known ones
    doc_ids = [
        "7265956d-ff30-4883-b71d-a6ffdec9e397",  # test upload
        "394152fe-c90f-4143-8cba-39233a59f29e",  # PDF 1
        "6f27391b-c262-42fe-ad17-1f43bb949dff"   # PDF 2
    ]
    
    for doc_id in doc_ids:
        try:
            response = requests.get(f"{API_BASE}/documents/{doc_id}/status")
            if response.status_code == 200:
                status = response.json()
                print(f"✅ Document {doc_id[:8]}... Status: {status['status']}")
            else:
                print(f"❌ Document {doc_id[:8]}... Error: {response.status_code}")
        except Exception as e:
            print(f"❌ Error checking {doc_id[:8]}...: {e}")

def test_qdrant_direct():
    """Test Qdrant database directly"""
    print("\n🗄️ Testing Qdrant Database")
    print("=" * 50)
    
    try:
        response = requests.get("http://localhost:6333/collections/studybuddy_docs")
        data = response.json()
        result = data['result']
        print(f"✅ Collection Status: {result['status']}")
        print(f"📊 Points Count: {result['points_count']}")
        print(f"🔢 Indexed Vectors: {result['indexed_vectors_count']}")
        print(f"📏 Vector Size: {result['config']['params']['vectors']['size']}")
        print(f"📐 Distance Metric: {result['config']['params']['vectors']['distance']}")
    except Exception as e:
        print(f"❌ Qdrant Error: {e}")

def test_chat_logs():
    """Test chat logs endpoint"""
    print("\n📜 Testing Chat Logs")
    print("=" * 50)
    
    try:
        response = requests.get(f"{API_BASE}/chat/logs?limit=5")
        if response.status_code == 200:
            logs = response.json()
            print(f"✅ Retrieved {logs['total']} log entries")
            print(f"📝 Showing last {len(logs['interactions'])} interactions")
        else:
            print(f"❌ Logs failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Logs error: {e}")

def run_comprehensive_test():
    """Run all tests"""
    print("🚀 StudyBuddy AI - Comprehensive Test Suite")
    print("=" * 60)
    
    test_health_checks()
    test_qdrant_direct()
    test_document_status()
    test_chat_functionality()
    test_chat_logs()
    
    print("\n🎉 Test Suite Complete!")
    print("=" * 60)

if __name__ == "__main__":
    run_comprehensive_test()
