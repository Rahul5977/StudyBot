"""
RAG Pipeline using LangChain + LangGraph
"""
from typing import Dict, List, Any, Optional
from langchain.schema import BaseMessage, HumanMessage, AIMessage
from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from typing_extensions import Annotated, TypedDict
import logging

from ..core.db import qdrant_db
from ..core.embeddings import get_embeddings_service
from ..core.config import settings
from ..core.logger import interaction_logger

logger = logging.getLogger(__name__)

class RAGState(TypedDict):
    """State for the RAG pipeline graph"""
    messages: Annotated[List[BaseMessage], add_messages]
    query: str
    context_chunks: List[Dict[str, Any]]
    response: str
    agent_steps: List[Dict[str, Any]]
    session_id: str

class StudyBuddyRAG:
    """Main RAG pipeline using LangGraph"""
    
    def __init__(self):
        self.llm = ChatOpenAI(
            model="gpt-3.5-turbo",
            temperature=0.7,
            api_key=settings.openai_api_key
        )
        self.graph = self._build_graph()
    
    def _build_graph(self) -> StateGraph:
        """Build the LangGraph workflow"""
        
        def retrieve_context(state: RAGState) -> RAGState:
            """Retrieve relevant context chunks"""
            query = state["query"]
            steps = state.get("agent_steps", [])
            
            # Add step
            steps.append({
                "step": "retrieve_context",
                "action": "Embedding query and searching vector store",
                "status": "running"
            })
            
            try:
                # Get query embedding
                embeddings_service = get_embeddings_service()
                query_embedding = embeddings_service.embed_query(query)
                
                # Search vector store
                chunks = qdrant_db.query_chunks(
                    query_embedding=query_embedding,
                    top_k=settings.max_context_chunks
                )
                
                # Update step
                steps[-1].update({
                    "status": "completed",
                    "result": f"Retrieved {len(chunks)} relevant chunks"
                })
                
                return {
                    **state,
                    "context_chunks": chunks,
                    "agent_steps": steps
                }
                
            except Exception as e:
                logger.error(f"Error in retrieve_context: {e}")
                steps[-1].update({
                    "status": "error",
                    "error": str(e)
                })
                return {
                    **state,
                    "context_chunks": [],
                    "agent_steps": steps
                }
        
        def generate_response(state: RAGState) -> RAGState:
            """Generate response using LLM with context"""
            query = state["query"]
            chunks = state["context_chunks"]
            steps = state.get("agent_steps", [])
            
            # Add step
            steps.append({
                "step": "generate_response",
                "action": "Generating response with retrieved context",
                "status": "running"
            })
            
            try:
                # Build context from chunks
                context_text = "\n\n".join([
                    f"[Source: Page {chunk.get('page', 'N/A')}]\n{chunk.get('text', '')}"
                    for chunk in chunks
                ])
                
                # Create prompt
                prompt = PromptTemplate(
                    template="""You are StudyBuddy, an AI tutor that helps students learn from their documents.

Context from the student's documents:
{context}

Student's Question: {query}

Instructions:
1. Answer the question using the provided context
2. If the context doesn't contain enough information, say so
3. Be clear, educational, and encouraging
4. Cite page numbers when relevant
5. Suggest follow-up questions to deepen understanding

Answer:""",
                    input_variables=["context", "query"]
                )
                
                # Generate response
                formatted_prompt = prompt.format(context=context_text, query=query)
                response = self.llm.invoke([HumanMessage(content=formatted_prompt)])
                
                # Update step
                steps[-1].update({
                    "status": "completed",
                    "result": "Response generated successfully"
                })
                
                return {
                    **state,
                    "response": response.content,
                    "agent_steps": steps
                }
                
            except Exception as e:
                logger.error(f"Error in generate_response: {e}")
                steps[-1].update({
                    "status": "error",
                    "error": str(e)
                })
                return {
                    **state,
                    "response": "I'm sorry, I encountered an error generating a response.",
                    "agent_steps": steps
                }
        
        def log_interaction(state: RAGState) -> RAGState:
            """Log the complete interaction"""
            steps = state.get("agent_steps", [])
            
            steps.append({
                "step": "log_interaction",
                "action": "Logging interaction for analysis",
                "status": "running"
            })
            
            try:
                interaction_logger.log_interaction(
                    session_id=state.get("session_id", "unknown"),
                    query=state["query"],
                    response=state["response"],
                    context_chunks=state["context_chunks"],
                    agent_steps=steps
                )
                
                steps[-1].update({
                    "status": "completed",
                    "result": "Interaction logged successfully"
                })
                
            except Exception as e:
                logger.error(f"Error in log_interaction: {e}")
                steps[-1].update({
                    "status": "error",
                    "error": str(e)
                })
            
            return {
                **state,
                "agent_steps": steps
            }
        
        # Build graph
        workflow = StateGraph(RAGState)
        
        # Add nodes
        workflow.add_node("retrieve_context", retrieve_context)
        workflow.add_node("generate_response", generate_response)
        workflow.add_node("log_interaction", log_interaction)
        
        # Add edges
        workflow.set_entry_point("retrieve_context")
        workflow.add_edge("retrieve_context", "generate_response")
        workflow.add_edge("generate_response", "log_interaction")
        workflow.add_edge("log_interaction", END)
        
        return workflow.compile()
    
    async def chat(self, query: str, session_id: str = "default") -> Dict[str, Any]:
        """
        Process a chat query through the RAG pipeline
        
        Args:
            query: User's question
            session_id: Session identifier
            
        Returns:
            Dictionary with response and metadata
        """
        try:
            # Initialize state
            initial_state = RAGState(
                messages=[HumanMessage(content=query)],
                query=query,
                context_chunks=[],
                response="",
                agent_steps=[],
                session_id=session_id
            )
            
            # Run the graph
            final_state = await self.graph.ainvoke(initial_state)
            
            return {
                "response": final_state["response"],
                "context_chunks": final_state["context_chunks"],
                "agent_steps": final_state["agent_steps"],
                "session_id": session_id
            }
            
        except Exception as e:
            logger.error(f"Error in RAG pipeline: {e}")
            return {
                "response": "I'm sorry, I encountered an error processing your question.",
                "context_chunks": [],
                "agent_steps": [
                    {
                        "step": "error",
                        "action": "Processing query",
                        "status": "error",
                        "error": str(e)
                    }
                ],
                "session_id": session_id
            }

# Global instance
rag_pipeline = StudyBuddyRAG()
