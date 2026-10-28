"""
GrantMatch AI — FastAPI Microservice
======================================
Exposes the trained Decision Tree model as a REST endpoint.
Consumed by the Node.js backend via an internal service call.

Architecture:
  React Frontend → Node.js/Express API → (this) FastAPI AI Service
                                          ↓
                               DecisionTreeClassifier (joblib)
                               + Deterministic eligibility guard

The ML model ASSISTS ranking — it does NOT override eligibility rules.
"""

from __future__ import annotations

import os
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any

import joblib
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Local modules
from trainer import train_model, predict_eligibility

load_dotenv()

# ---------------------------------------------------------------------------
# Startup: ensure model exists
# ---------------------------------------------------------------------------
_clf  = None
_meta = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load (or train) the model on startup."""
    global _clf, _meta
    print("[AI Service] Initialising scholarship recommendation model…")
    _meta = train_model(n_students=1200, force_retrain=False)
    _clf  = joblib.load(_meta["model_path"])
    print(f"[AI Service] Model ready. F1={_meta['metrics']['f1']}")
    yield
    print("[AI Service] Shutting down.")


app = FastAPI(
    title="GrantMatch AI Recommendation Service",
    version="1.0.0",
    description=(
        "Provides ML-assisted scholarship eligibility ranking. "
        "The deterministic eligibility engine in the Node.js backend "
        "remains the authoritative source — this service provides ranking hints only."
    ),
    lifespan=lifespan,
)

# Allow the Node.js backend to call this service
ALLOWED_ORIGINS = os.getenv("AI_SERVICE_CORS_ORIGINS", "http://localhost:5000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Request / Response Schemas
# ---------------------------------------------------------------------------

class StudentProfile(BaseModel):
    educationLevel:  str  = Field(default="")
    category:        str  = Field(default="General")
    gender:          str  = Field(default="Any")
    fundingPurpose:  str  = Field(default="Education")
    percentage:      float | None = Field(default=None)
    age:             int  | None  = Field(default=None)
    annualIncome:    float | None = Field(default=None)


class ScholarshipBrief(BaseModel):
    opp_id:              str  = Field(default="", alias="_id")
    name:                str  = Field(default="")
    genderEligibility:   str  = Field(default="Any")
    educationLevels:     list[str] = Field(default_factory=list)
    categoryEligibility: list[str] = Field(default_factory=list)
    minimumPercentage:   float = Field(default=0)
    minAge:              int   = Field(default=0)
    maxAge:              int   = Field(default=100)
    incomeLimit:         float = Field(default=0)
    sch_id:              int   = Field(default=0)

    model_config = {"populate_by_name": True}



class RankRequest(BaseModel):
    student:       StudentProfile
    scholarships:  list[dict[str, Any]]


class RankResponse(BaseModel):
    ranked:     list[dict[str, Any]]
    model_meta: dict[str, Any]
    disclaimer: str


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

DISCLAIMER = (
    "ML ranking is advisory only and based on synthetic training data. "
    "Eligibility is determined by the verified rule-based engine. "
    "Always verify current requirements on the official scholarship provider website."
)


@app.get("/health")
def health():
    return {
        "status": "online",
        "service": "GrantMatch AI Recommendation Service",
        "model_loaded": _clf is not None,
        "model_f1": _meta["metrics"]["f1"] if _meta else None,
        "warning": "Model trained on synthetic data only.",
    }


@app.post("/rank", response_model=RankResponse)
def rank_scholarships(body: RankRequest):
    """
    Given a student profile and a list of scholarships (pre-filtered by the
    deterministic engine as eligible), returns them re-ranked by ML probability.

    The ML model is never used to override eligibility — only to order results.
    """
    if _clf is None or _meta is None:
        raise HTTPException(status_code=503, detail="Model not yet loaded.")

    student_dict = body.student.model_dump()
    ranked = []

    for sch in body.scholarships:
        try:
            ml_result = predict_eligibility(student_dict, sch, _clf, _meta)
        except Exception as e:
            # If prediction fails for any scholarship, pass through unranked
            ml_result = {"eligible_prob": 0.5, "eligible_pred": True}

        ranked.append({
            **sch,
            "ml_rank_score": ml_result["eligible_prob"],
            "ml_eligible":   ml_result["eligible_pred"],
        })

    # Sort by ML probability descending (higher = model says more eligible)
    ranked.sort(key=lambda x: x.get("ml_rank_score", 0), reverse=True)

    return RankResponse(
        ranked=ranked,
        model_meta={
            "f1":     _meta["metrics"]["f1"],
            "recall": _meta["metrics"]["recall"],
            "warning": _meta["metrics"]["data_warning"],
        },
        disclaimer=DISCLAIMER,
    )


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("AI_SERVICE_PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
