# ============================================================
#  routes/auth.py  — Admin login + first-time setup
# ============================================================

from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime

from core.database import get_db
from core.security import hash_password, verify_password, create_token, get_current_admin
from models.schemas import LoginRequest, LoginResponse

router = APIRouter()


@router.post("/login", response_model=LoginResponse)
async def login(data: LoginRequest):
    db = get_db()

    # Find admin by email
    admin = await db.admin_users.find_one({"email": data.email})
    if not admin:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Email not found")

    # Check password
    if not verify_password(data.password, admin["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Wrong password")

    # Check account is active
    if not admin.get("is_active", True):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled")

    # Generate JWT token
    token = create_token({"email": admin["email"], "role": admin["role"]})

    return LoginResponse(
        access_token=token,
        admin_email=admin["email"],
        role=admin["role"],
    )


@router.post("/setup")
async def create_first_admin(data: LoginRequest):
    """
    One-time route to create the first admin account.
    After first use, delete or disable this endpoint.
    """
    db = get_db()

    existing = await db.admin_users.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Admin with this email already exists")

    await db.admin_users.insert_one({
        "email": data.email,
        "password_hash": hash_password(data.password),
        "role": "admin",
        "is_active": True,
        "created_at": datetime.utcnow(),
    })

    return {"message": f"Admin account created for {data.email}"}


@router.get("/me")
async def get_me(admin=Depends(get_current_admin)):
    """Returns current admin info from token. Used to verify token on frontend."""
    return {"email": admin["email"], "role": admin["role"]}
