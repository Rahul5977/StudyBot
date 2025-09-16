"""
TutorAgent: Provides educational responses with source provenance
"""
import logging
from typing import List, Dict, Any, Optional
from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage
from ..core.config import settings
from ..services.simple_rag import SimpleRAGPipeline

logger = logging.getLogger(__name__)

class TutorAgent:
    """Agent responsible for providing educational responses with source citations"""
    
    def __init__(self):
        self.llm = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0.3,
            openai_api_key=settings.openai_api_key
        )
        self.rag = SimpleRAGPipeline()
    
    async def generate_response(self, query: str, context_chunks: List[Dict[str, Any]], doc_id: str = None) -> Dict[str, Any]:
        """
        Generate educational response with source provenance
        
        Args:
            query: User's question
            context_chunks: Retrieved context chunks with metadata
            doc_id: Optional document ID filter
            
        Returns:
            Dict containing response and source information
        """
        try:
            if not context_chunks:
                return {
                    "response": "I don't have enough context to answer that question. Please upload relevant documents or try a different question.",
                    "sources": [],
                    "confidence": 0.0
                }
            
            # Prepare context with source information
            context_with_sources = []
            sources = []
            
            for i, chunk in enumerate(context_chunks[:5]):  # Use top 5 chunks
                source_info = {
                    "id": i + 1,
                    "filename": chunk.get('filename', 'Unknown'),
                    "page": chunk.get('page', 'N/A'),
                    "section": chunk.get('section_title', ''),
                    "score": chunk.get('score', 0.0)
                }
                sources.append(source_info)
                
                context_text = f"[Source {i+1}: {source_info['filename']}, Page {source_info['page']}]\n{chunk.get('text', '')}"
                context_with_sources.append(context_text)
            
            combined_context = "\n\n".join(context_with_sources)
            
            # Create educational prompt
            prompt = f"""
You are StudyBuddy, an expert AI tutor. Your goal is to provide clear, educational responses that help students learn effectively.

Context from uploaded documents:
{combined_context}

Student's Question: {query}

Instructions:
1. Provide a comprehensive, educational answer based on the context
2. Explain concepts clearly with examples when helpful
3. When referencing information, cite sources using [Source X] format
4. If the context doesn't fully answer the question, say so and provide what you can
5. Encourage further learning and exploration
6. Be encouraging and supportive in your tone

Response:"""

            response = self.llm.invoke([
                SystemMessage(content="You are StudyBuddy, an expert AI tutor focused on helping students learn effectively. Always cite your sources and provide educational value."),
                HumanMessage(content=prompt)
            ])
            
            # Calculate confidence based on relevance scores
            avg_score = sum(chunk.get('score', 0.0) for chunk in context_chunks[:5]) / min(5, len(context_chunks))
            confidence = min(avg_score * 100, 95.0)  # Cap at 95%
            
            return {
                "response": response.content.strip(),
                "sources": sources,
                "confidence": round(confidence, 1),
                "context_chunks": context_chunks
            }
            
        except Exception as e:
            logger.error(f"Error in TutorAgent.generate_response: {e}")
            return {
                "response": "I encountered an error while processing your question. Please try again.",
                "sources": [],
                "confidence": 0.0
            }
    
    def extract_key_concepts(self, text: str) -> List[str]:
        """
        Extract key concepts from text for flashcard generation
        
        Args:
            text: Input text to analyze
            
        Returns:
            List of key concepts
        """
        try:
            prompt = f"""
Analyze the following text and extract 3-5 key concepts that would be important for a student to remember:

Text: {text}

Return only the key concepts as a simple list, one per line:
"""

            response = self.llm.invoke([
                SystemMessage(content="You are an expert educator identifying key learning concepts."),
                HumanMessage(content=prompt)
            ])
            
            # Parse concepts from response
            concepts = [
                line.strip().lstrip('- ').lstrip('• ')
                for line in response.content.strip().split('\n')
                if line.strip()
            ]
            
            return concepts[:5]  # Limit to 5 concepts
            
        except Exception as e:
            logger.error(f"Error extracting key concepts: {e}")
            return []
