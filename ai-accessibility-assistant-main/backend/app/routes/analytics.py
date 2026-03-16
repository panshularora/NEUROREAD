from fastapi import APIRouter, HTTPException

from app.services.analytics.dashboard import get_user_dashboard

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get(
    "/dashboard/{user_id}",
    summary="Get analytics dashboard data for a user.",
)
def analytics_dashboard(user_id: str):
    """
    Return cognitive‑load analytics for the given user.

    **Example response**

    ```json
    {
      "avg_cognitive_load": 48.7,
      "improvement_trend": [72.3, 61.0, 48.7],
      "session_history": [
        {
          "session_id": 1,
          "cognitive_load": 72.3,
          "reading_time": 3.8,
          "difficult_words_count": 24,
          "timestamp": "2025-01-01T10:00:00Z"
        }
      ],
      "difficulty_distribution": {
        "low": 0,
        "moderate": 1,
        "high": 2
      }
    }
    ```
    """
    try:
        return get_user_dashboard(user_id)
    except Exception as exc:  # pragma: no cover - defensive
        raise HTTPException(status_code=500, detail=str(exc))

