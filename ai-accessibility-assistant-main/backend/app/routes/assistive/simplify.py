from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import math

from app.services.assistive.simplifier import simplify_text as llm_simplify
from app.services.assistive.keyword_extractor import extract_keywords
from app.services.cognitive_load import calculate_cognitive_load
from app.services.analytics.session_tracker import persist_reading_session

router = APIRouter()


class SimplifyRequest(BaseModel):
    text: str
    profile: Optional[str] = "default"
    user_id: Optional[str] = None
    enable_dyslexia_support: Optional[bool] = False
    enable_audio: Optional[bool] = False
    level: Optional[int] = None  # 1=very simple, 2=moderate, 3=light


def _make_impact_summary(original_score: float, simplified_score: float, reduction: float) -> str:
    if original_score >= 70:
        severity = "high"
    elif original_score >= 40:
        severity = "moderate"
    else:
        severity = "low"

    if reduction >= 30:
        impact = f"Cognitive load reduced by {reduction:.0f}% — a significant improvement for readability."
    elif reduction >= 10:
        impact = f"Cognitive load reduced by {reduction:.0f}%, making this text more accessible."
    else:
        impact = "Text was already relatively accessible. Minor adjustments were applied."

    if severity == "high":
        advice = " We recommend using the AI Tutor for any remaining difficult terms."
    elif severity == "moderate":
        advice = " Dyslexia mode and audio playback can further support comprehension."
    else:
        advice = " Great work — keep reading to strengthen your comprehension."

    return impact + advice


@router.post("/assistive/simplify")
def simplify_text(req: SimplifyRequest):
    try:
        # Map profile to simplification level
        profile_level_map = {
            "easy_read": 1,
            "focus": 1,
            "default": 2,
            "academic": 3,
        }
        level = req.level or profile_level_map.get(req.profile or "default", 2)

        # Compute original cognitive analysis
        original_analysis = calculate_cognitive_load(req.text)

        # Call LLM-powered simplifier
        llm_result = llm_simplify(req.text, level)
        simplified_text = llm_result.get("simplified_text", req.text)

        # Compute simplified cognitive analysis
        simplified_analysis = calculate_cognitive_load(simplified_text) if simplified_text else {}

        # Compute reduction
        original_score = original_analysis.get("cognitive_load_score", 0)
        simplified_score = simplified_analysis.get("cognitive_load_score", 0)

        if original_score > 0:
            reduction = max(0.0, round((original_score - simplified_score) / original_score * 100, 1))
        else:
            reduction = 0.0

        # Extract keywords from original text
        keywords = extract_keywords(req.text, top_n=6)

        # Generate impact summary
        impact_summary = _make_impact_summary(original_score, simplified_score, reduction)

        # Persist a session log if user_id is provided
        if req.user_id:
            try:
                reading_time = original_analysis.get("estimated_reading_time_minutes", 0)
                persist_reading_session(
                    user_id=req.user_id,
                    reading_time=reading_time,
                    pauses=0,
                    errors=0,
                    difficult_words_count=len(original_analysis.get("difficult_words", [])),
                    cognitive_load=original_score,
                )
            except Exception as e:
                print(f"[SIMPLIFY] Session log failed: {e}")

        return {
            "status": "success",
            # Core simplification output
            "simplified_text": simplified_text,
            "bullet_points": llm_result.get("bullet_points", []),
            "definitions": llm_result.get("definitions", {}),
            "step_by_step_explanation": llm_result.get("step_by_step_explanation", []),
            # Analytics (shape the frontend expects)
            "original_analysis": {
                **original_analysis,
                "cognitive_load_score": round(original_score, 1),
            },
            "simplified_analysis": {
                **simplified_analysis,
                "cognitive_load_score": round(simplified_score, 1),
            },
            "cognitive_load_reduction": reduction,
            "impact_summary": impact_summary,
            "keywords": keywords,
        }

    except Exception as e:
        print("[SIMPLIFY ERROR]", e)
        return {
            "status": "error",
            "message": str(e)
        }
