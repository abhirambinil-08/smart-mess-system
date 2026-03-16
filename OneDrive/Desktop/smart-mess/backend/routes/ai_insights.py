# ============================================================
#  routes/ai_insights.py  — Hygiene AI analysis per mess
# ============================================================

from fastapi import APIRouter, Depends
from datetime import datetime
from core.database import get_db
from core.security import get_current_admin
from services.ai_insights import analyse_hygiene

router = APIRouter()


@router.get("", dependencies=[Depends(get_current_admin)])
async def get_insights():
    db = get_db()

    # Aggregate average hygiene score per mess
    pipeline = [
        {"$match": {"validated": True, "confidence_score": {"$gte": 0.3}}},
        {"$group": {
            "_id":         "$mess",
            "avg_hygiene": {"$avg": "$hygiene"},
            "total":       {"$sum": 1},
        }},
        {"$match": {"total": {"$gte": 3}}},  # Need at least 3 submissions to generate insight
        {"$sort": {"avg_hygiene": 1}},        # Worst first
    ]

    insights = []
    async for row in db.feedback.aggregate(pipeline):
        insight = analyse_hygiene(row["_id"], round(row["avg_hygiene"], 2))
        insight["total_feedback"] = row["total"]
        insights.append(insight)

    return {
        "insights": insights,
        "generated_at": datetime.utcnow().isoformat(),
        "note": "Insights require minimum 3 feedback submissions per mess.",
    }
