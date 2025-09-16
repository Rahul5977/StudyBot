"""
FlashcardAgent: Generates and manages flashcards for spaced repetition learning
"""
import json
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from pathlib import Path
from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage
from ..core.config import settings

logger = logging.getLogger(__name__)

class FlashcardAgent:
    """Agent responsible for generating and managing flashcards"""
    
    def __init__(self):
        self.llm = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0.3,
            openai_api_key=settings.openai_api_key
        )
        self.flashcard_file = Path("data/flashcards.json")
        self.flashcard_file.parent.mkdir(exist_ok=True)
        
        # Spaced repetition intervals (in days)
        self.intervals = {
            "new": 1,      # First review after 1 day
            "easy": 7,     # Easy cards: 7 days
            "medium": 3,   # Medium cards: 3 days  
            "hard": 1      # Hard cards: 1 day
        }
    
    def generate_flashcards(self, context_chunks: List[Dict[str, Any]], topic: str = None) -> List[Dict[str, Any]]:
        """
        Generate flashcards from studied content chunks
        
        Args:
            context_chunks: List of text chunks with metadata
            topic: Optional topic context for better flashcard generation
            
        Returns:
            List of generated flashcards
        """
        try:
            if not context_chunks:
                return []
            
            # Combine chunks for context
            combined_text = "\n\n".join([
                f"Source: {chunk.get('filename', 'Unknown')} (Page {chunk.get('page', 'N/A')})\n{chunk.get('text', '')}"
                for chunk in context_chunks[:5]  # Limit to top 5 chunks
            ])
            
            topic_context = f" related to {topic}" if topic else ""
            
            prompt = f"""
You are an expert educator creating flashcards for spaced repetition learning.

Based on the following content{topic_context}, create 3-5 high-quality flashcards that test key concepts, definitions, and understanding.

Content:
{combined_text}

Requirements:
1. Each flashcard should have a clear, concise question and comprehensive answer
2. Focus on the most important concepts and facts
3. Make questions specific and testable
4. Include different types of questions (definitions, examples, applications)
5. Ensure answers are accurate and complete

Return your response as a JSON array with this exact format:
[
  {{
    "question": "Clear, specific question",
    "answer": "Comprehensive answer with key details",
    "difficulty": "easy|medium|hard",
    "source_info": "Brief source reference (filename, page)"
  }}
]

Only return the JSON array, no additional text.
"""

            response = self.llm.invoke([
                SystemMessage(content="You are an expert educator specializing in creating effective flashcards for learning."),
                HumanMessage(content=prompt)
            ])
            
            # Parse the response
            try:
                flashcards_data = json.loads(response.content.strip())
                
                # Add metadata to each flashcard
                flashcards = []
                for card_data in flashcards_data:
                    flashcard = {
                        "id": f"flashcard_{datetime.now().timestamp()}_{len(flashcards)}",
                        "question": card_data.get("question", ""),
                        "answer": card_data.get("answer", ""),
                        "difficulty": card_data.get("difficulty", "medium"),
                        "source_info": card_data.get("source_info", ""),
                        "created_at": datetime.now().isoformat(),
                        "next_review": (datetime.now() + timedelta(days=self.intervals["new"])).isoformat(),
                        "review_count": 0,
                        "success_count": 0,
                        "last_result": None,
                        "topic": topic or "General",
                        "source_chunks": [chunk.get("filename", "Unknown") for chunk in context_chunks]
                    }
                    flashcards.append(flashcard)
                
                # Save flashcards
                self._save_flashcards(flashcards)
                
                logger.info(f"Generated {len(flashcards)} flashcards from {len(context_chunks)} chunks")
                return flashcards
                
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse LLM response as JSON: {e}")
                logger.error(f"Raw response: {response.content}")
                return []
                
        except Exception as e:
            logger.error(f"Error generating flashcards: {e}")
            return []
    
    def get_due_flashcards(self, limit: int = 20) -> List[Dict[str, Any]]:
        """
        Get flashcards that are due for review
        
        Args:
            limit: Maximum number of cards to return
            
        Returns:
            List of due flashcards
        """
        try:
            flashcards = self._load_flashcards()
            now = datetime.now()
            
            due_cards = []
            for card in flashcards:
                next_review = datetime.fromisoformat(card["next_review"])
                if next_review <= now:
                    due_cards.append(card)
            
            # Sort by next_review time (earliest first)
            due_cards.sort(key=lambda x: x["next_review"])
            
            return due_cards[:limit]
            
        except Exception as e:
            logger.error(f"Error getting due flashcards: {e}")
            return []
    
    def update_flashcard_result(self, flashcard_id: str, result: str) -> Dict[str, Any]:
        """
        Update flashcard review result and schedule next review
        
        Args:
            flashcard_id: ID of the flashcard
            result: "easy", "medium", or "hard"
            
        Returns:
            Updated flashcard data
        """
        try:
            flashcards = self._load_flashcards()
            
            for i, card in enumerate(flashcards):
                if card["id"] == flashcard_id:
                    # Update review statistics
                    card["review_count"] += 1
                    card["last_result"] = result
                    card["last_reviewed"] = datetime.now().isoformat()
                    
                    if result == "easy":
                        card["success_count"] += 1
                    
                    # Calculate next review date
                    interval_days = self.intervals.get(result, 3)
                    next_review = datetime.now() + timedelta(days=interval_days)
                    card["next_review"] = next_review.isoformat()
                    
                    # Save updated flashcards
                    self._save_all_flashcards(flashcards)
                    
                    logger.info(f"Updated flashcard {flashcard_id}: {result} -> next review in {interval_days} days")
                    return card
            
            raise ValueError(f"Flashcard {flashcard_id} not found")
            
        except Exception as e:
            logger.error(f"Error updating flashcard result: {e}")
            raise
    
    def get_flashcard_stats(self) -> Dict[str, Any]:
        """
        Get statistics about flashcards
        
        Returns:
            Dictionary with flashcard statistics
        """
        try:
            flashcards = self._load_flashcards()
            now = datetime.now()
            
            total_cards = len(flashcards)
            due_today = len([
                card for card in flashcards 
                if datetime.fromisoformat(card["next_review"]) <= now
            ])
            
            reviewed_cards = len([
                card for card in flashcards 
                if card["review_count"] > 0
            ])
            
            # Calculate success rate
            total_reviews = sum(card["review_count"] for card in flashcards)
            total_successes = sum(card["success_count"] for card in flashcards)
            success_rate = (total_successes / total_reviews * 100) if total_reviews > 0 else 0
            
            return {
                "total_cards": total_cards,
                "due_today": due_today,
                "reviewed_cards": reviewed_cards,
                "total_reviews": total_reviews,
                "success_rate": round(success_rate, 1),
                "topics": list(set(card["topic"] for card in flashcards))
            }
            
        except Exception as e:
            logger.error(f"Error getting flashcard stats: {e}")
            return {
                "total_cards": 0,
                "due_today": 0,
                "reviewed_cards": 0,
                "total_reviews": 0,
                "success_rate": 0,
                "topics": []
            }
    
    def _load_flashcards(self) -> List[Dict[str, Any]]:
        """Load flashcards from storage"""
        try:
            if self.flashcard_file.exists():
                with open(self.flashcard_file, 'r') as f:
                    return json.load(f)
            return []
        except Exception as e:
            logger.error(f"Error loading flashcards: {e}")
            return []
    
    def _save_flashcards(self, new_flashcards: List[Dict[str, Any]]) -> None:
        """Append new flashcards to storage"""
        try:
            existing_flashcards = self._load_flashcards()
            all_flashcards = existing_flashcards + new_flashcards
            
            with open(self.flashcard_file, 'w') as f:
                json.dump(all_flashcards, f, indent=2)
                
        except Exception as e:
            logger.error(f"Error saving flashcards: {e}")
            raise
    
    def _save_all_flashcards(self, flashcards: List[Dict[str, Any]]) -> None:
        """Save all flashcards to storage (overwrite)"""
        try:
            with open(self.flashcard_file, 'w') as f:
                json.dump(flashcards, f, indent=2)
                
        except Exception as e:
            logger.error(f"Error saving all flashcards: {e}")
            raise
