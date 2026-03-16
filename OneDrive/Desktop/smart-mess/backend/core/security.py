# ============================================================
#  core/security.py  — JWT token creation and verification
# ============================================================

import os
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY  = os.getenv("JWT_SECRET", "changeme")
ALGORITHM   = os.getenv("JWT_ALGORITHM", "HS256")
EXPIRE_HRS  = int(os.getenv("JWT_EXPIRE_HOURS", 24))

# bcrypt password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Bearer token scheme (reads "Authorization: Bearer <token>" header)
bearer_scheme = HTTPBearer()


def hash_password(plain: str) -> str:
    """Hash a plain password using bcrypt."""
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    """Check if plain password matches the stored hash."""
    return pwd_context.verify(plain, hashed)


def create_token(data: dict) -> str:
    """Create a JWT token that expires after EXPIRE_HRS hours."""
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(hours=EXPIRE_HRS)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    """Decode a JWT token and return the payload dict."""
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )


def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)):
    """FastAPI dependency — use this to protect any admin route."""
    return decode_token(credentials.credentials)
