"""
API-level tests for the endpoints added in the NeuroRead final sync:
practice games, dictation checking, session logging and dashboard insights.

Run with: pytest tests/test_api.py -v
"""
import uuid

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.ml.exercise_generator import PRACTICE_GAMES_POOL
from app.services.analytics.session_tracker import calculate_cognitive_load


@pytest.fixture(scope="module")
def client():
    # The context manager runs the startup hook that creates the tables.
    with TestClient(app) as c:
        yield c


@pytest.fixture
def no_groq(monkeypatch):
    from app.services.llm_client import get_groq_client

    monkeypatch.delenv("GROQ_API_KEY", raising=False)
    get_groq_client.cache_clear()
    yield
    get_groq_client.cache_clear()


def test_health(client):
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


def test_core_routes_are_registered(client):
    # main.py loads routers through safe_include, which logs and skips a
    # router that fails to import. Check that nothing was silently dropped.
    paths = set(client.get("/openapi.json").json()["paths"])
    expected = {
        "/assistive/simplify",
        "/assistive/tts",
        "/assistive/tutor",
        "/assistive/annotate",
        "/assistive/difficulty-check",
        "/analytics/session",
        "/analytics/dashboard/{user_id}",
        "/api/learning/session/start",
        "/api/learning/session/{session_id}/answer",
        "/api/learning/practice/generate",
        "/api/learning/practice/evaluate/dictation",
        "/personalization/update",
    }
    missing = expected - paths
    assert not missing, f"routes missing: {sorted(missing)}"


def test_simplify_uses_rule_based_fallback_without_api_key(client, no_groq):
    text = (
        "The administration of pharmaceutical compounds necessitates meticulous "
        "consideration of contraindications. Physicians must evaluate comorbidities "
        "before prescribing. Failure to do so can prolong hospitalisation."
    )
    res = client.post("/assistive/simplify", json={"text": text, "profile": "easy_read"})
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert data["simplified_text"]
    assert 0 <= data["original_analysis"]["cognitive_load_score"] <= 100
    assert "cognitive_load_score" in data["simplified_analysis"]
    assert isinstance(data["keywords"], list)


@pytest.mark.parametrize("game_type", sorted(PRACTICE_GAMES_POOL))
def test_practice_generate_returns_an_item_for_every_game(client, game_type):
    res = client.get("/api/learning/practice/generate", params={"game_type": game_type})
    assert res.status_code == 200
    item = res.json()
    assert "id" in item
    assert item in PRACTICE_GAMES_POOL[game_type]


def test_practice_generate_unknown_game(client):
    res = client.get("/api/learning/practice/generate", params={"game_type": "chess"})
    assert res.status_code == 200
    assert "error" in res.json()


@pytest.mark.parametrize(
    "target,answer,expected",
    [
        ("laugh", "laugh", True),
        ("laugh", "laf", True),      # gh -> f
        ("phone", "fone", True),     # ph -> f
        ("friend", "table", False),
    ],
)
def test_dictation_accepts_phonetic_spellings(client, target, answer, expected):
    res = client.post(
        "/api/learning/practice/evaluate/dictation",
        json={"target": target, "answer": answer},
    )
    assert res.status_code == 200
    assert res.json()["correct"] is expected


def test_behavioural_cognitive_load_formula():
    # 10 base + 15 per error + 5 per pause + 2 per minute + 1.5 per difficult word
    assert calculate_cognitive_load(2, 1, 1, 2) == pytest.approx(37.0)
    assert calculate_cognitive_load(0, 0, 0, 0) == pytest.approx(10.0)
    assert calculate_cognitive_load(30, 10, 10, 10) == 100.0


def test_dashboard_for_new_user_has_welcome_insight(client):
    res = client.get(f"/analytics/dashboard/{uuid.uuid4()}")
    assert res.status_code == 200
    data = res.json()
    assert data["session_history"] == []
    assert data["insights"][0]["type"] == "info"


def test_logged_struggle_session_shows_up_in_dashboard(client):
    user_id = f"test-{uuid.uuid4()}"
    res = client.post(
        "/analytics/session",
        json={"user_id": user_id, "reading_time": 2, "pauses": 4, "errors": 3},
    )
    assert res.status_code == 200
    assert res.json()["cognitive_load"] == pytest.approx(79.0)

    data = client.get(f"/analytics/dashboard/{user_id}").json()
    assert len(data["session_history"]) == 1
    session = data["session_history"][0]
    assert session["pauses"] == 4 and session["errors"] == 3
    insight_types = {i["type"] for i in data["insights"]}
    assert {"struggle", "phonics"} <= insight_types
    assert data["difficulty_distribution"]["high"] == 1
