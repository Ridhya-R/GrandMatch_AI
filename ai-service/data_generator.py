"""
GrantMatch AI — Synthetic Training Data Generator
===================================================
PURPOSE: Generates synthetic student–scholarship pairs labeled by
         deterministic eligibility rules for PROTOTYPING only.

WARNING: Data is synthetic and rule-derived, NOT from real applicant records.
         Do NOT use synthetic test metrics as evidence of real-world performance.
         Replace with real anonymised data before any production deployment.
"""

import random
import pandas as pd
import numpy as np
from pathlib import Path

random.seed(42)
np.random.seed(42)

# ---------------------------------------------------------------------------
# Scholarship Definitions (mirrors the Opportunity schema in the backend)
# ---------------------------------------------------------------------------
SCHOLARSHIPS = [
    {
        "id": 0,
        "name": "National Higher Education Merit Scholarship",
        "min_percentage": 70,
        "min_age": 18, "max_age": 26,
        "income_limit": 500000,
        "education_levels": ["undergraduate", "postgraduate"],
        "categories": ["general", "obc", "sc", "st", "ews"],
        "gender": "any",
        "funding_purpose": ["education"],
    },
    {
        "id": 1,
        "name": "Pragati Women in STEM Fellowship",
        "min_percentage": 65,
        "min_age": 18, "max_age": 32,
        "income_limit": 800000,
        "education_levels": ["undergraduate", "postgraduate", "phd"],
        "categories": ["any"],
        "gender": "female",
        "funding_purpose": ["education", "fellowship", "research"],
    },
    {
        "id": 2,
        "name": "Ramanujan Doctoral Research Fellowship",
        "min_percentage": 75,
        "min_age": 21, "max_age": 35,
        "income_limit": 0,
        "education_levels": ["postgraduate", "phd"],
        "categories": ["any"],
        "gender": "any",
        "funding_purpose": ["research", "fellowship"],
    },
    {
        "id": 3,
        "name": "Campus Startup Seed Grant",
        "min_percentage": 0,
        "min_age": 18, "max_age": 40,
        "income_limit": 0,
        "education_levels": ["any"],
        "categories": ["any"],
        "gender": "any",
        "funding_purpose": ["startup", "business"],
    },
    {
        "id": 4,
        "name": "Post-Matric Educational Assistance Scheme",
        "min_percentage": 50,
        "min_age": 16, "max_age": 30,
        "income_limit": 250000,
        "education_levels": ["higher secondary", "diploma", "undergraduate", "postgraduate"],
        "categories": ["sc", "st", "obc", "ews", "minority"],
        "gender": "any",
        "funding_purpose": ["education"],
    },
    {
        "id": 5,
        "name": "State Youth Innovation Grant (Kerala)",
        "min_percentage": 60,
        "min_age": 19, "max_age": 28,
        "income_limit": 600000,
        "education_levels": ["undergraduate", "postgraduate"],
        "categories": ["any"],
        "gender": "any",
        "funding_purpose": ["education", "research", "startup"],
    },
    {
        "id": 6,
        "name": "AICTE PG Scholarship (GATE/GPAT)",
        "min_percentage": 60,
        "min_age": 20, "max_age": 35,
        "income_limit": 0,
        "education_levels": ["postgraduate"],
        "categories": ["any"],
        "gender": "any",
        "funding_purpose": ["education"],
    },
]

EDUCATION_LEVELS = ["higher secondary", "diploma", "undergraduate", "postgraduate", "phd"]
CATEGORIES       = ["general", "obc", "sc", "st", "ews", "minority"]
GENDERS          = ["male", "female", "other"]
PURPOSES         = ["education", "research", "startup", "business", "fellowship", "other"]


def _normalize(val: str) -> str:
    return str(val).lower().strip()


def _check_eligibility(student: dict, scholarship: dict) -> int:
    """Deterministic label: 1 = eligible, 0 = not eligible."""
    edu  = _normalize(student["education_level"])
    cat  = _normalize(student["category"])
    gen  = _normalize(student["gender"])
    purp = _normalize(student["funding_purpose"])
    pct  = float(student["percentage"])
    age  = int(student["age"])
    inc  = float(student["annual_income"])

    sch_edu   = [_normalize(e) for e in scholarship["education_levels"]]
    sch_cats  = [_normalize(c) for c in scholarship["categories"]]
    sch_purps = [_normalize(p) for p in scholarship["funding_purpose"]]

    if "any" not in sch_edu and edu not in sch_edu:
        return 0
    if "any" not in sch_cats and cat not in sch_cats:
        return 0
    if scholarship["gender"] != "any" and gen != _normalize(scholarship["gender"]):
        return 0
    if scholarship["min_percentage"] > 0 and pct < scholarship["min_percentage"]:
        return 0
    if age < scholarship["min_age"] or age > scholarship["max_age"]:
        return 0
    if scholarship["income_limit"] > 0 and inc > scholarship["income_limit"]:
        return 0
    if "any" not in sch_purps and purp not in sch_purps:
        return 0
    return 1


def generate_dataset(n_students: int = 1200) -> pd.DataFrame:
    rows = []
    for _ in range(n_students):
        edu  = random.choice(EDUCATION_LEVELS)
        cat  = random.choice(CATEGORIES)
        gen  = random.choice(GENDERS)
        purp = random.choice(PURPOSES)
        pct  = round(random.uniform(40, 100), 1)
        age  = random.randint(16, 45)
        inc  = random.randint(50000, 2000000)
        student = {"education_level": edu, "category": cat, "gender": gen,
                   "funding_purpose": purp, "percentage": pct, "age": age, "annual_income": inc}
        for sch in SCHOLARSHIPS:
            label = _check_eligibility(student, sch)
            rows.append({
                "education_level": edu, "category": cat, "gender": gen,
                "funding_purpose": purp, "percentage": pct, "age": age, "annual_income": inc,
                "sch_id": sch["id"],
                "sch_min_pct": sch["min_percentage"],
                "sch_min_age": sch["min_age"],
                "sch_max_age": sch["max_age"],
                "sch_income_limit": sch["income_limit"],
                "sch_gender_restricted": 0 if sch["gender"] == "any" else 1,
                "sch_edu_any": 1 if "any" in [_normalize(e) for e in sch["education_levels"]] else 0,
                "sch_cat_any": 1 if "any" in [_normalize(c) for c in sch["categories"]] else 0,
                "eligible": label,
            })
    return pd.DataFrame(rows)


def encode_features(df: pd.DataFrame) -> pd.DataFrame:
    edu_order  = {e: i for i, e in enumerate(EDUCATION_LEVELS)}
    cat_order  = {c: i for i, c in enumerate(CATEGORIES)}
    gen_order  = {g: i for i, g in enumerate(GENDERS)}
    purp_order = {p: i for i, p in enumerate(PURPOSES)}
    df = df.copy()
    df["education_level_enc"] = df["education_level"].map(edu_order).fillna(-1).astype(int)
    df["category_enc"]        = df["category"].map(cat_order).fillna(-1).astype(int)
    df["gender_enc"]          = df["gender"].map(gen_order).fillna(-1).astype(int)
    df["funding_purpose_enc"] = df["funding_purpose"].map(purp_order).fillna(-1).astype(int)
    return df


def save_datasets(df: pd.DataFrame, out_dir: str = "data") -> None:
    path = Path(out_dir)
    path.mkdir(parents=True, exist_ok=True)
    df_enc = encode_features(df)
    df.to_csv(path / "training_raw.csv", index=False)
    df_enc.to_csv(path / "training_encoded.csv", index=False)
    try:
        with pd.ExcelWriter(path / "training_data.xlsx", engine="openpyxl") as writer:
            df.to_excel(writer, sheet_name="Raw", index=False)
            df_enc.to_excel(writer, sheet_name="Encoded", index=False)
        print(f"[DataGen] Excel export saved → {path / 'training_data.xlsx'}")
    except Exception as exc:
        print(f"[DataGen] Excel export skipped ({exc}) — CSV files are available.")
    print(f"[DataGen] Saved {len(df)} rows to {out_dir}/")
    print(f"[DataGen] Eligibility distribution:\n{df['eligible'].value_counts().to_string()}")


if __name__ == "__main__":
    df = generate_dataset(n_students=1200)
    save_datasets(df, out_dir="data")
    print("[DataGen] Done.")
