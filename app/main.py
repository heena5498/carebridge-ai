from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import auth, cases, documents, extraction, review, care_plan, patient_auth, patient_cases

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

#heeelo
@app.get("/health")
def health_check():
    return {"status": "ok"}