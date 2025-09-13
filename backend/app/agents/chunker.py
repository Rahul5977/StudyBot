"""
Text chunking utilities for StudyBuddy
"""
from typing import List, Dict, Any
import re

def chunk_text(text: str, chunk_size: int = 1000, chunk_overlap: int = 100) -> List[str]:
    """
    Split text into overlapping chunks for better context preservation
    
    Args:
        text: Text to chunk
        chunk_size: Maximum characters per chunk
        chunk_overlap: Number of overlapping characters between chunks
        
    Returns:
        List of text chunks
    """
    if not text or len(text) <= chunk_size:
        return [text] if text else []
    
    chunks = []
    start = 0
    
    while start < len(text):
        end = start + chunk_size
        
        # If we're not at the end of the text, try to break at a sentence boundary
        if end < len(text):
            # Look for sentence endings near the chunk boundary
            sentence_end = -1
            for i in range(max(0, end - 200), min(len(text), end + 200)):
                if text[i] in '.!?':
                    sentence_end = i + 1
                    break
            
            # If we found a sentence boundary, use it
            if sentence_end > start + chunk_size // 2:  # Don't make chunks too small
                end = sentence_end
        
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        
        # Move start position, accounting for overlap
        start = end - chunk_overlap
        if start >= len(text):
            break
    
    return chunks

class ChunkerAgent:
    """Legacy chunker for backward compatibility"""
    
    def __init__(self):
        self.chunks = []
    
    def chunk_pdf_by_pages(self, pages_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Simple chunking by pages for PDF documents
        Each page becomes a chunk
        """
        chunks = []
        for page_data in pages_data:
            chunk = {
                "chunk_id": f"page_{page_data['page']}",
                "page": page_data['page'],
                "text": page_data['text'],
                "type": "page",
                "metadata": {
                    "source": "pdf",
                    "page_number": page_data['page'],
                    "char_count": len(page_data['text'])
                }
            }
            chunks.append(chunk)
        
        # Store in memory for later retrieval
        self.chunks.extend(chunks)
        return chunks
    
    def chunk_excel_by_sheets(self, sheets_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Simple chunking by sheets for Excel documents
        Each sheet becomes a chunk
        """
        chunks = []
        for i, sheet_data in enumerate(sheets_data):
            # Convert sheet data to text representation
            text_content = f"Sheet: {sheet_data['sheet_name']}\n"
            text_content += f"Headers: {', '.join(sheet_data['headers'])}\n"
            text_content += "Sample Data:\n"
            
            for row in sheet_data['sample_rows']:
                row_text = " | ".join([str(value) for value in row.values()])
                text_content += f"{row_text}\n"
            
            chunk = {
                "chunk_id": f"sheet_{i+1}",
                "sheet_name": sheet_data['sheet_name'],
                "text": text_content,
                "type": "sheet",
                "metadata": {
                    "source": "excel",
                    "sheet_name": sheet_data['sheet_name'],
                    "total_rows": sheet_data['total_rows'],
                    "total_columns": sheet_data['total_columns'],
                    "headers": sheet_data['headers']
                }
            }
            chunks.append(chunk)
        
        # Store in memory for later retrieval
        self.chunks.extend(chunks)
        return chunks
    
    def get_all_chunks(self) -> List[Dict[str, Any]]:
        """
        Return all stored chunks
        """
        return self.chunks
    
    def clear_chunks(self):
        """
        Clear all stored chunks
        """
        self.chunks = []
