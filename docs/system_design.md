# StudyBuddy AI - System Design

## Architecture Overview (Day 3 - Multi-Agent System)

```
Frontend (React + Tailwind)
        ↓
    FastAPI Backend
        ↓
   Multi-Agent Orchestration (LangGraph)
        ↓
┌─────────────────────────────────────────────────┐
│              ConductorAgent                     │
│  (Intent Analysis & Workflow Orchestration)    │
└─────────────────┬───────────────────────────────┘
                  ↓
     ┌────────────┴────────────┐
     ↓                         ↓
┌──────────┐              ┌──────────┐
│ Planning │              │ Tutoring │
│  Flow    │              │   Flow   │
└─────┬────┘              └─────┬────┘
      ↓                         ↓
┌─────────────┐           ┌─────────────┐
│PlannerAgent │           │ SimpleRAG   │
│   +         │           │ (Existing)  │
│SearchAgent  │           │             │
└─────────────┘           └─────────────┘
      ↓                         ↓
┌─────────────┐           ┌─────────────┐
│Study Plan   │           │Chat Response│
│Generation   │           │w/ Context   │
└─────────────┘           └─────────────┘
```

## Day 3 Implementation - Multi-Agent Orchestration

### Core Agent Architecture

#### 1. **ConductorAgent** (`conductor.py`)

- **Purpose**: Orchestrates multi-agent workflows using LangGraph
- **Responsibilities**:
  - Analyze user intent (plan, chat, search, help)
  - Route requests to appropriate agents
  - Coordinate agent interactions
  - Aggregate and format final responses

**LangGraph Workflow**:

```
Start → Analyze Intent → Route by Intent
  ↓
[Plan]    [Search]    [Chat]     [Help]
  ↓         ↓          ↓          ↓
Retrieve → Web      → Retrieve → Generate
Context    Search     Context    Response
  ↓         ↓          ↓          ↓
Create  → Create   → Generate → End
Plan      Plan       Response
  ↓         ↓          ↓
Generate Response → End
Response
  ↓
End
```

#### 2. **PlannerAgent** (`planner.py`)

- **Purpose**: Creates comprehensive study plans from topics and context
- **Input**: Topic, context chunks, user preferences
- **Output**: Structured JSON study plan with:
  - Title and overview
  - Duration and difficulty level
  - Organized sections with learning objectives
  - Subsections with activities and resources
  - Prerequisites and final assessment

**Plan Structure**:

```json
{
  "title": "Study Plan Title",
  "overview": "Brief overview",
  "duration": "4 weeks",
  "difficulty": "Intermediate",
  "sections": [
    {
      "id": "section_1",
      "title": "Section Title",
      "description": "What this covers",
      "learning_objectives": ["Objective 1", "Objective 2"],
      "subsections": [
        {
          "title": "Subsection",
          "content": "Detailed content",
          "activities": ["Activity 1"],
          "resources": ["Resource 1"],
          "estimated_time": "2 hours"
        }
      ]
    }
  ],
  "prerequisites": ["Prereq 1"],
  "final_assessment": "Final project description"
}
```

#### 3. **SearchAgent** (`search_agent.py`)

- **Purpose**: Web search using Tavily API for external resources
- **Capabilities**:
  - General topic search
  - Learning resources discovery
  - Practice problems search
  - Information verification
  - Latest updates retrieval

**Features**:

- Tavily API integration
- Structured result formatting
- Educational content filtering
- Source credibility scoring

#### 4. **Enhanced SimpleRAG** (Existing)

- **Purpose**: Document-based question answering
- **Integration**: Used by ConductorAgent for chat intents
- **Features**: Context retrieval, response generation, interaction logging

### API Layer Enhancements

#### New Endpoints

1. **Study Plan Management** (`/api/plan/`)

   - `POST /create`: Generate new study plans
   - `POST /refine`: Refine existing plans
   - `GET /template/{difficulty}`: Get plan templates

2. **Enhanced Chat** (`/api/chat`)
   - Added `use_multi_agent` parameter
   - Returns intent, search results, study plans
   - Backward compatible with simple RAG

### Frontend Enhancements

#### 1. **Enhanced ChatBox** (`ChatBox.jsx`)

- **Multi-Agent Toggle**: Switch between simple RAG and multi-agent mode
- **Intent Display**: Shows detected intent (plan, chat, search, help)
- **Web Search Results**: Formatted display of Tavily search results
- **Study Plan Integration**: Embedded PlanEditor for generated plans
- **Agent Steps Visualization**: Real-time step tracking

#### 2. **PlanEditor Component** (`PlanEditor.jsx`)

- **Interactive Study Plans**: Collapsible tree structure
- **Edit Capabilities**: Inline editing of titles, descriptions
- **Subsection Management**: Add/remove subsections
- **Visual Hierarchy**: Clear section organization
- **Responsive Design**: Works on all screen sizes

#### 3. **Study Plans Tab** (Home.jsx)

- **Plan Generation**: Topic input with AI generation
- **Example Topics**: Quick-start options
- **Real-time Creation**: Loading states and progress
- **Plan Management**: Edit and refine generated plans

#### 4. **Enhanced UI/UX**

- **Beautiful Footer**: "Made with love by Rahul" + GitHub link
- **Improved Styling**: Better gradients, spacing, typography
- **Multi-Agent Indicators**: Visual cues for agent activity
- **Responsive Design**: Mobile-friendly layouts

## Technical Stack (Updated)

### Backend

- **FastAPI**: API framework
- **LangGraph**: Multi-agent orchestration
- **LangChain**: Agent framework and integrations
- **OpenAI**: GPT-4 for planning and chat
- **Tavily**: Web search API
- **Qdrant**: Vector database (existing)
- **Python 3.8+**: Runtime

### Frontend

- **React 18**: UI framework
- **Tailwind CSS**: Styling
- **Heroicons**: Icon library
- **JavaScript ES6+**: Language

### Databases & Storage

- **Qdrant**: Vector embeddings storage
- **Local Storage**: File uploads
- **JSON**: Study plan storage

## Data Flow (Day 3)

### 1. Multi-Agent Chat Flow

```
User Query → ConductorAgent → Intent Analysis
    ↓
Intent-Based Routing:
- "plan" → PlannerAgent + SearchAgent → Study Plan
- "search" → SearchAgent → Web Results
- "chat" → SimpleRAG → Document Q&A
- "help" → Direct Response
    ↓
Response Aggregation → Frontend Display
```

### 2. Study Plan Creation Flow

```
Topic Input → PlannerAgent
    ↓
Context Retrieval (if documents available)
    ↓
LLM-Based Plan Generation
    ↓
Structured JSON Output
    ↓
Frontend PlanEditor Display
    ↓
User Editing (optional)
```

### 3. Web Search Integration Flow

```
Search Query → SearchAgent → Tavily API
    ↓
Result Filtering & Formatting
    ↓
Educational Content Prioritization
    ↓
Frontend Results Display with Sources
```

## Security & Configuration

### Environment Variables

- `OPENAI_API_KEY`: Required for LLM functionality
- `TAVILY_API_KEY`: Optional for web search
- `QDRANT_HOST/PORT`: Vector database connection
- Other existing configuration

### Error Handling

- Graceful fallbacks when APIs unavailable
- Multi-agent workflow error recovery
- User-friendly error messages
- Comprehensive logging

## Performance Optimizations

- **Async Processing**: Non-blocking agent orchestration
- **Caching**: LLM response caching for common queries
- **Streaming**: Real-time agent step updates
- **Lazy Loading**: Component-based frontend loading

## Future Enhancements (Day 4+)

- **Persistent Study Plans**: Database storage
- **User Accounts**: Personal plan management
- **Progress Tracking**: Learning analytics
- **Advanced Search**: Filtered educational content
- **Collaborative Features**: Shared study plans
- **Mobile App**: React Native implementation
- **Offline Mode**: Local content caching
