"""
Chat API endpoints for StudyBuddy
"""
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uuid
import logging

from ..services.simple_rag import simple_rag_pipeline
from ..core.logger import interaction_logger
from ..core.embeddings import embeddings_service

logger = logging.getLogger(__name__)

router = APIRouter()

class ChatRequest(BaseModel):
    query: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    context_chunks: List[Dict[str, Any]]
    agent_steps: List[Dict[str, Any]]
    session_id: str

class LogsResponse(BaseModel):
    interactions: List[Dict[str, Any]]
    total: int

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    """
    Chat with StudyBuddy using simplified RAG pipeline
    """
    try:
        # Generate session ID if not provided
        session_id = request.session_id or str(uuid.uuid4())
        
        logger.info(f"Processing chat request for session {session_id}")
        
        # Process through simplified RAG pipeline
        result = await simple_rag_pipeline.process_query(
            query=request.query,
            session_id=session_id
        )
        
        return ChatResponse(
            response=result["response"],
            context_chunks=result["context_chunks"],
            agent_steps=result["agent_steps"],
            session_id=result["session_id"]
        )
        
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing chat request: {str(e)}"
        )

@router.get("/chat/logs", response_model=LogsResponse)
async def get_chat_logs(limit: int = 50):
    """
    Get recent chat interaction logs
    """
    try:
        interactions = interaction_logger.get_recent_interactions(limit=limit)
        
        return LogsResponse(
            interactions=interactions,
            total=len(interactions)
        )
        
    except Exception as e:
        logger.error(f"Error getting chat logs: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving chat logs: {str(e)}"
        )

@router.get("/chat/health")
async def chat_health():
    """
    Health check for chat system
    """
    try:
        # Basic health checks
        health_status = {
            "status": "healthy",
            "components": {
                "rag_pipeline": "ok",
                "vector_store": "ok", 
                "embeddings": "ok"
            },
            "pipeline_type": "simplified_rag"
        }
        
        # Test embeddings service
        try:
            test_embedding = embeddings_service.embed_text("test")
            if test_embedding and len(test_embedding) == 1536:
                health_status["components"]["embeddings"] = "ok"
            else:
                health_status["components"]["embeddings"] = "error"
                health_status["status"] = "degraded"
        except Exception as e:
            health_status["components"]["embeddings"] = f"error: {str(e)}"
            health_status["status"] = "degraded"
        
        # Test vector store connection
        try:
            from ..core.db import qdrant_db
            # Try a simple operation
            collections = qdrant_db.client.get_collections()
            health_status["components"]["vector_store"] = "ok"
        except Exception as e:
            health_status["components"]["vector_store"] = f"error: {str(e)}"
            health_status["status"] = "degraded"
        
        return health_status
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(
            status_code=503,
            detail=f"Chat system unhealthy: {str(e)}"
        )
