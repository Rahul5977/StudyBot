"""
Simplified RAG Pipeline for StudyBuddy (Day 2)
Using basic OpenAI API without full LangChain dependencies
"""
from typing import Dict, List, Any, Optional
import logging
import uuid
import json
from datetime import datetime

from ..core.db import qdrant_db
from ..core.embeddings import embeddings_service
from ..core.config import settings
from ..core.logger import interaction_logger

logger = logging.getLogger(__name__)

class SimpleRAGPipeline:
    """Simplified RAG pipeline using direct OpenAI API calls"""
    
    def __init__(self):
        self.client = embeddings_service.client  # Reuse OpenAI client
    
    def _build_prompt(self, query: str, context_chunks: List[Dict[str, Any]]) -> str:
        """Build the prompt for the LLM"""
        
        # Build context from chunks
        context_text = "\n\n".join([
            f"[Source: Page {chunk.get('page', 'N/A')}]\n{chunk.get('text', '')}"
            for chunk in context_chunks
        ])
        
        prompt = f"""You are StudyBuddy, an AI tutor that helps students learn from their documents.

Context from the student's documents:
{context_text}

Student's Question: {query}

Instructions:
1. Answer the question using the provided context
2. If the context doesn't contain enough information, say so clearly
3. Be clear, educational, and encouraging
4. Cite page numbers when relevant
5. Suggest follow-up questions to deepen understanding
6. Break down complex concepts into simple steps

Answer:"""
        
        return prompt
    
    async def process_query(self, query: str, session_id: str = "default") -> Dict[str, Any]:
        """
        Process a query through the simplified RAG pipeline
        
        Args:
            query: User's question
            session_id: Session identifier
            
        Returns:
            Dictionary with response and metadata
        """
        agent_steps = []
        
        try:
            # Step 1: Retrieve context
            agent_steps.append({
                "step": "retrieve_context",
                "action": "Embedding query and searching vector store",
                "status": "running",
                "timestamp": datetime.now().isoformat()
            })
            
            # Get query embedding
            query_embedding = embeddings_service.embed_query(query)
            
            # Search vector store
            context_chunks = qdrant_db.query_chunks(
                query_embedding=query_embedding,
                top_k=settings.max_context_chunks
            )
            
            # Update step
            agent_steps[-1].update({
                "status": "completed",
                "result": f"Retrieved {len(context_chunks)} relevant chunks"
            })
            
            # Step 2: Generate response
            agent_steps.append({
                "step": "generate_response",
                "action": "Generating response with retrieved context",
                "status": "running",
                "timestamp": datetime.now().isoformat()
            })
            
            # Build prompt
            prompt = self._build_prompt(query, context_chunks)
            
            # Generate response using OpenAI Chat API
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are StudyBuddy, a helpful AI tutor."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=1000
            )
            
            ai_response = response.choices[0].message.content
            
            # Update step
            agent_steps[-1].update({
                "status": "completed",
                "result": "Response generated successfully"
            })
            
            # Step 3: Log interaction
            agent_steps.append({
                "step": "log_interaction",
                "action": "Logging interaction for analysis",
                "status": "running",
                "timestamp": datetime.now().isoformat()
            })
            
            try:
                interaction_logger.log_interaction(
                    session_id=session_id,
                    query=query,
                    response=ai_response,
                    context_chunks=context_chunks,
                    agent_steps=agent_steps
                )
                
                agent_steps[-1].update({
                    "status": "completed",
                    "result": "Interaction logged successfully"
                })
                
            except Exception as log_error:
                logger.error(f"Error logging interaction: {log_error}")
                agent_steps[-1].update({
                    "status": "error",
                    "error": str(log_error)
                })
            
            return {
                "response": ai_response,
                "context_chunks": context_chunks,
                "agent_steps": agent_steps,
                "session_id": session_id
            }
            
        except Exception as e:
            logger.error(f"Error in RAG pipeline: {e}")
            
            # Mark current step as failed
            if agent_steps:
                agent_steps[-1].update({
                    "status": "error",
                    "error": str(e)
                })
            
            return {
                "response": "I'm sorry, I encountered an error processing your question. Please try again.",
                "context_chunks": [],
                "agent_steps": agent_steps + [{
                    "step": "error_handling",
                    "action": "Processing error",
                    "status": "error",
                    "error": str(e),
                    "timestamp": datetime.now().isoformat()
                }],
                "session_id": session_id
            }

# Global instance
simple_rag_pipeline = SimpleRAGPipeline()
