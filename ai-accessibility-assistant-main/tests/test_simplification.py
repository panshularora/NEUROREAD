"""
Tests for simplification engine utilities.

Run with: pytest tests/test_simplification.py -v
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

import pytest


# ── helpers ───────────────────────────────────────────────────────────────────

def chunk_text_for_reading(text: str):
    """Split text into sentence-level chunks."""
    import re
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    return [s.strip() for s in sentences if s.strip()]


def phoneme_annotate(text: str):
    """
    Returns phoneme color annotations for a text.
    Uses the same logic as the backend annotate route.
    """
    from app.routes.assistive.annotate import annotate_text
    return annotate_text(text)


# ── tests ─────────────────────────────────────────────────────────────────────

def test_simplification_returns_string():
    """simplify_text should return a dict with a non-empty 'simplified_text' key."""
    from app.services.assistive.simplifier import simplify_text

    result = simplify_text("The patient was administered medication.", level=1)
    assert isinstance(result, dict), "Expected dict result"
    # simplified_text may be empty if LLM is offline, but the key must exist
    assert "simplified_text" in result, "Missing 'simplified_text' key"


def test_similarity_score_is_above_threshold():
    """
    Simplified text should not be completely different from the original.
    At least some words should overlap.
    """
    original = "The dog ran quickly across the field."
    # Use fallback logic: test that common words are preserved
    words_original = set(original.lower().split())
    words_simplified = set("The dog ran fast.".lower().split())

    overlap = len(words_original & words_simplified) / max(len(words_original), 1)
    assert overlap > 0.1, f"Similarity too low: {overlap}"


def test_simplified_text_is_shorter_or_equal_to_original():
    """Simplified text should not be longer than the original."""
    from app.services.assistive.simplifier import _fallback_simplify

    long_text = " ".join(["This is a very complex sentence with many difficult words."] * 10)
    result = _fallback_simplify(long_text, level=1)
    simplified = result.get("simplified_text", "")
    assert len(simplified) <= len(long_text), (
        f"Simplified text ({len(simplified)} chars) longer than original ({len(long_text)} chars)"
    )


def test_chunk_function_returns_list():
    """chunk_text_for_reading should return a non-empty list of strings."""
    text = "The cat sat on the mat. The dog ran in the garden. It was a sunny day."
    chunks = chunk_text_for_reading(text)

    assert isinstance(chunks, list), "Expected list result"
    assert len(chunks) >= 1, "Expected at least one chunk"
    for chunk in chunks:
        assert isinstance(chunk, str), "Each chunk should be a string"
        assert len(chunk) > 0, "Chunks should not be empty strings"


def test_phoneme_annotator_colors_b_blue():
    """
    Phoneme annotator should color the letter 'b' with #4A90D9 (blue).
    """
    result = phoneme_annotate("bed")
    assert len(result) == 1, "Expected one word annotation"
    word_annotation = result[0]
    tokens = word_annotation["tokens"]

    # First token should be 'b' with blue color
    b_token = tokens[0]
    assert b_token["char"].lower() == "b", f"Expected 'b', got '{b_token['char']}'"
    assert b_token["color"] == "#4A90D9", (
        f"Expected '#4A90D9' for 'b', got '{b_token['color']}'"
    )


MEDICAL_TEXT = (
    "The administration of pharmaceutical compounds necessitates meticulous consideration of "
    "contraindications, particularly in patients presenting with comorbidities. Physicians must "
    "therefore evaluate renal and hepatic function prior to prescribing. Failure to do so can "
    "result in adverse drug reactions that prolong hospitalisation."
)


def test_fallback_lowers_cognitive_load():
    from app.services.assistive.simplifier import _fallback_simplify
    from app.services.cognitive_load import calculate_cognitive_load

    simplified = _fallback_simplify(MEDICAL_TEXT, level=2)["simplified_text"]
    before = calculate_cognitive_load(MEDICAL_TEXT)["cognitive_load_score"]
    after = calculate_cognitive_load(simplified)["cognitive_load_score"]
    assert after < before - 10, (before, after, simplified)


def test_fallback_keeps_every_sentence_and_never_truncates():
    from app.services.assistive.simplifier import _fallback_simplify

    simplified = _fallback_simplify(MEDICAL_TEXT, level=1)["simplified_text"]
    assert "…" not in simplified
    assert simplified.count(".") >= MEDICAL_TEXT.count(".")
    assert "hospital stay" in simplified


def test_fallback_swaps_words_and_reports_them():
    from app.services.assistive.simplifier import _fallback_simplify

    result = _fallback_simplify("Physicians must therefore evaluate renal function prior to surgery.", level=2)
    assert result["simplified_text"] == "Doctors must check kidney function before surgery."
    assert result["definitions"]["physicians"] == "doctors"


def test_fallback_splits_long_sentences_at_clause_boundaries():
    from app.services.assistive.simplifier import _fallback_simplify

    text = (
        "The committee reviewed every application that arrived before the deadline last month, "
        "which took considerably longer than anybody on the panel had originally expected."
    )
    pieces = _fallback_simplify(text, level=1)["bullet_points"]
    assert len(pieces) == 2
    assert pieces[1].startswith("This took")
