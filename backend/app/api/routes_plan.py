"""
API routes for study plan management
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, Optional, List
from pydantic import BaseModel
from ..agents.conductor import ConductorAgent
from ..agents.planner import PlannerAgent
from ..core.logger import logger

router = APIRouter()

class PlanRequest(BaseModel):
    topic: str
    preferences: Optional[Dict[str, Any]] = None
    include_search: bool = True

class PlanRefinementRequest(BaseModel):
    current_plan: Dict[str, Any]
    refinement_request: str

@router.post("/create")
async def create_study_plan(request: PlanRequest) -> Dict[str, Any]:
    """
    Create a new study plan using multi-agent orchestration
    
    Args:
        request: Plan creation request with topic and preferences
        
    Returns:
        Generated study plan with orchestration steps
    """
    try:
        conductor = ConductorAgent()
        
        # Format query for plan creation
        query = f"Create a study plan for {request.topic}"
        if request.preferences:
            query += f" with preferences: {request.preferences}"
        
        # Process through multi-agent workflow
        result = await conductor.process_query(query)
        
        if result["success"]:
            return {
                "success": True,
                "study_plan": result.get("study_plan"),
                "response": result["response"],
                "steps": result["steps"],
                "search_results": result.get("search_results", []) if request.include_search else [],
                "intent": result["intent"]
            }
        else:
            raise HTTPException(status_code=500, detail=result.get("error", "Failed to create study plan"))
            
    except Exception as e:
        logger.error(f"Error in create_study_plan endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/refine")
async def refine_study_plan(request: PlanRefinementRequest) -> Dict[str, Any]:
    """
    Refine an existing study plan based on user feedback
    
    Args:
        request: Refinement request with current plan and changes
        
    Returns:
        Refined study plan
    """
    try:
        planner = PlannerAgent()
        
        result = planner.refine_plan(
            current_plan=request.current_plan,
            refinement_request=request.refinement_request
        )
        
        if result["success"]:
            return {
                "success": True,
                "study_plan": result["plan"],
                "raw_response": result.get("raw_response", "")
            }
        else:
            raise HTTPException(status_code=500, detail=result.get("error", "Failed to refine study plan"))
            
    except Exception as e:
        logger.error(f"Error in refine_study_plan endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/template/{difficulty}")
async def get_plan_template(difficulty: str = "intermediate") -> Dict[str, Any]:
    """
    Get a template structure for study plans
    
    Args:
        difficulty: Plan difficulty level (beginner, intermediate, advanced)
        
    Returns:
        Template structure for study plans
    """
    try:
        templates = {
            "beginner": {
                "title": "Beginner Study Plan Template",
                "overview": "A structured introduction to fundamental concepts",
                "duration": "4-6 weeks",
                "difficulty": "Beginner",
                "sections": [
                    {
                        "id": "foundations",
                        "title": "Foundation Building",
                        "description": "Core concepts and terminology",
                        "duration": "1-2 weeks",
                        "learning_objectives": [
                            "Understand basic terminology",
                            "Grasp fundamental concepts"
                        ],
                        "subsections": [
                            {
                                "id": "intro",
                                "title": "Introduction",
                                "content": "Overview and basic concepts",
                                "activities": ["Read introductory materials", "Complete basic exercises"],
                                "resources": ["Beginner tutorials", "Basic documentation"],
                                "estimated_time": "2-3 hours"
                            }
                        ]
                    }
                ],
                "prerequisites": ["Basic reading comprehension"],
                "final_assessment": "Complete a basic project demonstrating understanding"
            },
            "intermediate": {
                "title": "Intermediate Study Plan Template",
                "overview": "Building on fundamentals with practical applications",
                "duration": "6-8 weeks",
                "difficulty": "Intermediate",
                "sections": [
                    {
                        "id": "review",
                        "title": "Foundation Review",
                        "description": "Review and strengthen basics",
                        "duration": "1 week",
                        "learning_objectives": [
                            "Reinforce fundamental concepts",
                            "Identify knowledge gaps"
                        ],
                        "subsections": []
                    },
                    {
                        "id": "application",
                        "title": "Practical Application",
                        "description": "Apply knowledge to real scenarios",
                        "duration": "4-5 weeks",
                        "learning_objectives": [
                            "Apply concepts practically",
                            "Solve intermediate problems"
                        ],
                        "subsections": []
                    }
                ],
                "prerequisites": ["Basic understanding of core concepts"],
                "final_assessment": "Complete intermediate-level project"
            },
            "advanced": {
                "title": "Advanced Study Plan Template",
                "overview": "Deep dive into complex topics and advanced applications",
                "duration": "8-12 weeks",
                "difficulty": "Advanced",
                "sections": [
                    {
                        "id": "advanced_concepts",
                        "title": "Advanced Concepts",
                        "description": "Complex theories and methodologies",
                        "duration": "3-4 weeks",
                        "learning_objectives": [
                            "Master advanced concepts",
                            "Understand complex relationships"
                        ],
                        "subsections": []
                    },
                    {
                        "id": "specialization",
                        "title": "Specialization Areas",
                        "description": "Focus on specific advanced areas",
                        "duration": "4-6 weeks",
                        "learning_objectives": [
                            "Develop specialized expertise",
                            "Create original solutions"
                        ],
                        "subsections": []
                    }
                ],
                "prerequisites": ["Solid intermediate knowledge", "Relevant experience"],
                "final_assessment": "Original research project or complex implementation"
            }
        }
        
        template = templates.get(difficulty.lower(), templates["intermediate"])
        
        return {
            "success": True,
            "template": template,
            "difficulty": difficulty
        }
        
    except Exception as e:
        logger.error(f"Error getting plan template: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
