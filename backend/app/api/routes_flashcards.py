"""
Flashcard API endpoints for StudyBuddy
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import logging

from ..agents.flashcards import FlashcardAgent

logger = logging.getLogger(__name__)

router = APIRouter()

class FlashcardGenerateRequest(BaseModel):
    context_chunks: List[Dict[str, Any]]
    topic: Optional[str] = None

class FlashcardUpdateRequest(BaseModel):
    flashcard_id: str
    result: str  # "easy", "medium", "hard"

class FlashcardResponse(BaseModel):
    id: str
    question: str
    answer: str
    difficulty: str
    source_info: str
    created_at: str
    next_review: str
    review_count: int
    success_count: int
    topic: str

class FlashcardsListResponse(BaseModel):
    flashcards: List[FlashcardResponse]
    total: int
    due_today: int

class FlashcardStatsResponse(BaseModel):
    total_cards: int
    due_today: int
    reviewed_cards: int
    total_reviews: int
    success_rate: float
    topics: List[str]

# Initialize flashcard agent
flashcard_agent = FlashcardAgent()

@router.post("/flashcards/generate", response_model=List[FlashcardResponse])
async def generate_flashcards(request: FlashcardGenerateRequest):
    """
    Generate flashcards from context chunks
    """
    try:
        flashcards = flashcard_agent.generate_flashcards(
            context_chunks=request.context_chunks,
            topic=request.topic
        )
        
        return [FlashcardResponse(**card) for card in flashcards]
        
    except Exception as e:
        logger.error(f"Error generating flashcards: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error generating flashcards: {str(e)}"
        )

@router.get("/flashcards/due", response_model=FlashcardsListResponse)
async def get_due_flashcards(limit: int = 20):
    """
    Get flashcards due for review today
    """
    try:
        due_cards = flashcard_agent.get_due_flashcards(limit=limit)
        stats = flashcard_agent.get_flashcard_stats()
        
        return FlashcardsListResponse(
            flashcards=[FlashcardResponse(**card) for card in due_cards],
            total=len(due_cards),
            due_today=stats["due_today"]
        )
        
    except Exception as e:
        logger.error(f"Error getting due flashcards: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error getting due flashcards: {str(e)}"
        )

@router.post("/flashcards/{flashcard_id}/review")
async def update_flashcard_review(flashcard_id: str, request: FlashcardUpdateRequest):
    """
    Update flashcard review result (easy/medium/hard)
    """
    try:
        # Validate result
        valid_results = ["easy", "medium", "hard"]
        if request.result not in valid_results:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid result. Must be one of: {valid_results}"
            )
        
        updated_card = flashcard_agent.update_flashcard_result(
            flashcard_id=flashcard_id,
            result=request.result
        )
        
        return FlashcardResponse(**updated_card)
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating flashcard review: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error updating flashcard review: {str(e)}"
        )

@router.get("/flashcards/stats", response_model=FlashcardStatsResponse)
async def get_flashcard_stats():
    """
    Get flashcard statistics
    """
    try:
        stats = flashcard_agent.get_flashcard_stats()
        return FlashcardStatsResponse(**stats)
        
    except Exception as e:
        logger.error(f"Error getting flashcard stats: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error getting flashcard stats: {str(e)}"
        )

@router.get("/flashcards", response_model=FlashcardsListResponse)
async def get_all_flashcards(limit: int = 100, topic: Optional[str] = None):
    """
    Get all flashcards (optionally filtered by topic)
    """
    try:
        # For now, get all and filter client-side if needed
        # In production, you'd want proper database queries
        all_cards = flashcard_agent._load_flashcards()
        
        if topic:
            all_cards = [card for card in all_cards if card.get("topic") == topic]
        
        all_cards = all_cards[:limit]
        stats = flashcard_agent.get_flashcard_stats()
        
        return FlashcardsListResponse(
            flashcards=[FlashcardResponse(**card) for card in all_cards],
            total=len(all_cards),
            due_today=stats["due_today"]
        )
        
    except Exception as e:
        logger.error(f"Error getting flashcards: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error getting flashcards: {str(e)}"
        )

@router.delete("/flashcards/{flashcard_id}")
async def delete_flashcard(flashcard_id: str):
    """
    Delete a specific flashcard
    """
    try:
        flashcards = flashcard_agent._load_flashcards()
        
        # Find and remove the flashcard
        updated_flashcards = [
            card for card in flashcards 
            if card["id"] != flashcard_id
        ]
        
        if len(updated_flashcards) == len(flashcards):
            raise HTTPException(status_code=404, detail="Flashcard not found")
        
        flashcard_agent._save_all_flashcards(updated_flashcards)
        
        return {"message": "Flashcard deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting flashcard: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error deleting flashcard: {str(e)}"
        )
