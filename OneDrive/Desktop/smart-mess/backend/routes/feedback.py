# ============================================================
#  routes/feedback.py  — Student feedback submission
# ============================================================

from fastapi import APIRouter, HTTPException, status
from datetime import datetime

from core.database import get_db
from models.schemas import FeedbackCreate, FeedbackResponse
from services.validator import calculate_confidence, is_duplicate

router = APIRouter()


@router.post("", response_model=FeedbackResponse)
async def submit_feedback(data: FeedbackCreate):
    db = get_db()

    # ── 1. Duplicate check ───────────────────────────────────
    if await is_duplicate(data.device_fingerprint, data.meal_type):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already submitted feedback for this meal today.",
        )

    # ── 2. Confidence score ──────────────────────────────────
    ratings = [data.food_quality, data.taste, data.hygiene, data.portion_size]
    confidence = calculate_confidence(data.interaction_time, ratings)

    # ── 3. Spam filter ───────────────────────────────────────
    if confidence < 0.3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Submission flagged as spam. Please fill the form carefully.",
        )

    # ── 4. Save to MongoDB ───────────────────────────────────
    doc = {
        **data.model_dump(),
        "confidence_score": confidence,
        "validated": True,
        "timestamp": datetime.utcnow(),
    }
    await db.feedback.insert_one(doc)

    return FeedbackResponse(
        success=True,
        message="Thank you! Your feedback has been submitted.",
        confidence_score=confidence,
    )
