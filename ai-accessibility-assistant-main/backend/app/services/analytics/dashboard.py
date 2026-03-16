from __future__ import annotations

from typing import Dict, List, Any

from sqlalchemy import func

from app.database import SessionLocal
from app.models.reading import ReadingSession


def _difficulty_bucket(score: float) -> str:
    if score < 30:
        return "low"
    elif score < 60:
        return "moderate"
    return "high"


def get_user_dashboard(user_id: str) -> Dict[str, Any]:
    """
    Aggregate reading sessions for a user into a structured dashboard payload.
    """
    db = SessionLocal()
    try:
        sessions: List[ReadingSession] = (
            db.query(ReadingSession)
            .filter(ReadingSession.user_id == user_id)
            .order_by(ReadingSession.created_at.asc())
            .all()
        )

        if not sessions:
            return {
                "avg_cognitive_load": 0.0,
                "improvement_trend": [],
                "session_history": [],
                "difficulty_distribution": {"low": 0, "moderate": 0, "high": 0},
            }

        scores = [float(s.cognitive_load or 0.0) for s in sessions]
        avg_cognitive_load = float(sum(scores) / len(scores))

        improvement_trend = scores

        session_history = [
            {
                "session_id": s.id,
                "cognitive_load": float(s.cognitive_load or 0.0),
                "reading_time": float(s.reading_time_minutes or 0.0),
                "difficult_words_count": int(s.difficult_words_count or 0),
                "timestamp": s.created_at.isoformat() if s.created_at else None,
            }
            for s in sessions
        ]

        distribution = {"low": 0, "moderate": 0, "high": 0}
        for score in scores:
            bucket = _difficulty_bucket(score)
            distribution[bucket] += 1

        return {
            "avg_cognitive_load": round(avg_cognitive_load, 2),
            "improvement_trend": improvement_trend,
            "session_history": session_history,
            "difficulty_distribution": distribution,
        }
    finally:
        db.close()

