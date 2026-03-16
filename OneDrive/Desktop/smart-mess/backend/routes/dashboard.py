# ============================================================
#  routes/dashboard.py  — Admin analytics summary
# ============================================================

from fastapi import APIRouter, Depends
from core.database import get_db
from core.security import get_current_admin

router = APIRouter()


@router.get("", dependencies=[Depends(get_current_admin)])
async def get_dashboard():
    db = get_db()

    # MongoDB aggregation — group feedback by mess, calculate averages
    pipeline = [
        {"$match": {"validated": True, "confidence_score": {"$gte": 0.3}}},
        {"$group": {
            "_id": "$mess",
            "total":         {"$sum": 1},
            "avg_food":      {"$avg": "$food_quality"},
            "avg_taste":     {"$avg": "$taste"},
            "avg_hygiene":   {"$avg": "$hygiene"},
            "avg_portion":   {"$avg": "$portion_size"},
        }},
        {"$sort": {"total": -1}},
    ]

    mess_stats = []
    async for row in db.feedback.aggregate(pipeline):
        overall = round(
            (row["avg_food"] + row["avg_taste"] + row["avg_hygiene"] + row["avg_portion"]) / 4, 2
        )
        mess_stats.append({
            "mess":             row["_id"],
            "total_feedback":   row["total"],
            "avg_food_quality": round(row["avg_food"], 2),
            "avg_taste":        round(row["avg_taste"], 2),
            "avg_hygiene":      round(row["avg_hygiene"], 2),
            "avg_portion_size": round(row["avg_portion"], 2),
            "overall_avg":      overall,
        })

    # Total counts
    total_feedback = await db.feedback.count_documents({"validated": True})
    total_mess     = await db.mess.count_documents({})

    # Recent 10 feedbacks for activity feed
    recent = []
    async for f in db.feedback.find({"validated": True}).sort("timestamp", -1).limit(10):
        recent.append({
            "mess":       f["mess"],
            "meal_type":  f["meal_type"],
            "overall":    round((f["food_quality"]+f["taste"]+f["hygiene"]+f["portion_size"])/4, 1),
            "comment":    f.get("comment", ""),
            "timestamp":  f["timestamp"].isoformat(),
        })

    return {
        "total_feedback": total_feedback,
        "total_mess":     total_mess,
        "mess_stats":     mess_stats,
        "recent_feedback": recent,
    }
