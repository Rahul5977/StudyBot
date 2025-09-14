"""
OpenAI embeddings wrapper for StudyBuddy
"""
from openai import OpenAI
from typing import List, Union
import logging
from .config import settings

logger = logging.getLogger(__name__)

class EmbeddingsService:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or settings.openai_api_key
        if not self.api_key:
            raise ValueError("OpenAI API key is required")
        
        self.client = OpenAI(api_key=self.api_key)
        self.model = "text-embedding-ada-002"
    
    def embed_text(self, text: str) -> List[float]:
        """
        Get embedding for a single text
        
        Args:
            text: Text to embed
            
        Returns:
            List of floats representing the embedding vector
        """
        try:
            response = self.client.embeddings.create(
                input=text,
                model=self.model
            )
            return response.data[0].embedding
        except Exception as e:
            logger.error(f"Error embedding text: {e}")
            raise
    
    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        """
        Get embeddings for multiple texts (batch processing)
        
        Args:
            texts: List of texts to embed
            
        Returns:
            List of embedding vectors
        """
        try:
            # Process in batches to avoid API limits
            batch_size = 100
            all_embeddings = []
            
            for i in range(0, len(texts), batch_size):
                batch = texts[i:i + batch_size]
                
                response = self.client.embeddings.create(
                    input=batch,
                    model=self.model
                )
                
                batch_embeddings = [data.embedding for data in response.data]
                all_embeddings.extend(batch_embeddings)
                
                logger.info(f"Processed batch {i//batch_size + 1}, embedded {len(batch)} texts")
            
            return all_embeddings
            
        except Exception as e:
            logger.error(f"Error embedding texts: {e}")
            raise
    
    def embed_query(self, query: str) -> List[float]:
        """
        Embed a query for similarity search
        Same as embed_text but with explicit naming for clarity
        """
        return self.embed_text(query)

# Global instance - lazy loaded
embeddings_service = None

def get_embeddings_service():
    """Get the global embeddings service instance (lazy loading)"""
    global embeddings_service
    if embeddings_service is None:
        embeddings_service = EmbeddingsService()
    return embeddings_service
