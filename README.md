# GrantMatch – Scholarship & Funding Recommendation Platform

An intelligent, full-stack scholarship, fellowship, research grant, and government funding recommendation platform built for an MCA college project.

> [!IMPORTANT]
> **Deterministic Rule-Based Matching**: This platform strictly uses backend logic and database criteria comparison (100-point algorithm) to compute eligibility match scores. It does **NOT** use external AI/LLM APIs, chatbots, or black-box machine learning.

---

## Quick Start / Auto-Run

### Option 1: One-Click Windows Launcher
Simply double-click:
```text
run.bat
```
This automatically boots both backend and frontend servers, sets up the database, and opens the application in your browser at `http://localhost:5173`.

### Option 2: Manual Terminal Commands
1. **Start Backend**:
   ```bash
   cd backend
   node server.js
   ```
   *Runs on `http://localhost:5000`. Automatically connects to local MongoDB or initializes the built-in embedded MongoDB fallback with zero configuration required.*

2. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```
   *Runs on `http://localhost:5173`.*

---

## Pre-Configured Test Accounts

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@grantmatch.org` | `Admin@123` | Full admin dashboard, add/edit opportunities, manage users |
| **Student** | `user@grantmatch.org` | `User@123` | Athira Nair (MCA Student, Kerala, 82.5% marks) |

*Note: You can also use the **Demo Admin** and **Demo Student** quick-login buttons on the Sign In dialog.*

---

## 100-Point Rule-Based Matching Engine Formula

Every opportunity is scored on a transparent 100-point scale:

- **Education Level** (20 pts): Matches target degree or open to all.
- **Field / Stream** (20 pts): Matches discipline or broad domain.
- **Academic Score** (15 pts): Evaluates user marks against minimum required percentage.
- **Funding Purpose** (10 pts): Matches user's financial purpose (Education, Research, Startup).
- **Location** (10 pts): Checks state or national eligibility.
- **Income Ceiling** (10 pts): Checks family income against upper limit.
- **Age Requirement** (5 pts): Verifies minimum and maximum age bounds.
- **Citizenship / Nationality** (5 pts): Verifies citizenship requirement.
- **Applicant Category** (5 pts): Validates social category (General, OBC, SC, ST, EWS).

Results display a clear **Eligibility Match %** alongside:
- `✓` Verified criteria checkmarks
- `✗` Criteria gap warnings

---

## Technology Stack

- **Frontend**: React 18, Vite, Lucide Icons, Custom CSS Design System
- **Backend**: Node.js, Express.js REST API, JWT Authentication, bcryptjs
- **Database**: MongoDB (Mongoose ODM) with automatic embedded in-memory fallback
