from typing import Optional

from pydantic import BaseModel, Field, conint, confloat


class SessionMetrics(BaseModel):
    cognitive_load: confloat(ge=0, le=100) = Field(
        ...,
        description="Cognitive load score for the session on a 0‑100 scale.",
    )
    reading_time: confloat(gt=0) = Field(
        ...,
        description="Reading time for the session in minutes.",
    )
    difficult_words_count: conint(ge=0) = Field(
        ...,
        description="Number of difficult words encountered in the session.",
    )


class PersonalizationUpdateRequest(BaseModel):
    user_id: str = Field(..., description="Unique identifier of the user.")
    session_metrics: SessionMetrics


class UserReadingProfile(BaseModel):
    reading_speed_wpm: float
    sentence_complexity_tolerance: float
    vocabulary_difficulty_tolerance: float
    preferred_mode: str
    dyslexia_support_enabled: bool


class PersonalizationUpdateResponse(BaseModel):
    user_profile: UserReadingProfile
    adaptation_summary: str
    # Optional debug hook for future extensions
    source_sessions: Optional[int] = Field(
        None, description="Number of sessions used to derive the profile."
    )

