# StudyBuddy AI

AI-powered study companion that processes your documents (PDFs, Excel files) and helps you learn more effectively through intelligent chunking, retrieval, and interactive features.

## 🚀 Day 1 Implementation

### Features

- ✅ PDF upload and page-by-page text extraction
- ✅ Excel upload with sheet analysis and data preview
- ✅ Rule-based document chunking
- ✅ Modern React frontend with Tailwind CSS
- ✅ FastAPI backend with CORS support
- ✅ Real-time upload progress and feedback

### Project Structure

```
studybuddy/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── api/
│   │   │   └── routes_docs.py   # Document upload endpoints
│   │   └── agents/
│   │       └── chunker.py       # Basic text chunking
│   └── storage/                 # Uploaded files storage
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Main React app
│   │   ├── pages/
│   │   │   └── Home.jsx         # Home page with upload form
│   │   ├── components/
│   │   │   └── UploadForm.jsx   # File upload component
│   │   └── utils/
│   │       └── api.js           # API helper functions
│   └── public/
├── docs/
│   └── system_design.md         # Architecture documentation
├── requirements.txt             # Python dependencies
├── package.json                 # Node.js dependencies
└── README.md                    # This file
```

## 🛠️ Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

### Quick Start

1. **Clone and navigate to project**

   ```bash
   cd /Users/rahulraj/Desktop/StudyBuddy
   ```

2. **Start Backend (Terminal 1)**

   ```bash
   ./start_backend.sh
   ```

   This will:

   - Create a Python virtual environment
   - Install Python dependencies
   - Start FastAPI server on http://localhost:8000

3. **Start Frontend (Terminal 2)**
   ```bash
   ./start_frontend.sh
   ```
   This will:
   - Install Node.js dependencies
   - Start React dev server on http://localhost:3000

### Manual Setup

#### Backend Setup

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start server
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

## 🎯 Usage

1. Open http://localhost:3000 in your browser
2. Upload a PDF or Excel file using the upload form
3. View the processing results in the browser console
4. Backend API documentation available at http://localhost:8000/docs

### API Endpoints

- `GET /ping` - Health check
- `POST /api/upload/pdf` - Upload and process PDF files
- `POST /api/upload/excel` - Upload and process Excel files

## 🧪 Testing the Implementation

1. **Test PDF Upload:**

   - Upload any PDF file
   - Check console for page-by-page extraction results
   - Verify file saved in `backend/storage/`

2. **Test Excel Upload:**

   - Upload any .xlsx or .xls file
   - Check console for sheet names, headers, and sample rows
   - Verify structured data extraction

3. **Backend API Testing:**
   - Visit http://localhost:8000/docs for Swagger UI
   - Test endpoints directly through the interactive docs

## 🔄 Next Steps (Day 2+)

- [ ] Vector embeddings and semantic search
- [ ] Database integration (PostgreSQL + Vector DB)
- [ ] Chat interface with RAG pipeline
- [ ] Study plan generation
- [ ] Interactive flashcards
- [ ] Advanced chunking strategies

## 📝 Dependencies

### Backend

- FastAPI - Modern Python web framework
- pdfplumber - PDF text extraction
- pandas - Excel file processing
- uvicorn - ASGI server

### Frontend

- React 18 - Modern React with hooks
- Tailwind CSS - Utility-first CSS framework
- Modern fetch API for HTTP requests

## 🐛 Troubleshooting

**Backend Issues:**

- Ensure Python 3.8+ is installed
- Check if virtual environment is activated
- Verify all dependencies installed correctly

**Frontend Issues:**

- Ensure Node.js 16+ is installed
- Clear node_modules and reinstall if needed
- Check for port conflicts (default: 3000)

**CORS Issues:**

- Backend is configured for localhost:3000
- Ensure both servers are running on correct ports

1 — Project summary (goal)
Build an AI “Study Mode” assistant that helps students study large PDFs and Excel files by:
automatically chunking PDFs/pages into topic-level units,

generating/supplying prerequisite questions ("do you need X?") before studying a topic,

summarizing each chunk and feeding page summaries into the RAG context,

supporting Excel column-wise chunking and LLM-generated SQL for structured queries,

offering a nice UI (chat + doc viewer + plan editor + monitoring) and optional multi-agent orchestration for Planner/Executor + web search (Tavily) + tools.

Core tech you already picked: LangChain, LangGraph (or LangChain agents), FastAPI, React — good choices (LangChain is a standard LLM-app framework). (LangChain)

2 — High level architecture (textual)
Frontend (React)

Chat UI + PDF viewer with chunk highlights + Plan editor + Progress dashboard + Flashcards panel + Excel viewer (table preview + column selector).

Backend API (FastAPI)

File ingestion endpoints, user profile, plan/queue management, logs/export endpoints.

Orchestrator / Agent Layer (LangChain + LangGraph/your orchestration)

Coordinator (single principal node / conductor) that spawns specialized agents (Planner, Chunker, Indexer, Retriever, Tutor, ExcelAgent, SearchAgent).

LangChain + LangGraph supports persistent agents, streaming, and multi-agent workflows. (LangChain Docs)

RAG / Indexing

Chunker → Embedding generator → Vector DB (Qdrant recommended for prototype; Pinecone as managed alternative). (Qdrant)

Storage & extraction

File storage (S3 / MinIO), text extracted with pdfplumber / PyMuPDF / Tesseract (for scanned), table extraction with Camelot / Tabula; Excel via pandas/openpyxl.

Scheduler / Worker

Celery/RQ with Redis or a task queue to run indexing, scheduled spaced-repetition sessions, batch ingestion.

Monitoring / Logging / Telemetry

Elastic/Grafana / Prometheus / Sentry / audit logs for interaction logs and prompt history (store all LLM prompts + responses).

Security / Auth

OAuth2/JWT or Auth0; encrypted file-at-rest; opt-in local-only mode.

3 — Agents (recommended) — roles & interactions
(You asked for extra agents — here are practical options.)
Conductor (Principal node)

Single manager for lifecycle: receives user request, chooses Planner, spawns/monitors agents, aggregates results. (This is your “one principle node”.)

Uploader / Preprocessor (Chunker)

PDF: page extraction → semantic splitting into subtopic chunks using an LLM-based splitter (detect headings + in-text cues) OR heuristic split (page/section).

Excel: sheet detection → header detection → column-wise chunking + sample rows → generate column descriptions.

Produce metadata: doc_id, page_ranges, headings, token_count, chunk_id.

Indexer

Embed chunks and push to vector DB + store metadata (source page, chunk text, token count, schema).

Planner (Study Planner)

Reads doc outline (or builds it via chunker), asks user preferences (depth, prior knowledge questions), outputs ordered lesson plan (topic list with estimated micro-tasks).

Optional: creates daily/weekly schedule and spaced-repetition schedule.

Retriever

Vector search + filters (page, section) → returns top-k chunks for a question or lesson.

Tutor / QA Agent (Executor)

Uses retrieved chunks + chain-of-thought style prompts to explain concepts, generate examples, create quizzes/flashcards, and answer follow-ups.

Summarizer / Synthesizer

Generates concise per-chunk summaries, “key points”, TL;DR, and prerequisite checks (“Do you know X?”).

ExcelAgent

Builds schema + transforms sample rows → generates SQL queries (via LLM function calls) to answer data questions and then summarizes outputs. (Provide column-wise chunked context as needed.)

SearchAgent (Tavily-backed)

For “deep dive” sessions, get real-time authoritative references/definitions/examples from web search (Tavily integration via LangChain available). (Tavily)

SchedulerAgent

Triggers spaced repetition sessions and batch operations.

MonitorAgent (UI agent)

Provides plan-editing UI, progress monitoring, and lets users adjust the plan and re-run the Planner.

EvaluatorAgent (optional)

Runs self-checks: asks the user a quiz, evaluates correctness, and updates mastery scores.

4 — RAG pipeline & chunking strategy (concrete)
PDF chunking
Parse: Use PyMuPDF or pdfplumber to extract text + preserve page numbers.

First pass: Identify natural boundaries — headings, section numbers, page breaks.

Semantic split: For pages with multiple topics, use an LLM splitter prompt to separate into subtopic chunks (target ~800–1500 tokens per chunk; avoid exceeding embedding model token limits). Overlap 50–150 tokens across adjacent chunks for context.

Metadata: store (doc_id, chunk_id, page_start, page_end, heading, estimated_tokens, keywords).

Summaries: for each chunk, store an LLM-generated summary (keeps context lightweight for prompt injection).

Excel chunking
Sheet-level: list all sheets and headers.

Column-wise chunking: for each column, create a column-description chunk that includes:

Column name + data type + 5 representative rows + basic stats (num unique, missing %).

Embedding for the column description + sample rows as payload.

Table-level chunk: small tables or pivot groups can be treated as document chunks (when table content is the focus).

SQL context: When user asks questions about the table, generate an LLM prompt to produce SQL (SELECT ... WHERE ...). Execute locally (pandas SQL) to get exact results, then summarize.

Retriever & retrieval
Embedding: use OpenAI embeddings or an open model embedding (your choice). Keep an abstraction so provider swap is easy.

Vector store: Qdrant for prototype (easy deploy & filtering) or Pinecone for managed. (Qdrant)

Retrieval policy:

Use top_k (e.g., 6) with score threshold + metadata filter (document id, page).

Optionally run a light re-ranker LLM to choose the 3 best chunks to include in the final system prompt to the Tutor agent.

Prompting & context assembly
System prompt template: combine user profile (prior knowledge), lesson objective, chunk summaries, and 1–2 external web snippets if needed.

Keep the final LLM context under model token limits (truncate lower-priority chunks).

Provenance & citations
Always return source (doc_id, page numbers), and if SearchAgent used web docs, include vetted citations (title + URL + snippet).

5 — Data model (JSON sketch)
Document chunk (vector store payload)
{
"chunk_id": "uuid",
"doc_id": "uuid",
"text": "....",
"summary": "one-line summary",
"page_start": 12,
"page_end": 12,
"heading": "Gradient Descent",
"tokens": 850,
"keywords": ["gradient", "optimization"],
"embedding_id": "vec_1234",
"created_at": "ISO8601"
}

User profile
{
"user_id": "u123",
"skill_tags": ["calculus", "python"],
"known_prereqs": ["linear algebra"],
"preferences": {"chunk_size":"medium","mode":"deep"}
}

Flashcard schema, Study plan schema, Interaction logs (prompt, model, response, timestamp, doc_refs).

6 — Interaction logs (what to store & sample prompts)
Store every prompt & LLM response with:
timestamp, user_id, agent_name, model_version, prompt_text, tool_calls, response_text, sources_retrieved (chunk_ids, urls), cost metrics.

Sample prompts (you’ll want these saved):
Chunker (LLM splitter)

"Split the following text into subtopics. For each chunk, return: title, chunk_text, start_page, end_page, estimated_tokens."

Planner

"Given these chunk summaries and the user's preferences (beginner, wants exercises), produce a 5-step study plan with micro-goals per chunk."

SQL Generator (ExcelAgent)

"Based on columns [A,B,C], produce a safe SQL query to return 'top 5 customers by total_purchase' and explain how to run it in pandas."

Tutor QA

"Using these 3 chunks (attached as context), explain 'backpropagation' in plain language, then give 3 practice questions increasing in difficulty. Provide source pages for each point."

SearchAgent use

"Search web for a concise, authoritative definition of 'stochastic gradient descent' and return 2 short quotes and their URLs (prioritize high-authority sources)."

7 — UI / UX ideas (student-focused)
Onboarding flow: Ask user course level + prerequisites; detect and suggest missing prerequisites (the “Do you know X?” feature).

Doc viewer: highlight current chunk in PDF viewer, clickable chunk list (left rail).

Modes: Learn (explain + examples), Revise (flashcards + spaced repetition), Test (auto-generate quiz), Deep-Dive (web search augmentation).

Plan editor: drag/drop topics, merge/split chunks, change difficulty.

Flashcards: export to Anki(Packages) or CSV.

Excel view: show sample rows, allow column selection for LLM explanation; show generated SQL and run results inline.

Transparency: show which chunks + web sources used for each answer (provenance).

Accessibility: text-to-speech, font size, dark mode.

8 — MVP vs v1 vs v2 (prioritized)
MVP (minimum to demo a working agent):
PDF upload → chunker → embed → vector DB → simple chat UI that can answer questions based on the PDF (RAG).

Save interaction logs and per-chunk summaries.

Excel basic parsing + column descriptions.

Planner that creates a simple list of topics.

v1:
Multi-agent split: Planner + Executor + Indexer.

Flashcards and exporting.

Spaced repetition scheduler.

Tavily SearchAgent integration for optional external references. (Tavily)

v2:
Collaborative study groups, mobile app, advanced analytics (mastery curves), offline/local-only mode, instructor annotations, plugin architecture for new tools.

9 — Components & tech choices (why these)
LangChain + LangGraph — agent frameworks, easy RAG patterns and partner integrations. (LangChain Docs)

Tavily — low-latency, LLM-first web search with LangChain integration (great for deep-dive contextual evidence). (Tavily)

Vector DB: Qdrant (prototype; open-source, good filtering, LangChain support) or Pinecone (managed, hardened SLA). (Qdrant)

Embeddings & LLMs: abstract provider (OpenAI / Anthropic / local LLMs) — keep provider-agnostic interfaces.

FastAPI: async, lightweight backend for webhooks, file uploads, and worker orchestration.

React: rich, componentized frontend; good for interactive PDF viewer + chat.

Storage: S3 or MinIO for PDF/Excel.

Workers: Celery + Redis (or managed alternatives) for background indexing and scheduled sessions.

OCR & Table tools: Tesseract/PDFPlumber/Camelot for scanned PDFs and tables; pandas/openpyxl for Excel.

10 — Roadmap / execution checklist (phased — no time estimates)
Phase A — Foundations (MVP code skeleton)
Create repo & monorepo structure (frontend + backend + infra).

Setup FastAPI skeleton with auth, file upload endpoints, and interaction-log endpoint.

Build React skeleton: upload page, simple chat UI.

Choose vector DB (Qdrant recommended) and create-index interface. (Qdrant)

Phase B — Ingestion & RAG core
Implement PDF extractor (PyMuPDF/pdfplumber), LLM-based semantic chunker, metadata capture.

Integrate embedding provider and vector store (indexer + retriever).

Implement basic RAG chain: retrieve top-k chunks → assemble context → LLM answer.

Phase C — UX & Planner
Build Planner agent: read chunk summaries and produce a study plan.

Add PDF viewer with chunk highlights and a sidebar plan editor.

Phase D — Excel + SQL support
Implement Excel ingestion, header detection, column chunking, column embeddings.

Add SQL generation agent and local execution (pandas). Provide a safe execution sandbox.

Phase E — Multi-agent + Search integration
Add explicit Planner + Executor multi-agent orchestration (LangChain agents or LangGraph).

Integrate Tavily for optional web evidence augmentation. (Tavily Docs)

Phase F — Advanced features
Spaced repetition scheduler; flashcard export; progress analytics; monitoring UI; logging & telemetry.

Add ability to export interaction logs (prompts + responses) for submission per project requirements.

Phase G — Hardening & infra
Dockerize services; CI/CD; secure secrets (Vault); deploy (k8s or managed), set up Sentry/Grafana, add data deletion & compliance rules.

Deliverables checklist (what to submit)
Source code (repo link) with README and startup instructions.

System design document (architecture, data design, components, reasons).

Interaction logs (prompts + chat history + model versions + timestamps).

Screenshots or demo video of flows (upload → plan → study session → retrieval).

Optional: docker-compose or k8s manifests + infra docs.

11 — Testing, metrics & evaluation
Accuracy: retrieval precision (how often the retrieved chunk contains the ground-truth answer).

Utility: user satisfaction score (qualitative), time-to-clarity (how quickly student understands concept).

Performance: retrieval latency, embedding/index throughput.

Cost: tokens/cost per session.

Robustness: hallucination rate (compare LLM answers to source chunks), provenance completeness.

12 — Privacy & safety
Offer local-only mode (no cloud embeddings) for sensitive course material.

Encryption at rest & in transit.

Allow users to opt-out of telemetry.

Sanitize user-supplied SQL to avoid malicious execution; run Excel/SQL in a read-only sandbox.

13 — Example interaction (end-to-end)
User uploads “AdvancedAlgorithms.pdf”.

Chunker splits into chunks (chapter/section level); Indexer embeds them.

Planner prompts user: “Before we start: do you already know Big-O notation?” If user says “no”, Planner adds a prerequisite micro-lesson from the PDF and a 3-question quiz.

User asks: “Explain Dijkstra in simple terms.” Retriever gets top-5 chunks, Tutor produces explanation + 2 example walkthroughs + links to original pages.

User wants deeper context → SearchAgent fires Tavily to fetch an up-to-date blog or spec and returns 2 external citations. (Tavily)

14 — Interaction log export format (example)
CSV / JSON with:
timestamp, user_id, agent, prompt, model, model_version, response, chunk_ids, urls, cost

15 — Quick implementation tips & gotchas
Chunking matters more than model size: well-structured chunks + good metadata give best RAG results.

Keep prompts modular: small system prompt + dynamic context assembly.

Embed summaries, not full text, when you want fast context assembly.

Version all indices (so you can roll back).

Sanitize Excel execution: only allow SELECT-like computations and limit expensive joins.

16 — Final notes & next actionable steps (pick from these)
I can generate: 1) a repo skeleton (FastAPI + React + simple RAG flow), 2) prompts & LLM templates for each agent, or 3) a detailed system design doc in markdown ready for submission. Tell me which of these you want first and I’ll produce it now (I’ll include the prompts you must log for submission).

If you want I can also produce:
a JSON schema for all DB tables and vector payloads, or

example LangChain agent code for the Planner + Executor + Tavily Search integration (including the exact prompts).

Which of those should I generate in this turn?
