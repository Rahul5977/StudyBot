"""
Chat API endpoints for StudyBuddy
"""
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uuid
import logging

from ..services.simple_rag import simple_rag_pipeline
from ..agents.conductor import ConductorAgent
from ..core.logger import interaction_logger
from ..core.embeddings import get_embeddings_service

logger = logging.getLogger(__name__)

router = APIRouter()

class ChatRequest(BaseModel):
    query: str
    session_id: Optional[str] = None
    use_multi_agent: bool = True

class ChatResponse(BaseModel):
    response: str
    context_chunks: List[Dict[str, Any]]
    agent_steps: List[Dict[str, Any]]
    session_id: str
    intent: Optional[str] = None
    search_results: Optional[List[Dict[str, Any]]] = None
    study_plan: Optional[Dict[str, Any]] = None

class LogsResponse(BaseModel):
    interactions: List[Dict[str, Any]]
    total: int

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    """
    Chat with StudyBuddy using multi-agent orchestration or simplified RAG
    """
    try:
        # Generate session ID if not provided
        session_id = request.session_id or str(uuid.uuid4())
        
        logger.info(f"Processing chat request for session {session_id} (multi-agent: {request.use_multi_agent})")
        
        if request.use_multi_agent:
            # Use multi-agent orchestration
            conductor = ConductorAgent()
            result = await conductor.process_query(request.query)
            
            if result["success"]:
                # Log interaction
                interaction_logger.log_interaction(
                    session_id=session_id,
                    query=request.query,
                    response=result["response"],
                    context_chunks=result.get("context_chunks", []),
                    agent_steps=result.get("steps", [])
                )
                
                return ChatResponse(
                    response=result["response"],
                    context_chunks=result.get("context_chunks", []),
                    agent_steps=result.get("steps", []),
                    session_id=session_id,
                    intent=result.get("intent"),
                    search_results=result.get("search_results", []),
                    study_plan=result.get("study_plan")
                )
            else:
                raise HTTPException(
                    status_code=500,
                    detail=result.get("error", "Multi-agent processing failed")
                )
        else:
            # Use simplified RAG pipeline (legacy)
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
            embeddings_service = get_embeddings_service()
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
