"""
Logging utilities for StudyBuddy
"""
import json
import logging
import os
from datetime import datetime
from typing import Dict, Any, List
from .config import settings

class InteractionLogger:
    """Logger for chat interactions and RAG pipeline steps"""
    
    def __init__(self, log_file: str = "docs/interaction_logs.json"):
        self.log_file = log_file
        self._ensure_log_file()
    
    def _ensure_log_file(self):
        """Create log file if it doesn't exist"""
        os.makedirs(os.path.dirname(self.log_file), exist_ok=True)
        if not os.path.exists(self.log_file):
            with open(self.log_file, 'w') as f:
                json.dump([], f)
    
    def log_interaction(self, session_id: str, query: str, response: str, 
                       context_chunks: List[Dict], agent_steps: List[Dict]):
        """
        Log a complete chat interaction
        
        Args:
            session_id: Unique session identifier
            query: User's question
            response: AI's response
            context_chunks: Retrieved context chunks
            agent_steps: LangGraph agent execution steps
        """
        try:
            # Load existing logs
            with open(self.log_file, 'r') as f:
                logs = json.load(f)
            
            # Create new log entry
            log_entry = {
                "timestamp": datetime.now().isoformat(),
                "session_id": session_id,
                "query": query,
                "response": response,
                "context_chunks": [
                    {
                        "chunk_id": chunk.get("chunk_id"),
                        "text": chunk.get("text", "")[:200] + "...",  # Truncate for storage
                        "score": chunk.get("score"),
                        "page": chunk.get("page")
                    }
                    for chunk in context_chunks
                ],
                "agent_steps": agent_steps,
                "metadata": {
                    "num_chunks_retrieved": len(context_chunks),
                    "num_agent_steps": len(agent_steps)
                }
            }
            
            # Append and save
            logs.append(log_entry)
            
            # Keep only last 1000 interactions to manage file size
            if len(logs) > 1000:
                logs = logs[-1000:]
            
            with open(self.log_file, 'w') as f:
                json.dump(logs, f, indent=2)
                
            logging.info(f"Logged interaction for session {session_id}")
            
        except Exception as e:
            logging.error(f"Error logging interaction: {e}")
    
    def get_recent_interactions(self, limit: int = 50) -> List[Dict]:
        """Get recent interactions"""
        try:
            with open(self.log_file, 'r') as f:
                logs = json.load(f)
            return logs[-limit:] if logs else []
        except Exception as e:
            logging.error(f"Error reading logs: {e}")
            return []

# Configure logging
def setup_logging():
    """Setup application logging"""
    # Create logs directory first
    os.makedirs('logs', exist_ok=True)
    
    log_level = logging.DEBUG if settings.debug else logging.INFO
    
    logging.basicConfig(
        level=log_level,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(),
            logging.FileHandler('logs/app.log')
        ]
    )

# Global logger instance
interaction_logger = InteractionLogger()

# Standard logger for general application logging
logger = logging.getLogger("studybuddy")
logger.setLevel(logging.INFO)

# Create console handler if it doesn't exist
if not logger.handlers:
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
