"""
SearchAgent: Performs web searches using Tavily API for additional context and resources
"""
import json
import logging
from typing import List, Dict, Any, Optional
from tavily import TavilyClient
from ..core.config import settings

logger = logging.getLogger(__name__)

class SearchAgent:
    def __init__(self):
        if settings.tavily_api_key:
            self.client = TavilyClient(api_key=settings.tavily_api_key)
            self.enabled = True
        else:
            self.client = None
            self.enabled = False
            logger.warning("Tavily API key not provided, search functionality disabled")

    def search_topic(self, query: str, max_results: int = 5) -> Dict[str, Any]:
        """
        Search for information about a topic using Tavily
        
        Args:
            query: Search query
            max_results: Maximum number of results to return
            
        Returns:
            Search results with URLs, titles, and content
        """
        if not self.enabled:
            return {
                "success": False,
                "error": "Search functionality disabled (no API key)",
                "results": []
            }
        
        try:
            logger.info(f"Searching for: {query}")
            
            response = self.client.search(
                query=query,
                search_depth="basic",
                max_results=max_results,
                include_answer=True,
                include_raw_content=True
            )
            
            # Format results
            formatted_results = []
            for result in response.get("results", []):
                formatted_results.append({
                    "title": result.get("title", ""),
                    "url": result.get("url", ""),
                    "content": result.get("content", ""),
                    "score": result.get("score", 0),
                    "published_date": result.get("published_date", "")
                })
            
            return {
                "success": True,
                "query": query,
                "answer": response.get("answer", ""),
                "results": formatted_results,
                "total_results": len(formatted_results)
            }
            
        except Exception as e:
            logger.error(f"Error searching with Tavily: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "results": []
            }

    def search_learning_resources(self, topic: str) -> Dict[str, Any]:
        """
        Search specifically for learning resources about a topic
        
        Args:
            topic: The topic to find learning resources for
            
        Returns:
            Educational resources, tutorials, courses, etc.
        """
        educational_query = f"{topic} tutorial course learning resources educational materials"
        return self.search_topic(educational_query, max_results=6)

    def search_practice_problems(self, topic: str) -> Dict[str, Any]:
        """
        Search for practice problems and exercises related to a topic
        
        Args:
            topic: The topic to find practice problems for
            
        Returns:
            Practice problems, exercises, quizzes, etc.
        """
        practice_query = f"{topic} practice problems exercises quiz examples"
        return self.search_topic(practice_query, max_results=4)

    def verify_information(self, claim: str) -> Dict[str, Any]:
        """
        Verify a claim or piece of information using web search
        
        Args:
            claim: The claim to verify
            
        Returns:
            Verification results with supporting evidence
        """
        verification_query = f"verify facts about {claim}"
        return self.search_topic(verification_query, max_results=3)

    def get_latest_updates(self, topic: str) -> Dict[str, Any]:
        """
        Get the latest updates and developments in a topic
        
        Args:
            topic: The topic to get updates for
            
        Returns:
            Latest news, developments, updates
        """
        latest_query = f"{topic} latest updates news developments 2024"
        return self.search_topic(latest_query, max_results=4)
