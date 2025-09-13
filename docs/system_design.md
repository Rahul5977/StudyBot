# StudyBuddy AI - System Design

## Architecture Overview

```
Frontend (React + Tailwind)
        ↓
    FastAPI Backend
        ↓
   Document Processing
   (PDF/Excel Parsers)
        ↓
   ChunkerAgent (Rule-based)
        ↓
   In-Memory Storage
```

## Day 1 Implementation

### Backend Components

1. **FastAPI Application** (`main.py`)

   - CORS middleware for frontend communication
   - Health check endpoint `/ping`
   - Router integration for document upload routes

2. **Document Upload Routes** (`routes_docs.py`)

   - `/api/upload/pdf`: Process PDF files page by page
   - `/api/upload/excel`: Process Excel files sheet by sheet
   - File validation and error handling
   - Structured JSON responses with metadata

3. **ChunkerAgent** (`chunker.py`)
   - Simple rule-based text chunking
   - PDF: Split by pages
   - Excel: Split by sheets
   - In-memory storage for processed chunks

### Frontend Components

1. **React Application**

   - Modern UI with Tailwind CSS
   - File upload interface
   - Real-time upload progress
   - Response data logging to console

2. **UploadForm Component**
   - File selection with validation
   - Support for PDF and Excel formats
   - Async upload with error handling
   - Success feedback with metadata display

## Data Flow

1. **Upload Flow**:

   - User selects PDF/Excel file in frontend
   - File sent to appropriate backend endpoint
   - Backend processes and extracts metadata
   - Response with structured data returned
   - Frontend logs response to console

2. **Processing Flow**:
   - PDF: Extract text page by page using pdfplumber
   - Excel: Read sheets, headers, and sample rows using pandas
   - ChunkerAgent creates structured chunks
   - Metadata includes file info, page/sheet counts, sample text

## Technical Stack

- **Backend**: FastAPI, Python 3.8+
- **PDF Processing**: pdfplumber, PyMuPDF
- **Excel Processing**: pandas, openpyxl
- **Frontend**: React 18, Tailwind CSS
- **File Storage**: Local filesystem (storage/ directory)

## Future Enhancements (Day 2+)

- Vector embeddings for semantic search
- Database integration (PostgreSQL + vector DB)
- Advanced chunking strategies
- Chat interface with RAG pipeline
- Study plan generation
- Interactive flashcards
