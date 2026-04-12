import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import auth, cases, documents, extraction, review, care_plan, patient_auth, patient_cases
from app.core.config import settings

log = logging.getLogger(__name__)

app = FastAPI(title="CareBridge API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(cases.router)
app.include_router(documents.router)
app.include_router(extraction.router)
app.include_router(review.router)
app.include_router(care_plan.router)
app.include_router(patient_auth.router)
app.include_router(patient_cases.router)


@app.on_event("startup")
def validate_config() -> None:
    """Warn loudly at startup if critical config values are missing or insecure."""
    if not settings.database_url:
        raise RuntimeError("DATABASE_URL is not configured. Set it in .env.")
    if not settings.gemini_api_key:
        log.warning("GEMINI_API_KEY is not set — extraction endpoints will fail.")
    if settings.secret_key == "change_me_to_a_long_random_string":
        log.warning(
            "SECRET_KEY is using the insecure default value. "
            "Set a strong random key in .env before deploying."
        )


@app.get("/health")
def health_check():
    return {"status": "ok"}
