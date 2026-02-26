## CogniHealth – AI Cognitive Health Platform

An end‑to‑end web application for screening, tracking, and understanding cognitive health over time for patients, doctors, and admins.

---

### 🧩 Problem Statement

Early cognitive decline (memory issues, slower reaction time, reduced attention) is often subtle and missed in routine check‑ups. Traditional assessments are:
- Infrequent and performed only in clinics.
- Hard to track longitudinally.
- Difficult for non‑specialists to interpret.

There is a need for a **simple, self‑service, AI‑assisted platform** that helps patients monitor their brain health frequently and lets clinicians see structured trends and risk levels.

---

### 💡 Solution Overview

CogniHealth provides:
- A **multi‑modal cognitive test** (memory, reaction, attention, typing, voice).
- An **AI risk engine** that converts raw scores into cognitive index, brain age, and risk level.
- Rich **dashboards** for patients, doctors, and admins with trend charts and alerts.
- A **Brain Gym** area with light‑weight training games to keep users engaged between full tests.
- Exportable **reports** in PDF/DOC/image formats to share with clinicians or caregivers.

---

### ⭐ Key Features

- **Patient Dashboard**
  - Top summary cards: Cognitive Index, Brain Age vs Actual Age, Risk Level, Stability Score.
  - Weekly / Monthly cognitive trend line chart with baseline & risk thresholds.
  - Latest results breakdown (Memory, Reaction, Attention, Voice).
  - Voice & Typing insights (speech rate, fluency index, typing speed, backspace / hesitation index).
  - AI forecast: 3‑month projected score, confidence, projected brain age.
  - Smart alerts (“no test in 7 days”, sudden drops, slower reaction time, high risk).
  - Brain Gym strip: Daily Memory Drill, Reaction mini‑games, Focus Pattern game, streak counter.

- **Full Cognitive Test Flow**
  - Memory word recall with countdown.
  - Reaction time task (5 trials, average ms).
  - Stroop‑style attention test.
  - Typing behavior analysis (WPM, stability).
  - Voice recording (up to 60s) for basic voice metrics.

- **Test Results Screen**
  - Risk summary (cognitive score, brain age, stability index, risk badge).
  - Brain Age Analysis: actual age from registration, predicted brain age, brain‑age gap.
  - Cognitive Stability Index (CSI).
  - Radar and bar charts for individual domains.
  - AI insight paragraph + 3‑month forecast chart and summary tiles.
  - Risk‑based recommendations (what to do, when to retake, when to see a doctor).
  - Quick actions: Export report, Brain Training, Retake Test, Dashboard.

- **Brain Gym**
  - Daily Memory Drill: 10 rounds of word/pattern recall with average score.
  - Reaction Mini Games: 10 different “tap when condition is met” tasks, average reaction ms.
  - Focus Pattern Game: 10 quick pattern‑consistency rounds to train attention.

- **Reports & Exports**
  - Report history for all completed tests.
  - Download structured report as:
    - **“PDF” style text file** (for quick sharing/printing).
    - **DOC** (rich HTML/Word‑compatible).
    - **PNG image** summary (shareable snapshot).

- **Roles**
  - **Patient**: take tests, view dashboards, download/share reports, brain training.
  - **Doctor/Admin**: (backend supports role separation; UI can be extended for clinical views).

---

### 🛠 Tech Stack

- **Frontend**
  - React + TypeScript
  - Vite
  - TailwindCSS for styling
  - Recharts for charts & graphs
  - `lucide-react` for icons

- **Backend API**
  - Node.js + Express
  - PostgreSQL via Sequelize ORM
  - JWT authentication

- **AI Service**
  - Python + Flask
  - Simple rule‑based model that combines memory, reaction, attention, typing, and voice scores to:
    - Compute Cognitive Index
    - Estimate Brain Age
    - Estimate Risk Probability + Risk Level (Low / Moderate / High)

---

### 🏗 Architecture (High Level)

1. **Frontend (Vite React app)**
   - Communicates with backend via `http://localhost:3000/api`.
   - Manages routes for `/login`, `/register`, `/dashboard/patient`, `/test`, `/test/results`, `/reports`, `/brain-gym`, etc.
   - Stores auth token + user profile (including age) in `localStorage`.

2. **Backend (Express API)**
   - `/api/auth/*` – registration & login.
   - `/api/tests/*` – submit test, get test history.
   - `/api/users/*` – patient/admin utilities.
   - Persists `TestResult` and `RiskScore` entities in PostgreSQL.
   - On `/tests/submit`:
     - Saves raw scores.
     - Calls AI service `/predict` with aggregated scores.
     - Stores AI results (riskProbability, cognitiveIndex, brainAge, riskLevel + component snapshot).

3. **AI Microservice (Flask)**
   - `/predict` endpoint:
     - Accepts memoryScore, reactionTime, attentionScore, typingSpeed, voiceScore.
     - Returns Cognitive Index, Brain Age, Risk Probability, Risk Level.

---

### 🔁 Workflow Summary

1. **Register**
   - User registers with name, email, password, age, gender, role.
   - Password is hashed in the backend; JWT is used for login sessions.

2. **Login**
   - User logs in and is redirected to the correct dashboard (`/dashboard/patient` for patients).

3. **Take Cognitive Test**
   - Patient completes Memory → Reaction → Attention → Typing → Voice steps.
   - Frontend aggregates raw scores and posts to `/api/tests/submit`.

4. **AI Risk Assessment**
   - Backend forwards summary to Flask AI service.
   - AI returns Cognitive Index, Brain Age, Risk % + Risk Level.
   - Backend saves a `RiskScore` snapshot and returns a rich payload to the frontend.

5. **Results & Trends**
   - Test Results screen shows detailed insights for the latest test.
   - Patient Dashboard pulls `/tests/history` to build trends, top KPIs, alerts, and latest results.

6. **Reports & Brain Gym**
   - From Test Results or Reports screen, user can export reports as text/DOC/image.
   - Brain Gym offers quick training sessions between scheduled tests.

---

### ▶ How to Run the Project Locally

> Prerequisites: Node.js (LTS), npm, Python 3.x, PostgreSQL running with a database matching `.env`.

#### 1. Clone the repository

```bash
git clone https://github.com/23f1000356/Merge-Conflict.git
cd Merge-Conflict
```

If you are working from an existing local folder (`MergeConflictSurvivors`), make sure the remote is set to this GitHub repo:

```bash
git remote set-url origin https://github.com/23f1000356/Merge-Conflict.git
```

#### 2. Configure environment variables

In `backend/.env` (already present), configure:

- PostgreSQL connection:
  - `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- Server & JWT:
  - `PORT=3000`
  - `JWT_SECRET=your_super_secret_jwt_key_12345`
- AI Service URL:
  - `AI_SERVICE_URL=http://localhost:5001`

Make sure PostgreSQL is running and the `DB_NAME` exists (or let Sequelize create it if your user has permissions).

#### 3. Start the AI service (Flask)

```bash
cd ai-service
pip install -r requirements.txt  # or `pip install flask flask-cors`
python app.py
```

This starts Flask on `http://localhost:5001`.

#### 4. Start the backend API (Express)

Open a new terminal:

```bash
cd backend
npm install
npm run dev
```

This will:
- Connect to PostgreSQL.
- Auto‑sync the Sequelize models.
- Start the API on `http://localhost:3000`.

#### 5. Start the frontend (Vite React app)

Open another terminal at the project root:

```bash
npm install
npm run dev
```

Vite will start on `http://localhost:5173/`.

#### 6. Using the app

1. Visit `http://localhost:5173/`.
2. **Register** a new user (patient/doctor/admin).
3. **Login** and go to the **Patient Dashboard**.
4. Use **Take Test** to complete an assessment and view the **Test Results** screen.
5. Explore **Dashboard**, **Progress & Trends**, **Reports**, and **Brain Gym**.

---

### 📌 Notes

- This project is currently optimized for local/demo use. For production deployment, you would:
  - Use a production WSGI server for Flask.
  - Add HTTPS, environment‑specific configs, and hardened JWT secrets.
  - Add role‑based UI for doctors/admins around the existing role model in the backend.
