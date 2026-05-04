# NyayaMitra Backend — API Reference & Setup Guide

> AI co-pilot for the Court Case Monitoring System (CCMS).  
> Turns High Court judgment PDFs into verified, actionable plans for government officers.

---

## Quick Start

### Prerequisites

- Python 3.11+
- pip

### Installation

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Linux/Mac)
source venv/bin/activate

# Install dependencies
pip install -r requirments.txt
```

### Environment Variables

Create a `.env` file inside the `backend/` folder:

```env
OPENROUTER_API_KEY=your_openrouter_api_key
JWT_SECRET=your_jwt_secret_here
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=60
LOG_LEVEL=INFO
```

### Run the Server

```bash
cd backend
uvicorn main:app --reload
```

Server will start at `http://127.0.0.1:8000`

### Run Tests

```bash
cd backend

# Multi-tenant auth test
python -m tests.test_multi_tenant

# Full AI pipeline test (requires OpenRouter API key)
python -m tests.test_pipeline
```

---

## Database Schema (SQLite)

All tables are auto-created on first run. The database file is stored at `backend/data/nayamitra.db`.

| Table | Purpose |
|-------|---------|
| `tenants` | Departments / court jurisdictions |
| `users` | Authenticated users with roles and tenant mapping |
| `documents` | Uploaded PDFs with processing status |
| `action_plans` | AI-extracted JSON action plans linked to documents |
| `verifications` | Field-level approve/edit tracking |
| `audit_log` | Immutable log of every user action |

### User Roles

| Role | Permissions |
|------|-------------|
| `law_officer` | Upload PDFs, view own documents |
| `reviewer` | View all tenant documents, verify/approve action plans |
| `admin` | Full access across the tenant |

---

## API Reference

Base URL: `http://localhost:8000`

All endpoints (except `/api/auth/token`) require a Bearer token in the `Authorization` header.

---

### Auth

#### `POST /api/auth/token`

Login and receive a JWT access token.

**Request:** `application/x-www-form-urlencoded`

| Field | Type | Description |
|-------|------|-------------|
| `username` | string | User's email address |
| `password` | string | User's password |

**Response:** `200 OK`

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Error:** `401 Unauthorized`

```json
{
  "detail": "Incorrect email or password"
}
```

---

### Documents

#### `POST /api/upload`

Upload a judgment PDF. The AI pipeline runs immediately and returns the extracted action plan.

**Auth:** `law_officer`, `admin`  
**Request:** `multipart/form-data`

| Field | Type | Description |
|-------|------|-------------|
| `file` | file | PDF file (must end with `.pdf`) |

**Response:** `200 OK`

```json
{
  "doc_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "message": "Extraction complete, pending verification.",
  "action_plan": {
    "case_summary": {
      "context": "Appeal against NCLAT order in insolvency proceedings.",
      "decision": "Appeals dismissed.",
      "impact": "The impugned order stands.",
      "case_outcome_type": "Terminal",
      "is_action_required": false,
      "reasoning": {
        "primary_reason": "Court found no merit in the appeals.",
        "supporting_factors": ["Procedural compliance verified", "No legal error found"]
      }
    },
    "case_metadata": {
      "case_type": {
        "value": "Civil Appeal",
        "source_text": "CIVIL APPEAL NOS.11070 - 11071 OF 2024",
        "surrounding_context": "IN THE SUPREME COURT OF INDIA CIVIL APPELLATE JURISDICTION CIVIL APPEAL NOS.11070...",
        "page_num": 1,
        "bbox": [108.0, 261.9, 523.3, 309.6],
        "paragraph_id": "p1_b5",
        "confidence_score": 0.83,
        "confidence_band": "MEDIUM",
        "confidence_explanation": {
          "match_type": "exact_match",
          "boost_type": "none",
          "base_similarity": 0.83,
          "grounding_mode": "verbatim"
        },
        "anchor_offset": { "start": 0, "end": 29 },
        "status": "Pending",
        "review": { "approved": false, "edited_value": null, "reviewed_by": null }
      },
      "case_number": { "..." : "same structure as above" },
      "court_name": { "..." : "same structure" },
      "date_of_order": { "..." : "same structure" },
      "judge_name": { "..." : "same structure" },
      "appellant": { "..." : "same structure" },
      "respondent": { "..." : "same structure" },
      "counsel_details": { "..." : "same structure" }
    },
    "directives": [
      {
        "summary": "The appeals are dismissed as the impugned order is upheld.",
        "directive": "we uphold the impugned order dated 18.01.2024 passed by the NCLAT and dismiss the present appeals.",
        "deadline": "N/A",
        "deadline_reason": "No actionable directive",
        "urgency": "LOW",
        "action_plan": {
          "what": "Close file / Record outcome",
          "who": "Legal Department",
          "when": "N/A",
          "priority": "LOW"
        },
        "source_text": "we uphold the impugned order dated 18.01.2024...",
        "surrounding_context": "30. In view of the above, we uphold the impugned order...",
        "page_num": 8,
        "bbox": [72.0, 561.1, 558.9, 589.0],
        "paragraph_id": "p8_b5",
        "confidence_score": 0.95,
        "confidence_band": "HIGH",
        "confidence_explanation": {
          "match_type": "exact_match",
          "boost_type": "directive_boost",
          "base_similarity": 0.92,
          "grounding_mode": "verbatim"
        },
        "anchor_offset": { "start": 26, "end": 124 },
        "historical_precedents": [
          {
            "case_number": "WA/4412/2022",
            "similarity_score": 0.70,
            "historical_directive": "We uphold the impugned order and dismiss the appeal. No costs.",
            "department_action_taken": "File Closed — SLP Considered",
            "outcome": "SLP filed within 90 days"
          },
          {
            "case_number": "CRLA/890/2022",
            "similarity_score": 0.42,
            "historical_directive": "The conviction and sentence of the appellant are set aside...",
            "department_action_taken": "Release Order Issued",
            "outcome": "Complied — Appellant Released"
          }
        ],
        "status": "Pending",
        "review": { "approved": false, "edited_value": null, "reviewed_by": null }
      }
    ],
    "limitation_data": {
      "is_appealable": false,
      "statutory_period_days": 0,
      "date_of_order": "4 April, 2025",
      "computed_deadline_date": "N/A",
      "urgency_status": "GREEN",
      "reasoning": "Case outcome is 'Terminal'. No appeal deadline applies — close file and record outcome."
    }
  }
}
```

**Error:** `400 Bad Request` — Non-PDF file  
**Error:** `500 Internal Server Error` — Pipeline failure

---

#### `GET /api/documents`

List all documents accessible to the current user.

**Auth:** Any authenticated user  
**Access:** `law_officer` sees only their own documents. `reviewer` / `admin` see all documents within their tenant.

**Response:** `200 OK`

```json
[
  {
    "id": "a1b2c3d4-...",
    "status": "Pending Verification",
    "pdf_path": "uploads/a1b2c3d4_judgment.pdf"
  },
  {
    "id": "e5f6a7b8-...",
    "status": "Approved",
    "pdf_path": "uploads/e5f6a7b8_order.pdf"
  }
]
```

---

#### `GET /api/document/{doc_id}`

Get full details of a specific document including its action plan.

**Auth:** Any authenticated user (must belong to the same tenant)

**Response:** `200 OK`

```json
{
  "id": "a1b2c3d4-...",
  "status": "Pending Verification",
  "pdf_path": "uploads/a1b2c3d4_judgment.pdf",
  "tenant_id": "tenant_1",
  "action_plan": { "..." : "Full ActionPlan object (same as upload response)" }
}
```

**Error:** `404 Not Found` — Document doesn't exist or user doesn't have access

---

#### `POST /api/verify/{doc_id}`

Approve and finalize a document's action plan. Sets document status to `Approved`.

**Auth:** `reviewer`, `admin`  
**Request:** `application/json` — Full `ActionPlan` object (with any human edits applied)

**Response:** `200 OK`

```json
{
  "message": "Document verified and saved",
  "doc_id": "a1b2c3d4-..."
}
```

**Error:** `404 Not Found` — Document doesn't exist or user doesn't have access  
**Error:** `403 Forbidden` — User role is not `reviewer` or `admin`

---

### Dashboard

#### `GET /api/dashboard/actions`

Get all approved documents and their finalized action plans for the current tenant.

**Auth:** Any authenticated user

**Response:** `200 OK`

```json
[
  {
    "id": "a1b2c3d4-...",
    "status": "Approved",
    "pdf_path": "uploads/a1b2c3d4_judgment.pdf",
    "tenant_id": "tenant_1",
    "action_plan": { "..." : "Full ActionPlan object" }
  }
]
```

---

### Feedback

#### `POST /api/router/feedback`

Submit a department routing correction. The system logs the correction and updates internal routing weights for future extractions.

**Auth:** Any authenticated user  
**Request:** `application/json`

```json
{
  "directive_text": "Evict the encroachers from the tank bed.",
  "original_department": "Police Department",
  "corrected_department": "Revenue Department"
}
```

**Response:** `200 OK`

```json
{
  "message": "Routing weights updated for future extractions.",
  "department": "Revenue Department",
  "total_corrections": 3
}
```

---

## Key Data Structures

### Confidence Bands

| Band | Score Range | Meaning |
|------|------------|---------|
| `HIGH` | ≥ 0.85 | Exact or near-exact verbatim match found in PDF |
| `MEDIUM` | 0.60 – 0.84 | Fuzzy match found, may need human review |
| `LOW` | < 0.60 | Weak match or unanchored, requires manual verification |

### Grounding Modes

| Mode | Description |
|------|-------------|
| `verbatim` | Exact text found in PDF — highest trust |
| `fuzzy` | Close match via difflib (>0.75 similarity) |
| `fallback` | Token-overlap match — last resort anchoring |
| `unanchored` | No match found — bbox will be `[0,0,0,0]` |

### Document Status Flow

```
Processing → Pending Verification → Approved
                                  → Failed
```

---

## Project Structure

```
backend/
├── main.py                  # FastAPI entry point
├── config.py                # Pydantic settings (reads .env)
├── logger.py                # Centralized logging
├── .env                     # Environment variables
├── requirments.txt          # Python dependencies
│
├── api/
│   ├── auth.py              # JWT login, RBAC middleware
│   ├── routes.py            # Document upload, list, verify endpoints
│   └── feedback.py          # Learning router feedback endpoint
│
├── agents/
│   ├── parseragent.py       # PDF → TextBlocks with paragraph IDs
│   ├── extractor_agent.py   # LLM → Case metadata extraction
│   ├── operative_agent.py   # LLM → Operative portion isolation
│   ├── drective_agent.py    # LLM → Verbatim directive extraction
│   └── human_loop_agent.py  # Grounding engine + verification formatter
│
├── core/
│   └── schemas.py           # All Pydantic models & LangGraph state
│
├── database/
│   ├── db.py                # SQLite multi-tenant CRUD
│   └── vector_db.py         # ChromaDB precedent similarity search
│
├── utils/
│   ├── llm.py               # LLM factory (OpenRouter)
│   ├── pipeline.py          # LangGraph workflow orchestration
│   └── limitation_engine.py # Deterministic deadline calculator
│
├── tests/
│   ├── test_pipeline.py     # End-to-end AI pipeline test
│   └── test_multi_tenant.py # Auth & multi-tenant isolation test
│
├── data/
│   └── nayamitra.db         # SQLite database (auto-created)
│
└── sample_dataset/
    └── legal_dataset(2025).pdf  # Sample judgment PDF for testing
```
