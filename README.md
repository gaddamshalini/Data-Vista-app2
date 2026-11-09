# DATA VISTA – Data Analytics and Intelligence Based Career, Internship & Placement Platform

**DATA VISTA** is an integrated full-stack intelligence platform engineered for college students and academic institutions. It bridges the gap between campus academics and the dynamic job market by providing profile-driven career pathways, algorithmic skill gap diagnostics, time-series skill demand trend analysis, transparent internship matching, and a built-in professional ATS-friendly Resume Builder.

---

## 🏛️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                   React 18 Single Page Application                     │
│    (Vite • Dark Navy Theme • Recharts • Lucide • ATS Resume Engine)    │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ REST APIs (JSON)
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Python Flask REST API Microservice                   │
│        (Flask 3.1 • Flask-CORS • SQLAlchemy • Pydantic • Port 5000)    │
└────────────┬───────────────────────┼───────────────────────────┬───────┘
             │                       │                           │
             ▼                       ▼                           ▼
┌─────────────────────────┐ ┌──────────────────┐ ┌──────────────────────┐
│  SQLAlchemy Relational  │ │ Dynamic Catalog  │ │ ATS Resume Generator │
│        Database         │ │ & Skill Demand   │ │ & Single-Column PDF  │
│ (SQLite / MySQL Schema) │ │ Trend Engine     │ │ Print Engine         │
└─────────────────────────┘ └──────────────────┘ └──────────────────────┘
```

---

## 🌟 Key Modules & Capabilities

1. **Student Profile Management**:
   - Single source of truth. Enter or search by Student ID (e.g. `CS2024001`) or Student Name.
   - 11 Standardized Branches/Departments + Custom "Other" Department entry:
     1. Computer Science and Engineering (CSE)
     2. CSE (Artificial Intelligence)
     3. CSE (Data Science)
     4. CSE (Cyber Security)
     5. CSE (Technology)
     6. Electrical and Electronics Engineering (EEE)
     7. Mechanical Engineering (Mech)
     8. Electronics and Communication Engineering (ECE)
     9. Civil Engineering (Civil)
     10. CSE (AI & ML)
     11. Other (custom course text input)
   - Experience Status: **Fresher** and **Experienced** (with years of experience).
   - Number of Internships (numeric).
   - Validated GitHub Profile URL linking directly to repositories.
   - Target Career Goal dropdown selector.
   - Any profile change instantly propagates across all platform modules without re-entering data.

2. **Executive Placement Dashboard**:
   - Personalized student welcome banner.
   - High-impact KPI cards: Academic CGPA, Number of Skills, Projects Built, Certifications, Number of Internships, Experience Status, Top Recommended Career, and Identified Skill Gaps.
   - One-click launch to the ATS Resume Builder and Career Recommendations.

3. **Professional ATS Resume Builder**:
   - Auto-populates all student profile details: Name, contact details, education, department, CGPA, verified skills, projects, certifications, internships, experience status, and GitHub link.
   - Live editable split-view allows students to tailor bullet points and add missing details before exporting.
   - Industry-standard single-column ATS-compliant formatting.
   - Native one-click PDF download / print engine (`@media print`).

4. **Placement Analytics**:
   - Interactive filtering by Department, Graduation Year, Company, and CGPA range.
   - Department-wise placement conversion bar charts.
   - Year-wise historical placement rate and average CTC trend lines.
   - Top recruiting company offer volumes and compensation tiers.
   - Empirical correlation charts: CGPA vs Placement %, Internships vs Placement %, and Certifications vs Placement %.

5. **Job Market Intelligence**:
   - Most demanded tech roles and most demanded technical skills.
   - Average market package by role and premium salary by skill.
   - Geographic hiring concentration across major tech clusters (Bangalore, Hyderabad, Pune, Remote, etc.).
   - Experience level breakdowns (Entry Level vs Junior/Mid vs Senior).

6. **Skill Demand Trend Analyzer**:
   - Time-series tracking across years and quarters (e.g. Python $\rightarrow$ Increasing, SQL $\rightarrow$ Increasing, Power BI $\rightarrow$ Increasing, Excel $\rightarrow$ Stable, Tableau $\rightarrow$ Decreasing).
   - Includes **C, Java, Full Stack Development (FSD), GitHub**, and custom added skills.
   - Search bar to instantly filter skills.
   - **Add Custom Skill** capability: validates non-duplicates, saves to database, and makes the new skill available across profiles and diagnostics.

7. **Multi-Factor Career Recommendation Engine**:
   - Algorithmic suitability calculation using skill overlap, academic CGPA, projects, certifications, and target career preference.
   - Displays top matching careers with clear explanations ("Strong match because you have Python, SQL, and Power BI skills").

8. **Skill Gap Diagnostics**:
   - Direct comparison between student profile skills vs required skills for any target role.
   - Identifies Matched Skills vs Missing Skills.
   - Calculates Skill Gap Percentage and ranks missing skills by industry market demand priority.

9. **Personalized Phased Career Roadmap**:
   - 3-phase structured career roadmap (Foundations, Advanced Domain Specialization, Capstone & Portfolio Readiness).
   - Step-by-step milestones with estimated completion timelines.

10. **Internship Analytics & Matching**:
    - Ecosystem breakdown: Stipend ranges, top roles, duration, work mode (Remote/Hybrid/On-site).
    - Profile-driven matching algorithm ranking openings by Quality Score.

---

## 🚀 Getting Started

### Prerequisites
- Python 3.9+ installed
- Node.js 18+ and npm installed

### Quick Start (Windows)
Double-click `run_all.bat` or run:
```bat
run_all.bat
```
This automatically starts:
1. Python Flask Backend on `http://127.0.0.1:5000`
2. Vite React Frontend on `http://localhost:5173`

---

## 🧪 Testing Backend API
To run automated unit tests:
```bat
cd backend
python -m unittest tests/test_api.py
```
All unit test suites verify student registration, duplicate prevention, custom skill persistence, and catalog options.
