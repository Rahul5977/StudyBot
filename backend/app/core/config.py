"""
Configuration settings for StudyBuddy
"""
import os
from pydantic_settings import BaseSettings
from typing import Optional
from dotenv import load_dotenv

# Load environment variables from .env file
# Look for .env file in the parent directory (project root)
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../../../.env"))

class Settings(BaseSettings):
    """Application settings"""
    
    # OpenAI
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    
    # Tavily (Web Search)
    tavily_api_key: str = os.getenv("TAVILY_API_KEY", "")
    
    # Qdrant
    qdrant_host: str = os.getenv("QDRANT_HOST", "localhost")
    qdrant_port: int = int(os.getenv("QDRANT_PORT", "6333"))
    qdrant_collection: str = os.getenv("QDRANT_COLLECTION", "studybuddy_docs")
    
    # App settings
    app_name: str = "StudyBuddy AI"
    app_version: str = "1.0.0"
    debug: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    # Upload settings
    max_file_size: int = 50 * 1024 * 1024  # 50MB
    upload_dir: str = "storage/uploads"
    
    # Chat settings
    max_context_chunks: int = 5
    chunk_overlap: int = 100
    chunk_size: int = 1000
    
    class Config:
        env_file = ".env"

settings = Settings()
