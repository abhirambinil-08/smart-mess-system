# ============================================================
#  models/schemas.py  — All request/response data shapes
# ============================================================

from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime


# ── Feedback ─────────────────────────────────────────────────

class FeedbackCreate(BaseModel):
    """Data the student sends when submitting feedback."""
    institution: str
    mess: str
    meal_type: str                          # Breakfast / Lunch / Dinner
    food_quality: int = Field(ge=1, le=5)  # 1-5 rating
    taste: int        = Field(ge=1, le=5)
    hygiene: int      = Field(ge=1, le=5)
    portion_size: int = Field(ge=1, le=5)
    comment: Optional[str] = Field(default="", max_length=200)
    device_fingerprint: str                 # Browser fingerprint (set by frontend)
    interaction_time: float                 # Seconds spent on form


class FeedbackResponse(BaseModel):
    """What we send back after saving feedback."""
    success: bool
    message: str
    confidence_score: Optional[float] = None


# ── Auth ─────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    admin_email: str
    role: str


# ── Mess Config ──────────────────────────────────────────────

class MessCreate(BaseModel):
    name: str
    institution: str


class MessResponse(BaseModel):
    id: str
    name: str
    institution: str
    created_at: datetime


# ── Dashboard ────────────────────────────────────────────────

class MessStats(BaseModel):
    mess: str
    total_feedback: int
    avg_food_quality: float
    avg_taste: float
    avg_hygiene: float
    avg_portion_size: float
    overall_avg: float


class DashboardResponse(BaseModel):
    total_feedback: int
    total_mess: int
    mess_stats: list[MessStats]


# ── AI Insights ──────────────────────────────────────────────

class InsightItem(BaseModel):
    mess: str
    hygiene_score: float
    status: str          # "Good", "Warning", "Critical"
    recommendation: str


class InsightsResponse(BaseModel):
    insights: list[InsightItem]
    generated_at: datetime
