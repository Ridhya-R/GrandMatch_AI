"""
GrantMatch AI — Decision Tree Classifier Training Module
=========================================================
Trains a scikit-learn DecisionTreeClassifier on synthetic scholarship
eligibility data. Evaluates with precision, recall, F1, and confusion matrix.
Persists the trained model and encoders with joblib.

⚠️  SYNTHETIC DATA WARNING:
    This module uses rule-generated synthetic data for prototype development.
    Accuracy on this data reflects rule consistency, NOT real-world performance.
    Replace with real anonymised applicant data before production use.
"""

import os
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    precision_score,
    recall_score,
    f1_score,
)

# We import the generator so training is self-contained
from data_generator import generate_dataset, encode_features, EDUCATION_LEVELS, CATEGORIES, GENDERS, PURPOSES

MODEL_PATH = Path("models/scholarship_dt.joblib")
META_PATH  = Path("models/model_meta.joblib")

FEATURE_COLS = [
    "education_level_enc",
    "category_enc",
    "gender_enc",
    "funding_purpose_enc",
    "percentage",
    "age",
    "annual_income",
    "sch_id",
    "sch_min_pct",
    "sch_min_age",
    "sch_max_age",
    "sch_income_limit",
    "sch_gender_restricted",
    "sch_edu_any",
    "sch_cat_any",
]


def train_model(n_students: int = 1200, force_retrain: bool = False) -> dict:
    """
    Trains (or loads) the DecisionTree model.
    Returns a dict with model artifact path and evaluation metrics.
    """
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)

    if MODEL_PATH.exists() and not force_retrain:
        print("[Trainer] Existing model found — skipping retraining.")
        return joblib.load(META_PATH)

    print(f"[Trainer] Generating synthetic dataset ({n_students} students × 7 scholarships)…")
    df_raw = generate_dataset(n_students=n_students)
    df     = encode_features(df_raw)

    X = df[FEATURE_COLS].values
    y = df["eligible"].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print("[Trainer] Training DecisionTreeClassifier…")
    clf = DecisionTreeClassifier(
        max_depth=8,
        min_samples_leaf=5,
        class_weight="balanced",
        random_state=42,
    )
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)

    precision = precision_score(y_test, y_pred, zero_division=0)
    recall    = recall_score(y_test, y_pred, zero_division=0)
    f1        = f1_score(y_test, y_pred, zero_division=0)
    cm        = confusion_matrix(y_test, y_pred).tolist()

    print("\n[Trainer] -- Evaluation Report (SYNTHETIC DATA) -----------------")
    print(classification_report(y_test, y_pred, target_names=["Not Eligible", "Eligible"]))
    print(f"[Trainer] Confusion Matrix: {cm}")
    print("[Trainer] WARNING: These metrics reflect rule consistency on synthetic data,")
    print("[Trainer]    NOT real-world scholarship eligibility prediction quality.")
    print("[Trainer] ----------------------------------------------------------\n")


    meta = {
        "model_path": str(MODEL_PATH),
        "feature_cols": FEATURE_COLS,
        "education_levels": EDUCATION_LEVELS,
        "categories": CATEGORIES,
        "genders": GENDERS,
        "purposes": PURPOSES,
        "metrics": {
            "precision": round(float(precision), 4),
            "recall":    round(float(recall), 4),
            "f1":        round(float(f1), 4),
            "confusion_matrix": cm,
            "data_warning": (
                "Metrics computed on SYNTHETIC rule-generated data. "
                "Do not interpret as real-world model performance."
            ),
        },
    }

    joblib.dump(clf, MODEL_PATH)
    joblib.dump(meta, META_PATH)
    print(f"[Trainer] Model saved -> {MODEL_PATH}")
    print(f"[Trainer] Metadata saved -> {META_PATH}")


    return meta


def predict_eligibility(
    student: dict,
    scholarship: dict,
    clf: DecisionTreeClassifier,
    meta: dict,
) -> dict:
    """
    Predict whether a student is eligible for a specific scholarship.
    Returns {"eligible_prob": float, "eligible_pred": bool}.
    The ML prediction is advisory only — the deterministic eligibility
    engine in the backend remains the authoritative source of truth.
    """
    edu_map  = {e: i for i, e in enumerate(meta["education_levels"])}
    cat_map  = {c: i for i, c in enumerate(meta["categories"])}
    gen_map  = {g: i for i, g in enumerate(meta["genders"])}
    purp_map = {p: i for i, p in enumerate(meta["purposes"])}

    def _norm(v): return str(v).lower().strip()

    edu_enc  = edu_map.get(_norm(student.get("educationLevel", "")), -1)
    cat_enc  = cat_map.get(_norm(student.get("category", "general")), 0)
    gen_enc  = gen_map.get(_norm(student.get("gender", "other")), 2)
    purp_enc = purp_map.get(_norm(student.get("fundingPurpose", "education")), 0)

    pct = float(student.get("percentage") or 0)
    age = int(student.get("age") or 20)
    inc = float(student.get("annualIncome") or 0)

    sch_gender_restricted = 0 if (scholarship.get("genderEligibility", "Any") == "Any") else 1
    sch_edu_any = 1 if ("Any" in (scholarship.get("educationLevels") or [])) else 0
    sch_cat_any = 1 if ("Any" in (scholarship.get("categoryEligibility") or [])) else 0

    row = np.array([[
        edu_enc, cat_enc, gen_enc, purp_enc,
        pct, age, inc,
        int(scholarship.get("sch_id", 0)),
        float(scholarship.get("minimumPercentage", 0)),
        float(scholarship.get("minAge", 0)),
        float(scholarship.get("maxAge", 100)),
        float(scholarship.get("incomeLimit", 0)),
        sch_gender_restricted,
        sch_edu_any,
        sch_cat_any,
    ]])

    prob  = clf.predict_proba(row)[0][1]   # P(eligible=1)
    pred  = bool(clf.predict(row)[0] == 1)

    return {"eligible_prob": round(float(prob), 4), "eligible_pred": pred}


if __name__ == "__main__":
    meta = train_model(n_students=1200, force_retrain=True)
    print(f"[Trainer] F1 Score: {meta['metrics']['f1']}")
