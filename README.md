# CareBridge AI

CareBridge AI is a care-transition workspace for elderly discharge patients. The backend ingests discharge documents, extracts structured case data, runs validation checks, and supports nurse review plus care-plan generation. The repository also includes a facility-facing React app and a patient-facing React app.

## Stack

- Backend: FastAPI, SQLAlchemy, Alembic, PostgreSQL, Python 3.11+
- Facility frontend: Vite, React, React Router
- Patient frontend: React, Create React App, Gemini API
- Local infra: Docker and Docker Compose

## Compliance

CareBridge AI handles protected health information (PHI) and is built with the following frameworks in mind:

- **HIPAA** — PHI is stored with JWT-based access controls. Data in transit must be served over HTTPS/TLS in production. A Business Associate Agreement (BAA) is required with your hosting provider.
- **HITECH** — Electronic discharge records processed by this system fall under HITECH scope. All case state transitions are tracked via the case management API for audit purposes.
- **GDPR** — If handling EU patient data, deploy within an EU data region and establish a Data Processing Agreement (DPA) with your provider. No third-party trackers are embedded in the frontends.
- **SOC 2** — Designed to run on SOC 2-compliant infrastructure. Formal certification is the operator's responsibility.

> Compliance certification for a production deployment is the responsibility of the organisation operating the system.

## Prerequisites

Install these before you start:

- Python 3.11+
- Node.js 20+ and npm
- Docker Desktop
- Git

## Environment files

This repo uses example env files so secrets stay out of git.

- Root backend config: copy [.env.example](.env.example) to [.env](.env)
- Facility frontend config: copy [frontend/carebridge-facility/.env.example](frontend/carebridge-facility/.env.example) to [frontend/carebridge-facility/.env](frontend/carebridge-facility/.env)
- Patient frontend config: copy [frontend/carebridge-patient/.env.example](frontend/carebridge-patient/.env.example) to [frontend/carebridge-patient/.env](frontend/carebridge-patient/.env)

The `.env` files are ignored by git, so each developer needs local copies.

## Quick Start

The fastest way to run the whole stack is Docker Compose:

```bash
cp .env.example .env
docker compose up --build
```

That starts:

- PostgreSQL at `localhost:5432`
- pgAdmin at `http://localhost:5050`
- Backend API at `http://localhost:8000`
- Facility frontend at `http://localhost:3000`

The API docs are available at `http://localhost:8000/docs`.

## Local Backend Setup

If you want to run the backend without Docker:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
docker compose up -d db pgadmin
alembic upgrade head
uvicorn app.main:app --reload
```

Notes:

- Use `postgresql+psycopg2://...` in `DATABASE_URL` when running locally with the dependencies in this repo.
- `app/core/config.py` reads the root `.env` file.
- `gemini_api_key` is required for the extraction service to run without errors.

## Local Facility Frontend

The facility app reads its API URL from `VITE_API_URL` and defaults to `http://localhost:8000`.

```bash
cd frontend/carebridge-facility
npm install
cp .env.example .env
npm run dev
```

Vite serves the app at `http://localhost:5173` by default, and the backend CORS config already allows that origin.

## Local Patient Frontend

The patient portal uses a Google Gemini key at build/runtime depending on how you run it.

```bash
cd frontend/carebridge-patient
npm install
cp .env.example .env
npm start
```

If you build the patient app with Docker, pass `REACT_APP_GEMINI_API_KEY` as a build argument.

## Backend API

Useful endpoints while testing locally:

- `GET /health`
- `POST /auth/register`
- `POST /auth/login`
- `POST /cases`
- `POST /cases/{case_id}/documents`
- `POST /cases/{case_id}/extract`
- `GET /cases/{case_id}/review`
- `PATCH /cases/{case_id}/review`
- `POST /cases/{case_id}/approve`
- `POST /cases/{case_id}/care-plan/generate`
- `GET /cases/{case_id}/care-plan`

### Chat (facility assistant)

- `POST /chat/facility`
- `DELETE /chat/facility/{session_id}`

## Project Structure

```text
carebridge-ai/
├── app/
│   ├── core/                    # Settings and security helpers
│   ├── db/                      # SQLAlchemy engine, session, models
│   ├── routes/                  # FastAPI routers
│   ├── schemas/                 # Pydantic request/response models
│   └── services/                # Business logic and AI helpers
├── alembic/                     # Database migrations
├── frontend/
│   ├── carebridge-facility/     # Vite facility dashboard
│   └── carebridge-patient/      # Patient portal
├── compose.yaml                 # Full local stack
├── backend.Dockerfile           # Backend container image
└── requirements.txt             # Python dependencies
```

## pgAdmin

If you use the Docker stack, open `http://localhost:5050` and sign in with the values from your root `.env` file. Add a server using:

- Host: `db`
- Port: `5432`
- Username: `carebridge_user`
- Password: `carebridge_pass`
- Database: `carebridge_db`
