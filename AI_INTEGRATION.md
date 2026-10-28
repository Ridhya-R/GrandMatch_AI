# GrantMatch — AI Integration Guide

## What Was Added

This document describes the AI scholarship recommendation feature integrated into the existing GrantMatch platform.

---

## Architecture Overview

```
React Frontend
     │
     │  POST /api/recommendations
     ▼
Node.js / Express Backend  (existing)
     │  Uses existing JWT auth, User model, Opportunity model
     │  Runs deterministic matcher.js eligibility engine
     │
     │  Optional: POST http://localhost:8000/rank
     ▼
Python FastAPI AI Service  (new — ai-service/)
     │
     ▼
scikit-learn DecisionTreeClassifier (trained on synthetic data)
```

The ML model **assists re-ranking** of results. The deterministic engine in `backend/utils/matcher.js` is always the **authoritative source** for eligibility.

---

## Files Created or Modified

### New Files

| File | Purpose |
|------|---------|
| `ai-service/main.py` | FastAPI microservice exposing `/rank` and `/health` endpoints |
| `ai-service/trainer.py` | DecisionTree training, evaluation, and `predict_eligibility()` |
| `ai-service/data_generator.py` | Synthetic training data generator (CSV + Excel output) |
| `ai-service/requirements.txt` | Python dependencies |
| `ai-service/.env` | AI service environment config |
| `ai-service/.gitignore` | Excludes model files and venv from git |
| `backend/routes/recommendationRoutes.js` | New Node.js route: `POST /api/recommendations` |
| `frontend/src/components/AIRecommendations.jsx` | React UI component for the recommendation panel |

### Modified Files

| File | Change |
|------|--------|
| `backend/server.js` | Mounted `/api/recommendations` route; updated health check |
| `backend/.env` | Added `AI_SERVICE_URL` environment variable |
| `frontend/src/services/api.js` | Added `getAIRecommendations()` API method |
| `frontend/src/App.jsx` | Added `ai-recommended` page routing & component integration |
| `frontend/src/components/Navbar.jsx` | Added "AI Recommended" nav link & profile dropdown action |
| `frontend/src/pages/Opportunities.jsx` | Added AI Recommendation callout banner & switch |
| `frontend/src/pages/Home.jsx` | Added AI Recommendations hero CTA button |
| `frontend/src/pages/Dashboard.jsx` | Integrated `<AIRecommendations />` component |
| `run.bat` | Added Python AI service launch step |

---

## Environment Variables

### backend/.env
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=                          # Leave blank for embedded MongoDB fallback
JWT_SECRET=grantmatch_super_secret_jwt_key_2026
AI_SERVICE_URL=http://localhost:8000  # Python FastAPI microservice
```

### ai-service/.env
```env
AI_SERVICE_PORT=8000
AI_SERVICE_CORS_ORIGINS=http://localhost:5000
```

---

## Installation & Startup

### First-time Setup

```bash
# Install Python AI service dependencies
cd ai-service
pip install -r requirements.txt

# Train the Decision Tree model (generates ai-service/models/)
python trainer.py
```

### Running the Platform

**Option A — Run everything with one command:**
```bat
run.bat
```

**Option B — Start services individually:**
```bash
# Terminal 1: Backend (Node.js)
cd backend
node server.js

# Terminal 2: AI Service (Python)
cd ai-service
python main.py

# Terminal 3: Frontend (Vite)
cd frontend
npm run dev
```

**Services:**
- Frontend:   http://localhost:5173
- Backend:    http://localhost:5000/api
- AI Service: http://localhost:8000/health (optional)

---

## How the Student Profile Connects to the Engine

The `POST /api/recommendations` endpoint:

1. Loads the **full authenticated student profile** from MongoDB via `req.user` (set by `requireAuth` middleware using the existing JWT).
2. Uses these profile fields for matching:
   - `educationLevel`, `course` → Education & field matching
   - `percentage` → Minimum academic score check
   - `annualIncome` → Income ceiling check
   - `age` → Age range check
   - `state` → Location eligibility
   - `category` → Reserved category eligibility (SC/ST/OBC/EWS)
   - `gender` → Gender-specific scholarships
   - `nationality` → Citizenship requirements
   - `fundingPurpose` → Purpose alignment

**No additional data entry is required** — the system uses the profile the student already completed.

---

## How the Eligibility Engine and Decision Tree Work Together

### Step 1: Deterministic Eligibility Engine (always runs)
`backend/utils/matcher.js` evaluates each scholarship against profile criteria, producing:
- `eligibilityMatch` (0–100%)
- `reasons` — what criteria were satisfied
- `gaps` — what requirements were not met
- `breakdown` — per-criterion pass/fail/unknown

Each scholarship is classified:
- **eligible** → ≥75% match, no gaps
- **partial** → 40–74% match
- **ineligible** → <40% match

### Step 2: ML Re-ranking (optional, advisory only)
The Python FastAPI service calls `predict_eligibility()` which feeds student + scholarship features through the trained `DecisionTreeClassifier`. The returned probability (`ml_rank_score`) is used to re-sort eligible and partial results.

**Critical design constraint:** If the ML service is offline, times out (5s), or returns an error — the deterministic results are returned unchanged. The recommendation feature **never fails** due to AI unavailability.

---

## ML Model Details

| Property | Value |
|----------|-------|
| Algorithm | `sklearn.tree.DecisionTreeClassifier` |
| Training data | Synthetic (rule-generated, 1200 students × 7 scholarships = 8,400 rows) |
| Features | Education level, category, gender, funding purpose, percentage, age, income, scholarship thresholds |
| Labels | Generated by the same deterministic eligibility rules (not random) |
| Persistence | `joblib` → `ai-service/models/scholarship_dt.joblib` |
| Evaluation | Precision, Recall, F1, Confusion Matrix (on synthetic held-out test set) |

> **⚠️ WARNING:** Model accuracy reflects rule consistency on synthetic data — NOT real-world prediction quality. Replace with real anonymised applicant data before production deployment.

---

## Verification Checklist

- [x] Existing student profiles load correctly (unchanged `/api/auth/me`)
- [x] Existing scholarship records remain intact (no schema changes)
- [x] Multiple scholarships returned per student (tested with demo user)
- [x] Different scholarships apply different eligibility conditions (matcher.js per-scholarship)
- [x] Missing profile fields handled safely (profileGaps array returned)
- [x] Expired scholarships excluded (`deadline: { $gte: now }` filter)
- [x] Existing auth/authz unchanged (recommendationRoutes uses same `requireAuth`)
- [x] API failures do not crash the site (ML service failure handled, returns deterministic results)
- [x] Recommendation UI works on mobile (responsive flex/grid layout)
- [x] Existing application still builds and runs (`npm run dev` unchanged)

---

## Demo Credentials

| Role | Email | Password |
|------|-------|---------|
| Student | user@grantmatch.org | User@123 |
| Admin | admin@grantmatch.org | Admin@123 |
