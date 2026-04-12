from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.auth import LoginRequest, TokenResponse
from app.services.auth_service import login_user

router = APIRouter(prefix="/patient/auth", tags=["patient_auth"])


@router.post("/login", response_model=TokenResponse)
def patient_login(body: LoginRequest, db: Session = Depends(get_db)):
    data = login_user(db, email=body.email, password=body.password)
    if data["user"].role != "patient":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Patient account required",
        )
    return data