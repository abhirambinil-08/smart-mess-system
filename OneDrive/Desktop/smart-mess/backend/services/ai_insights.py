# ============================================================
#  services/ai_insights.py  — Hygiene analysis & recommendations
# ============================================================


def analyse_hygiene(mess: str, hygiene_score: float) -> dict:
    """
    Rule-based AI analysis on hygiene rating.
    Returns status label and a human-readable recommendation.
    """

    if hygiene_score >= 4.0:
        return {
            "mess": mess,
            "hygiene_score": hygiene_score,
            "status": "Good",
            "recommendation": (
                "Hygiene standards are stable. Keep up regular cleaning schedules "
                "and sanitation checks to maintain this score."
            ),
        }

    elif hygiene_score >= 3.0:
        return {
            "mess": mess,
            "hygiene_score": hygiene_score,
            "status": "Warning",
            "recommendation": (
                "Hygiene score is average. Recommend increasing cleaning frequency, "
                "checking food storage temperatures, and training staff on sanitation."
            ),
        }

    else:
        return {
            "mess": mess,
            "hygiene_score": hygiene_score,
            "status": "Critical",
            "recommendation": (
                "Hygiene score is critically low. Immediate deep cleaning required. "
                "Inspect food preparation areas, check for pest activity, "
                "and conduct emergency staff hygiene training."
            ),
        }
