# CareBridge AI

CareBridge AI is a care-transition workspace for elderly discharge patients. The backend ingests discharge PDFs, extracts structured case data using Gemini, runs multi-agent validation, and supports nurse review and care-plan generation. The repository contains two React frontends — one for facility staff and one for patients.

## Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI, SQLAlchemy, Alembic, PostgreSQL, Python 3.11+ |
| AI / Extraction | Google Gemini (`google-genai`), Google ADK (`google-adk`) |
| Auth | JWT via `python-jose`, password hashing via `passlib[bcrypt]` |
| Facility frontend | Vite + React 19, React Router v7, Axios |
| Patient frontend | Create React App, React 19, React Router v7, Tailwind CSS |
| Local infra | Docker Compose, nginx, pgAdmin |

## Repository Layout

```
carebridge-ai/
├── app/
│   ├── core/            # Config, security, JWT, dependency injection
│   ├── db/              # SQLAlchemy engine, session, ORM models
│   ├── routes/          # FastAPI routers (auth, cases, documents, extraction, review, care_plan, patient_*)
│   ├── schemas/         # Pydantic request/response models
│   └── services/        # Business logic: Gemini extraction, ADK agents, care plan generation
├── alembic/             # Database migrations
├── frontend/
│   ├── carebridge-facility/   # Facility staff dashboard (Vite)
│   └── carebridge-patient/    # Patient portal (CRA + Tailwind)
├── uploads/             # Uploaded PDFs (gitignored)
├── compose.yaml         # Full local stack
├── backend.Dockerfile   # Backend container image
└── requirements.txt     # Python dependencies
```

## Prerequisites

- Python 3.11+
- Node.js 20+ and npm
- Docker Desktop (for the full stack or just the DB)
- Git

---

## Option A — Full Stack with Docker Compose

The fastest way to run everything:

```bash
# 1. Copy and fill in the root env file
cp .env.example .env

# 2. Build and start all services
docker compose up --build
```

This starts:

| Service | URL |
|---|---|
| PostgreSQL | `localhost:5432` |
| pgAdmin | `http://localhost:5050` |
| Backend API | `http://localhost:8000` |
| Facility frontend | `http://localhost:3000` |
| Patient frontend | `http://localhost:3001` |

> **First run only:** the database starts empty. Run migrations inside the backend container:
> ```bash
> docker compose exec backend alembic upgrade head
> ```

API docs (Swagger UI): `http://localhost:8000/docs`

---

## Option B — Local Development (no Docker for the app)

### 1. Start only the database

```bash
cp .env.example .env
docker compose up -d db pgadmin
```

### 2. Backend

```bash
# Create and activate virtual environment
python -m venv .venv

# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start the API server
uvicorn app.main:app --reload --port 8000
```

The backend reads from the root `.env` file. `DATABASE_URL` must use the `postgresql+psycopg2://` prefix.

### 3. Facility Frontend (Vite)

```bash
cd frontend/carebridge-facility
npm install
cp .env.example .env        # defaults to http://localhost:8000
npm run dev
```

Served at `http://localhost:5173`. The backend CORS config already allows this origin.

### 4. Patient Frontend (Create React App)

```bash
cd frontend/carebridge-patient
npm install
cp .env.example .env        # set REACT_APP_API_URL and REACT_APP_GEMINI_API_KEY
npm start
```

Served at `http://localhost:3000`.

---

## Environment Variables

### Root `.env` (backend + Docker Compose)

| Variable | Description |
|---|---|
| `POSTGRES_USER` | PostgreSQL username |
| `POSTGRES_PASSWORD` | PostgreSQL password |
| `POSTGRES_DB` | PostgreSQL database name |
| `POSTGRES_PORT` | Host port for PostgreSQL (default `5432`) |
| `PGADMIN_DEFAULT_EMAIL` | pgAdmin login email |
| `PGADMIN_DEFAULT_PASSWORD` | pgAdmin login password |
| `DATABASE_URL` | SQLAlchemy connection string (`postgresql+psycopg2://...`) |
| `SECRET_KEY` | Long random string used to sign JWTs — **change before deploying** |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT lifetime in minutes (default `60`) |
| `GEMINI_API_KEY` | Google Gemini API key for PDF extraction |
| `REACT_APP_GEMINI_API_KEY` | Same key passed to the patient frontend Docker build |
| `GOOGLE_GENAI_USE_VERTEXAI` | Set to `TRUE` to use Vertex AI instead of the public API |

### `frontend/carebridge-facility/.env`

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8000` | Backend base URL |
| `VITE_PATIENT_PORTAL_URL` | `http://localhost:3000` | Patient portal URL (used for redirect links) |

### `frontend/carebridge-patient/.env`

| Variable | Default | Description |
|---|---|---|
| `REACT_APP_API_URL` | `http://localhost:8000` | Backend base URL |
| `REACT_APP_GEMINI_API_KEY` | — | Google Gemini API key (used by the patient chat feature) |

---

## API Overview

Authenticate via `POST /auth/login` to receive a Bearer token. Pass it in the `Authorization: Bearer <token>` header. In Swagger UI, click **Authorize** and paste the token directly.

### Facility endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/auth/register` | Register a new facility or patient user |
| `POST` | `/auth/login` | Login — returns JWT |
| `POST` | `/cases` | Create a new intake case |
| `GET` | `/cases` | List all cases (summary view) |
| `GET` | `/cases/{case_id}` | Get a single case |
| `PATCH` | `/cases/{case_id}` | Update case fields |
| `POST` | `/cases/{case_id}/documents` | Upload a discharge PDF |
| `POST` | `/cases/{case_id}/extract` | Run Gemini extraction pipeline |
| `POST` | `/cases/{case_id}/review` | Initialise nurse review |
| `GET` | `/cases/{case_id}/review` | Fetch current review payload |
| `PATCH` | `/cases/{case_id}/review` | Edit extracted data (meds, allergies, follow-ups) |
| `POST` | `/cases/{case_id}/approve` | Approve the review |
| `POST` | `/cases/{case_id}/care-plan/generate` | Generate care plan |
| `GET` | `/cases/{case_id}/care-plan` | Fetch generated care plan |

### Patient endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/patient/auth/login` | Patient login — returns JWT |
| `GET` | `/patient/cases/me` | Get all cases linked to the logged-in patient |
| `GET` | `/patient/cases/{case_id}/care-plan` | Get care plan for a specific case |

### Case status flow

```
intake → extracted → in_review → approved → care_plan_generated
```

Each step must be completed in order. Re-extraction is allowed from `intake` or `extracted`.

---

## pgAdmin

Open `http://localhost:5050`, sign in with `PGADMIN_DEFAULT_EMAIL` / `PGADMIN_DEFAULT_PASSWORD` from your `.env`, then add a server:

- **Host:** `db`
- **Port:** `5432`
- **Username:** value of `POSTGRES_USER`
- **Password:** value of `POSTGRES_PASSWORD`
- **Database:** value of `POSTGRES_DB`
