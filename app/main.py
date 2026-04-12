import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import auth, cases, chat, documents, extraction, review, care_plan

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="CareBridge API", version="0.1.0")

frontend_url = os.getenv("FRONTEND_URL")

allowed_origins = [
    "http://localhost:3000",
    "http://localhost:5173",
]

if frontend_url:
    allowed_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
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
app.include_router(chat.router)

#heeelo
@app.get("/health")
def health_check():
    return {"status": "ok"}
