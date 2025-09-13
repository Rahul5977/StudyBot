"""
Database layer - Qdrant vector store integration
"""
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from qdrant_client.http import models
from typing import List, Dict, Any, Optional
import uuid
import os
import logging

logger = logging.getLogger(__name__)

class QdrantDB:
    def __init__(self, host: str = "localhost", port: int = 6333, collection_name: str = "studybuddy_docs"):
        self.client = QdrantClient(host=host, port=port)
        self.collection_name = collection_name
        self.vector_size = 1536  # OpenAI ada-002 embedding size
        self._ensure_collection()
    
    def _ensure_collection(self):
        """Create collection if it doesn't exist"""
        try:
            collections = self.client.get_collections()
            collection_names = [col.name for col in collections.collections]
            
            if self.collection_name not in collection_names:
                self.client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=VectorParams(
                        size=self.vector_size,
                        distance=Distance.COSINE
                    )
                )
                logger.info(f"Created collection: {self.collection_name}")
            else:
                logger.info(f"Collection {self.collection_name} already exists")
        except Exception as e:
            logger.error(f"Error ensuring collection: {e}")
            raise
    
    def add_chunks(self, chunks: List[Dict[str, Any]], embeddings: List[List[float]], doc_id: str):
        """
        Add document chunks with embeddings to Qdrant
        
        Args:
            chunks: List of chunk dictionaries with metadata
            embeddings: List of embedding vectors
            doc_id: Document identifier
        """
        try:
            points = []
            for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
                point_id = str(uuid.uuid4())
                payload = {
                    "doc_id": doc_id,
                    "chunk_id": chunk.get("chunk_id", f"{doc_id}_chunk_{i}"),
                    "text": chunk.get("text", ""),
                    "page": chunk.get("page", None),
                    "metadata": chunk.get("metadata", {}),
                    "type": chunk.get("type", "text")
                }
                
                points.append(PointStruct(
                    id=point_id,
                    vector=embedding,
                    payload=payload
                ))
            
            self.client.upsert(
                collection_name=self.collection_name,
                points=points
            )
            
            logger.info(f"Added {len(points)} chunks for document {doc_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error adding chunks: {e}")
            raise
    
    def query_chunks(self, query_embedding: List[float], doc_id: Optional[str] = None, 
                    top_k: int = 5) -> List[Dict[str, Any]]:
        """
        Query similar chunks from Qdrant
        
        Args:
            query_embedding: Query vector
            doc_id: Optional document filter
            top_k: Number of results to return
            
        Returns:
            List of matching chunks with metadata
        """
        try:
            query_filter = None
            if doc_id:
                query_filter = models.Filter(
                    must=[
                        models.FieldCondition(
                            key="doc_id",
                            match=models.MatchValue(value=doc_id)
                        )
                    ]
                )
            
            results = self.client.search(
                collection_name=self.collection_name,
                query_vector=query_embedding,
                query_filter=query_filter,
                limit=top_k,
                with_payload=True,
                score_threshold=0.5  # Minimum similarity threshold
            )
            
            chunks = []
            for result in results:
                chunk = {
                    "id": result.id,
                    "score": result.score,
                    "text": result.payload.get("text", ""),
                    "page": result.payload.get("page"),
                    "chunk_id": result.payload.get("chunk_id"),
                    "metadata": result.payload.get("metadata", {}),
                    "type": result.payload.get("type", "text")
                }
                chunks.append(chunk)
            
            logger.info(f"Retrieved {len(chunks)} chunks for query (doc_id: {doc_id})")
            return chunks
            
        except Exception as e:
            logger.error(f"Error querying chunks: {e}")
            raise
    
    def delete_document(self, doc_id: str):
        """Delete all chunks for a document"""
        try:
            self.client.delete(
                collection_name=self.collection_name,
                points_selector=models.FilterSelector(
                    filter=models.Filter(
                        must=[
                            models.FieldCondition(
                                key="doc_id",
                                match=models.MatchValue(value=doc_id)
                            )
                        ]
                    )
                )
            )
            logger.info(f"Deleted document {doc_id}")
            return True
        except Exception as e:
            logger.error(f"Error deleting document {doc_id}: {e}")
            raise

# Global instance
qdrant_db = QdrantDB()
