from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.routes_docs import router as docs_router
from .api.routes_chat import router as chat_router
from .api.routes_plan import router as plan_router
from .core.logger import setup_logging
import os

# Setup logging
setup_logging()

app = FastAPI(title="StudyBuddy AI", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create storage directory if it doesn't exist
os.makedirs("storage", exist_ok=True)

# Include routers
app.include_router(docs_router, prefix="/api")
app.include_router(chat_router, prefix="/api")
app.include_router(plan_router, prefix="/api/plan")

@app.get("/ping")
async def ping():
    return {"message": "pong"}

@app.get("/")
async def root():
    return {
        "message": "StudyBuddy AI Backend",
        "version": "1.0.0",
        "features": [
            "Document upload and processing",
            "RAG-based chat",
            "Multi-agent orchestration",
            "Study plan generation",
            "Web search integration"
        ]
    }
