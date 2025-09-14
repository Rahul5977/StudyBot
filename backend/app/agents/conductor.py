"""
ConductorAgent: Orchestrates multi-agent workflows using LangGraph
"""
import json
import logging
from typing import List, Dict, Any, Optional, Annotated
from langgraph.graph import StateGraph, END
from langgraph.graph.message import AnyMessage, add_messages
from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage, AIMessage
from .planner import PlannerAgent
from .search_agent import SearchAgent
from ..services.simple_rag import SimpleRAGPipeline
from ..core.config import settings

logger = logging.getLogger(__name__)

class StudyBuddyState:
    """State management for the multi-agent workflow"""
    def __init__(self):
        self.messages: Annotated[List[AnyMessage], add_messages] = []
        self.user_query: str = ""
        self.intent: str = ""  # "plan", "chat", "search", "help"
        self.context_chunks: List[str] = []
        self.search_results: List[Dict] = []
        self.study_plan: Optional[Dict] = None
        self.final_response: str = ""
        self.step_log: List[Dict] = []

class ConductorAgent:
    def __init__(self):
        self.llm = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0.3,
            openai_api_key=settings.openai_api_key
        )
        self.planner = PlannerAgent()
        self.search_agent = SearchAgent()
        self.rag = SimpleRAGPipeline()
        self.workflow = self._build_workflow()

    def _build_workflow(self) -> StateGraph:
        """Build the LangGraph workflow"""
        workflow = StateGraph(dict)
        
        # Add nodes
        workflow.add_node("analyze_intent", self._analyze_intent)
        workflow.add_node("retrieve_context", self._retrieve_context)
        workflow.add_node("web_search", self._web_search)
        workflow.add_node("create_plan", self._create_plan)
        workflow.add_node("generate_response", self._generate_response)
        
        # Add edges
        workflow.set_entry_point("analyze_intent")
        
        # Intent-based routing
        workflow.add_conditional_edges(
            "analyze_intent",
            self._route_by_intent,
            {
                "plan": "retrieve_context",
                "search": "web_search", 
                "chat": "retrieve_context",
                "help": "generate_response"
            }
        )
        
        workflow.add_edge("retrieve_context", "create_plan")
        workflow.add_edge("web_search", "create_plan")
        workflow.add_edge("create_plan", "generate_response")
        workflow.add_edge("generate_response", END)
        
        return workflow.compile()

    def _analyze_intent(self, state: Dict) -> Dict:
        """Analyze user intent from the query"""
        try:
            user_query = state.get("user_query", "")
            
            system_prompt = """Analyze the user's query and determine their intent. Respond with one of:
- "plan": User wants to create or modify a study plan
- "search": User wants to search for information or resources
- "chat": User wants to have a conversation or ask questions about their documents
- "help": User needs general help or guidance

Consider these examples:
- "Create a study plan for machine learning" -> "plan"
- "Find resources about Python programming" -> "search"
- "What does this document say about neural networks?" -> "chat"
- "How do I use this application?" -> "help"

Respond with only the intent category."""

            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=f"Query: {user_query}")
            ]
            
            response = self.llm.invoke(messages)
            intent = response.content.strip().lower()
            
            # Validate intent
            valid_intents = ["plan", "search", "chat", "help"]
            if intent not in valid_intents:
                intent = "chat"  # Default fallback
            
            state["intent"] = intent
            state["step_log"].append({
                "step": "analyze_intent",
                "result": f"Detected intent: {intent}",
                "details": {"query": user_query, "intent": intent}
            })
            
            logger.info(f"Analyzed intent: {intent} for query: {user_query}")
            return state
            
        except Exception as e:
            logger.error(f"Error analyzing intent: {str(e)}")
            state["intent"] = "chat"
            return state

    def _route_by_intent(self, state: Dict) -> str:
        """Route based on detected intent"""
        intent = state.get("intent", "chat")
        logger.info(f"Routing to: {intent}")
        return intent

    async def _retrieve_context(self, state: Dict) -> Dict:
        """Retrieve relevant context from documents"""
        try:
            user_query = state.get("user_query", "")
            
            # Use RAG to get relevant chunks
            import asyncio
            if asyncio.iscoroutinefunction(self.rag.process_query):
                result = await self.rag.process_query(user_query)
            else:
                result = self.rag.process_query(user_query)
            
            if result["success"] and result["context_chunks"]:
                state["context_chunks"] = result["context_chunks"]
                state["step_log"].append({
                    "step": "retrieve_context",
                    "result": f"Retrieved {len(result['context_chunks'])} relevant chunks",
                    "details": {"num_chunks": len(result["context_chunks"])}
                })
            else:
                state["context_chunks"] = []
                state["step_log"].append({
                    "step": "retrieve_context",
                    "result": "No relevant context found in documents",
                    "details": {"reason": result.get("error", "No documents")}
                })
            
            return state
            
        except Exception as e:
            logger.error(f"Error retrieving context: {str(e)}")
            state["context_chunks"] = []
            return state

    def _web_search(self, state: Dict) -> Dict:
        """Perform web search for additional information"""
        try:
            user_query = state.get("user_query", "")
            
            search_result = self.search_agent.search_topic(user_query)
            
            if search_result["success"]:
                state["search_results"] = search_result["results"]
                state["step_log"].append({
                    "step": "web_search",
                    "result": f"Found {len(search_result['results'])} web results",
                    "details": {
                        "query": user_query,
                        "num_results": len(search_result["results"]),
                        "answer": search_result.get("answer", "")
                    }
                })
            else:
                state["search_results"] = []
                state["step_log"].append({
                    "step": "web_search",
                    "result": "Web search failed",
                    "details": {"error": search_result.get("error", "Unknown error")}
                })
            
            return state
            
        except Exception as e:
            logger.error(f"Error in web search: {str(e)}")
            state["search_results"] = []
            return state

    def _create_plan(self, state: Dict) -> Dict:
        """Create study plan if needed"""
        try:
            intent = state.get("intent", "")
            user_query = state.get("user_query", "")
            context_chunks = state.get("context_chunks", [])
            
            if intent == "plan":
                plan_result = self.planner.create_study_plan(
                    topic=user_query,
                    context_chunks=context_chunks
                )
                
                if plan_result["success"]:
                    state["study_plan"] = plan_result["plan"]
                    state["step_log"].append({
                        "step": "create_plan",
                        "result": "Study plan created successfully",
                        "details": {"plan_title": plan_result["plan"].get("title", "Untitled Plan")}
                    })
                else:
                    state["study_plan"] = None
                    state["step_log"].append({
                        "step": "create_plan",
                        "result": "Failed to create study plan",
                        "details": {"error": plan_result.get("error", "Unknown error")}
                    })
            else:
                state["step_log"].append({
                    "step": "create_plan",
                    "result": "Skipped - not a planning request",
                    "details": {"intent": intent}
                })
            
            return state
            
        except Exception as e:
            logger.error(f"Error creating plan: {str(e)}")
            state["study_plan"] = None
            return state

    def _generate_response(self, state: Dict) -> Dict:
        """Generate final response based on all gathered information"""
        try:
            intent = state.get("intent", "")
            user_query = state.get("user_query", "")
            context_chunks = state.get("context_chunks", [])
            search_results = state.get("search_results", [])
            study_plan = state.get("study_plan")
            
            # Build context for response generation
            context_text = ""
            if context_chunks:
                context_text += "\n\nRelevant information from your documents:\n" + "\n---\n".join(context_chunks[:3])
            
            if search_results:
                context_text += "\n\nWeb search results:\n"
                for result in search_results[:3]:
                    context_text += f"- {result.get('title', 'N/A')}: {result.get('content', 'N/A')[:200]}...\n"
            
            # Generate response based on intent
            if intent == "plan" and study_plan:
                response = self._format_plan_response(study_plan, context_text)
            elif intent == "search":
                response = self._format_search_response(search_results, user_query)
            elif intent == "help":
                response = self._format_help_response()
            else:
                response = self._format_chat_response(user_query, context_text)
            
            state["final_response"] = response
            state["step_log"].append({
                "step": "generate_response",
                "result": "Response generated successfully",
                "details": {"intent": intent, "response_length": len(response)}
            })
            
            return state
            
        except Exception as e:
            logger.error(f"Error generating response: {str(e)}")
            state["final_response"] = "I apologize, but I encountered an error generating a response. Please try again."
            return state

    def _format_plan_response(self, study_plan: Dict, context: str) -> str:
        """Format study plan response"""
        if isinstance(study_plan, dict) and "title" in study_plan:
            response = f"# {study_plan.get('title', 'Study Plan')}\n\n"
            response += f"**Overview:** {study_plan.get('overview', 'N/A')}\n\n"
            response += f"**Duration:** {study_plan.get('duration', 'N/A')}\n\n"
            response += f"**Difficulty:** {study_plan.get('difficulty', 'N/A')}\n\n"
            
            sections = study_plan.get('sections', [])
            if sections:
                response += "## Study Plan Sections:\n\n"
                for i, section in enumerate(sections, 1):
                    response += f"### {i}. {section.get('title', 'Section')}\n"
                    response += f"{section.get('description', '')}\n\n"
            
            if context:
                response += f"\n\n**Additional Context:**{context}"
            
            return response
        else:
            return f"I've created a study plan for you:\n\n{study_plan.get('content', str(study_plan))}"

    def _format_search_response(self, search_results: List[Dict], query: str) -> str:
        """Format search results response"""
        if not search_results:
            return f"I searched for information about '{query}' but didn't find relevant results. Please try a different search term."
        
        response = f"Here's what I found about '{query}':\n\n"
        for i, result in enumerate(search_results[:3], 1):
            response += f"**{i}. {result.get('title', 'N/A')}**\n"
            response += f"{result.get('content', 'N/A')[:300]}...\n"
            response += f"Source: {result.get('url', 'N/A')}\n\n"
        
        return response

    def _format_chat_response(self, query: str, context: str) -> str:
        """Format chat response"""
        system_prompt = """You are StudyBuddy AI, a helpful educational assistant. Provide clear, informative responses based on the available context. If you don't have enough information, say so and suggest alternatives."""
        
        user_prompt = f"Question: {query}{context}"
        
        try:
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt)
            ]
            
            response = self.llm.invoke(messages)
            return response.content
        except Exception as e:
            return f"I'd be happy to help with that question, but I encountered an error. Please try rephrasing your question."

    def _format_help_response(self) -> str:
        """Format help response"""
        return """# StudyBuddy AI Help

I'm here to help you with your studies! Here's what I can do:

**📚 Create Study Plans**
- Ask me to "create a study plan for [topic]"
- I'll generate a structured, comprehensive learning plan

**🔍 Search for Resources**
- Ask me to "find resources about [topic]"
- I'll search the web for educational materials, tutorials, and more

**💬 Answer Questions**
- Ask questions about your uploaded documents
- I'll provide answers based on your materials

**📖 Document Analysis**
- Upload PDFs, text files, or Excel documents
- I'll help you understand and study the content

Just ask me anything, and I'll do my best to help you learn effectively!"""

    async def process_query(self, user_query: str) -> Dict[str, Any]:
        """
        Process a user query through the multi-agent workflow
        
        Args:
            user_query: The user's question or request
            
        Returns:
            Complete response with steps and final answer
        """
        try:
            # Initialize state
            initial_state = {
                "user_query": user_query,
                "intent": "",
                "context_chunks": [],
                "search_results": [],
                "study_plan": None,
                "final_response": "",
                "step_log": []
            }
            
            # Run the workflow asynchronously
            logger.info(f"Processing query with multi-agent workflow: {user_query}")
            final_state = await self.workflow.ainvoke(initial_state)
            
            return {
                "success": True,
                "response": final_state["final_response"],
                "intent": final_state["intent"],
                "steps": final_state["step_log"],
                "study_plan": final_state.get("study_plan"),
                "search_results": final_state.get("search_results", []),
                "context_chunks": final_state.get("context_chunks", [])
            }
            
        except Exception as e:
            logger.error(f"Error in multi-agent workflow: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "response": "I apologize, but I encountered an error processing your request. Please try again.",
                "steps": []
            }
