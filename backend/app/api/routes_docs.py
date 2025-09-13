from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
import os
import shutil
from typing import List, Dict, Any
import pdfplumber
import fitz  # PyMuPDF
import pandas as pd
from pathlib import Path
import uuid
import logging

from ..core.db import qdrant_db
from ..core.embeddings import embeddings_service
from ..agents.chunker import chunk_text
from ..core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter()

STORAGE_DIR = settings.upload_dir
os.makedirs(STORAGE_DIR, exist_ok=True)

def process_and_store_chunks(chunks: List[Dict[str, Any]], doc_id: str, filename: str):
    """Background task to process and store document chunks"""
    try:
        # Extract text from chunks for embedding
        texts = [chunk["text"] for chunk in chunks if chunk.get("text")]
        
        if not texts:
            logger.warning(f"No text found in chunks for document {doc_id}")
            return
        
        # Generate embeddings
        logger.info(f"Generating embeddings for {len(texts)} chunks")
        embeddings = embeddings_service.embed_texts(texts)
        
        # Add metadata to chunks
        for chunk in chunks:
            chunk["doc_id"] = doc_id
            chunk["filename"] = filename
        
        # Store in vector database
        qdrant_db.add_chunks(chunks=chunks, embeddings=embeddings, doc_id=doc_id)
        
        logger.info(f"Successfully stored {len(chunks)} chunks for document {doc_id}")
        
    except Exception as e:
        logger.error(f"Error processing chunks for document {doc_id}: {e}")

@router.post("/upload/text")
async def upload_text(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    """
    Upload and process text file with chunking and vector storage
    """
    if not file.filename.endswith(('.txt', '.md')):
        raise HTTPException(status_code=400, detail="File must be a text file (.txt or .md)")
    
    # Generate document ID
    doc_id = str(uuid.uuid4())
    
    # Save file
    file_path = os.path.join(STORAGE_DIR, f"{doc_id}_{file.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        # Read text file
        with open(file_path, "r", encoding="utf-8") as f:
            text = f.read()
        
        if not text.strip():
            raise HTTPException(status_code=400, detail="File appears to be empty")
        
        # Chunk the text
        chunks = chunk_text(
            text=text,
            chunk_size=settings.chunk_size,
            chunk_overlap=settings.chunk_overlap
        )
        
        # Prepare chunks for storage
        all_chunks = []
        for i, chunk in enumerate(chunks):
            chunk_data = {
                "chunk_id": f"{doc_id}_chunk_{i}",
                "text": chunk,
                "type": "text",
                "metadata": {
                    "source_file": file.filename,
                    "chunk_index": i
                }
            }
            all_chunks.append(chunk_data)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing text file: {str(e)}")
    
    # Process chunks in background
    background_tasks.add_task(
        process_and_store_chunks,
        chunks=all_chunks,
        doc_id=doc_id,
        filename=file.filename
    )
    
    return {
        "doc_id": doc_id,
        "filename": file.filename,
        "total_chunks": len(all_chunks),
        "char_count": len(text),
        "status": "processing"  # Indicates background processing
    }

@router.post("/upload/pdf")
async def upload_pdf(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    """
    Upload and process PDF file with chunking and vector storage
    """
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be a PDF")
    
    # Generate document ID
    doc_id = str(uuid.uuid4())
    
    # Save file
    file_path = os.path.join(STORAGE_DIR, f"{doc_id}_{file.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Extract text page by page
    pages_data = []
    all_chunks = []
    
    try:
        # Using pdfplumber for text extraction
        with pdfplumber.open(file_path) as pdf:
            for page_num, page in enumerate(pdf.pages, 1):
                text = page.extract_text() or ""
                
                if text.strip():  # Only process pages with text
                    # Chunk the page text
                    page_chunks = chunk_text(
                        text=text,
                        chunk_size=settings.chunk_size,
                        chunk_overlap=settings.chunk_overlap
                    )
                    
                    # Add page metadata to chunks
                    for i, chunk in enumerate(page_chunks):
                        chunk_data = {
                            "chunk_id": f"{doc_id}_page_{page_num}_chunk_{i}",
                            "text": chunk,
                            "page": page_num,
                            "type": "pdf_text",
                            "metadata": {
                                "source_file": file.filename,
                                "page_number": page_num,
                                "chunk_index": i
                            }
                        }
                        all_chunks.append(chunk_data)
                
                # Create page summary for response
                sample_text = text[:200] + "..." if len(text) > 200 else text
                pages_data.append({
                    "page": page_num,
                    "sample_text": sample_text,
                    "char_count": len(text),
                    "chunks_count": len(page_chunks) if text.strip() else 0
                })
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")
    
    # Process chunks in background
    background_tasks.add_task(
        process_and_store_chunks,
        chunks=all_chunks,
        doc_id=doc_id,
        filename=file.filename
    )
    
    return {
        "doc_id": doc_id,
        "filename": file.filename,
        "total_pages": len(pages_data),
        "total_chunks": len(all_chunks),
        "pages": pages_data,
        "status": "processing"  # Indicates background processing
    }

@router.post("/upload/excel")
async def upload_excel(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    """
    Upload and process Excel file with chunking and vector storage
    """
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="File must be an Excel file (.xlsx or .xls)")
    
    # Generate document ID
    doc_id = str(uuid.uuid4())
    
    # Save file
    file_path = os.path.join(STORAGE_DIR, f"{doc_id}_{file.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        # Read Excel file
        excel_file = pd.ExcelFile(file_path)
        sheets_data = []
        all_chunks = []
        
        for sheet_name in excel_file.sheet_names:
            df = pd.read_excel(file_path, sheet_name=sheet_name)
            
            # Convert sheet to text for chunking
            sheet_text = f"Sheet: {sheet_name}\n\n"
            
            # Add headers
            headers = df.columns.tolist()
            sheet_text += "Headers: " + ", ".join(headers) + "\n\n"
            
            # Add data rows
            for idx, row in df.iterrows():
                row_text = " | ".join([f"{col}: {val}" for col, val in row.items() if pd.notna(val)])
                sheet_text += f"Row {idx + 1}: {row_text}\n"
            
            # Chunk the sheet text
            sheet_chunks = chunk_text(
                text=sheet_text,
                chunk_size=settings.chunk_size,
                chunk_overlap=settings.chunk_overlap
            )
            
            # Add sheet metadata to chunks
            for i, chunk in enumerate(sheet_chunks):
                chunk_data = {
                    "chunk_id": f"{doc_id}_sheet_{sheet_name}_chunk_{i}",
                    "text": chunk,
                    "page": sheet_name,  # Use sheet name as "page"
                    "type": "excel_data",
                    "metadata": {
                        "source_file": file.filename,
                        "sheet_name": sheet_name,
                        "chunk_index": i,
                        "headers": headers,
                        "total_rows": len(df)
                    }
                }
                all_chunks.append(chunk_data)
            
            # Get sample data for response
            sample_rows = df.head(5).to_dict('records')
            
            sheets_data.append({
                "sheet_name": sheet_name,
                "headers": headers,
                "sample_rows": sample_rows,
                "total_rows": len(df),
                "total_columns": len(df.columns),
                "chunks_count": len(sheet_chunks)
            })
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing Excel file: {str(e)}")
    
    # Process chunks in background
    background_tasks.add_task(
        process_and_store_chunks,
        chunks=all_chunks,
        doc_id=doc_id,
        filename=file.filename
    )
    
    return {
        "doc_id": doc_id,
        "filename": file.filename,
        "total_sheets": len(sheets_data),
        "total_chunks": len(all_chunks),
        "sheets": sheets_data,
        "status": "processing"  # Indicates background processing
    }

@router.delete("/documents/{doc_id}")
async def delete_document(doc_id: str):
    """
    Delete a document and all its chunks
    """
    try:
        # Delete from vector store
        qdrant_db.delete_document(doc_id)
        
        # Delete physical file (if it exists)
        # Note: We'd need to store file paths to delete them properly
        # For now, just delete from vector store
        
        return {"message": f"Document {doc_id} deleted successfully"}
        
    except Exception as e:
        logger.error(f"Error deleting document {doc_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error deleting document: {str(e)}"
        )

@router.get("/documents/{doc_id}/status")
async def get_document_status(doc_id: str):
    """
    Get processing status of a document
    """
    try:
        # Query vector store to check if chunks exist
        # Use a dummy embedding to check if document exists
        dummy_embedding = [0.0] * 1536  # OpenAI ada-002 size
        chunks = qdrant_db.query_chunks(
            query_embedding=dummy_embedding,
            doc_id=doc_id,
            top_k=1
        )
        
        if chunks:
            return {
                "doc_id": doc_id,
                "status": "completed",
                "chunks_count": "unknown"  # Would need separate endpoint to count
            }
        else:
            return {
                "doc_id": doc_id,
                "status": "processing",
                "chunks_count": 0
            }
            
    except Exception as e:
        logger.error(f"Error checking document status {doc_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error checking document status: {str(e)}"
        )
