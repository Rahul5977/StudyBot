"""
ChunkerAgent - Basic rule-based text chunking for Day 1
"""
from typing import List, Dict, Any
import re

class ChunkerAgent:
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
