from fastapi import APIRouter, UploadFile, File, HTTPException
import os
import shutil
from typing import List, Dict, Any
import pdfplumber
import fitz  # PyMuPDF
import pandas as pd
from pathlib import Path

router = APIRouter()

STORAGE_DIR = "storage"

@router.post("/upload/pdf")
async def upload_pdf(file: UploadFile = File(...)):
    """
    Upload and process PDF file
    """
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be a PDF")
    
    # Save file
    file_path = os.path.join(STORAGE_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Extract text page by page
    pages_data = []
    
    try:
        # Using pdfplumber for text extraction
        with pdfplumber.open(file_path) as pdf:
            for page_num, page in enumerate(pdf.pages, 1):
                text = page.extract_text() or ""
                # Get first 200 chars as sample
                sample_text = text[:200] + "..." if len(text) > 200 else text
                
                pages_data.append({
                    "page": page_num,
                    "text": text,
                    "sample_text": sample_text,
                    "char_count": len(text)
                })
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")
    
    return {
        "filename": file.filename,
        "total_pages": len(pages_data),
        "pages": pages_data
    }

@router.post("/upload/excel")
async def upload_excel(file: UploadFile = File(...)):
    """
    Upload and process Excel file
    """
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="File must be an Excel file (.xlsx or .xls)")
    
    # Save file
    file_path = os.path.join(STORAGE_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        # Read Excel file
        excel_file = pd.ExcelFile(file_path)
        sheets_data = []
        
        for sheet_name in excel_file.sheet_names:
            df = pd.read_excel(file_path, sheet_name=sheet_name)
            
            # Get headers (column names)
            headers = df.columns.tolist()
            
            # Get first 5 rows as sample data
            sample_rows = df.head(5).to_dict('records')
            
            sheets_data.append({
                "sheet_name": sheet_name,
                "headers": headers,
                "sample_rows": sample_rows,
                "total_rows": len(df),
                "total_columns": len(df.columns)
            })
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing Excel file: {str(e)}")
    
    return {
        "filename": file.filename,
        "total_sheets": len(sheets_data),
        "sheets": sheets_data
    }
