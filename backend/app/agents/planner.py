"""
PlannerAgent: Creates structured study plans from user topics and context
"""
import json
import logging
from typing import List, Dict, Any, Optional
from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage
from ..core.config import settings

logger = logging.getLogger(__name__)

class PlannerAgent:
    def __init__(self):
        self.llm = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0.7,
            openai_api_key=settings.openai_api_key
        )

    def create_study_plan(self, topic: str, context_chunks: List[Dict[str, Any]] = None, user_preferences: Dict = None) -> Dict[str, Any]:
        """
        Create a structured study plan for the given topic
        
        Args:
            topic: The main topic/subject to create a plan for
            context_chunks: Relevant document chunks with metadata for additional context
            user_preferences: User preferences like difficulty, duration, style
            
        Returns:
            Structured study plan with sections, subsections, learning objectives, and source provenance
        """
        try:
            # Build context from chunks with source information
            context_text = ""
            source_pages = []
            
            if context_chunks:
                context_parts = []
                for chunk in context_chunks[:3]:  # Use top 3 chunks
                    filename = chunk.get('filename', 'Unknown')
                    page = chunk.get('page', 'N/A')
                    text = chunk.get('text', '')
                    
                    source_pages.append({
                        "filename": filename,
                        "page": page,
                        "section": chunk.get('section_title', '')
                    })
                    
                    context_parts.append(f"[From {filename}, Page {page}]\n{text}")
                
                context_text = "\n\nRelevant context from documents:\n" + "\n---\n".join(context_parts)
            
            # Build user preferences text
            prefs_text = ""
            if user_preferences:
                prefs_text = f"\n\nUser preferences: {json.dumps(user_preferences)}"
            
            system_prompt = """You are an expert educational planner. Create comprehensive, structured study plans that are:
1. Well-organized with clear sections and subsections
2. Progressive in difficulty
3. Include specific learning objectives
4. Suggest practical exercises and assessments
5. Provide estimated time requirements
6. Reference source materials when available

Format your response as a JSON object with this structure:
{
    "title": "Study Plan Title",
    "overview": "Brief overview of the plan",
    "duration": "Estimated duration (e.g., '4 weeks', '2 months')",
    "difficulty": "Beginner/Intermediate/Advanced",
    "source_references": ["Page references from provided context"],
    "sections": [
        {
            "id": "section_1",
            "title": "Section Title",
            "description": "What this section covers",
            "duration": "Estimated time",
            "learning_objectives": ["Objective 1", "Objective 2"],
            "source_pages": ["Relevant page references"],
            "subsections": [
                {
                    "id": "subsection_1_1",
                    "title": "Subsection Title",
                    "content": "Detailed content description",
                    "activities": ["Activity 1", "Activity 2"],
                    "resources": ["Resource 1", "Resource 2"],
                    "estimated_time": "X hours",
                    "source_reference": "Page reference if applicable"
                }
            ]
        }
    ],
    "prerequisites": ["Prerequisite 1", "Prerequisite 2"],
    "final_assessment": "Description of final assessment or project"
}"""

            user_prompt = f"""Create a detailed study plan for: {topic}
            
Make sure the plan is comprehensive, well-structured, and suitable for self-study.
When referencing information from the provided context, include page references in the appropriate fields.{context_text}{prefs_text}"""

            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt)
            ]

            response = self.llm.invoke(messages)
            
            # Try to parse as JSON
            try:
                plan_data = json.loads(response.content)
                
                # Add source provenance if not included by LLM
                if source_pages and "source_references" not in plan_data:
                    plan_data["source_references"] = [
                        f"{src['filename']} (Page {src['page']})" 
                        for src in source_pages
                    ]
                
                logger.info(f"Successfully created study plan for topic: {topic}")
                return {
                    "success": True,
                    "plan": plan_data,
                    "source_pages": source_pages,
                    "raw_response": response.content
                }
            except json.JSONDecodeError:
                logger.warning("Could not parse plan as JSON, returning raw text")
                return {
                    "success": True,
                    "plan": {"title": f"Study Plan: {topic}", "content": response.content},
                    "raw_response": response.content
                }
                
        except Exception as e:
            logger.error(f"Error creating study plan: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "plan": None
            }

    def refine_plan(self, current_plan: Dict, refinement_request: str) -> Dict[str, Any]:
        """
        Refine an existing study plan based on user feedback
        
        Args:
            current_plan: The current study plan
            refinement_request: User's request for changes
            
        Returns:
            Refined study plan
        """
        try:
            system_prompt = """You are an expert educational planner. The user has a study plan and wants to refine it.
Make the requested changes while maintaining the overall structure and quality of the plan.
Return the updated plan in the same JSON format."""

            user_prompt = f"""Current plan:
{json.dumps(current_plan, indent=2)}

Refinement request: {refinement_request}

Please update the plan accordingly and return the complete updated JSON."""

            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt)
            ]

            response = self.llm.invoke(messages)
            
            try:
                refined_plan = json.loads(response.content)
                logger.info("Successfully refined study plan")
                return {
                    "success": True,
                    "plan": refined_plan,
                    "raw_response": response.content
                }
            except json.JSONDecodeError:
                logger.warning("Could not parse refined plan as JSON")
                return {
                    "success": False,
                    "error": "Could not parse refined plan",
                    "plan": current_plan
                }
                
        except Exception as e:
            logger.error(f"Error refining study plan: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "plan": current_plan
            }
