"""
Tests for BKT Engine
Reference: Corbett & Anderson (1994) "Knowledge tracing"

Run with: pytest tests/test_bkt.py -v
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

import pytest
from app.ml.bkt_engine import BKTEngine


@pytest.fixture
def bkt():
    return BKTEngine(p_init=0.1, p_transit=0.09, p_slip=0.10, p_guess=0.25)


def test_correct_answer_increases_p_know(bkt):
    """Answering correctly should increase P(know)."""
    p_before = 0.4
    p_after = bkt.update(p_before, correct=True)
    assert p_after > p_before, f"Expected p_after > p_before, got {p_after} <= {p_before}"


def test_incorrect_answer_decreases_p_know(bkt):
    """Answering incorrectly should decrease P(know) relative to a correct answer."""
    p_initial = 0.4
    p_correct = bkt.update(p_initial, correct=True)
    p_incorrect = bkt.update(p_initial, correct=False)
    assert p_incorrect < p_correct, (
        f"Expected p_incorrect ({p_incorrect}) < p_correct ({p_correct})"
    )


def test_mastery_threshold_at_0_85(bkt):
    """P(know) >= 0.85 should count as mastery."""
    assert bkt.get_mastery(0.85) is True
    assert bkt.get_mastery(0.86) is True
    assert bkt.get_mastery(0.84) is False
    assert bkt.get_mastery(0.0) is False


def test_p_know_stays_bounded_between_0_and_1(bkt):
    """P(know) must always remain in [0, 1]."""
    p = 0.5
    for _ in range(100):
        p = bkt.update(p, correct=True)
    assert 0.0 <= p <= 1.0, f"P(know) out of bounds: {p}"

    p = 0.5
    for _ in range(100):
        p = bkt.update(p, correct=False)
    assert 0.0 <= p <= 1.0, f"P(know) out of bounds: {p}"


def test_multiple_correct_answers_converge_to_mastery(bkt):
    """Many correct answers should push P(know) above threshold."""
    p = bkt.p_init
    for _ in range(50):
        p = bkt.update(p, correct=True)
    assert bkt.get_mastery(p), f"Expected mastery after 50 correct answers, got p={p}"


def test_multiple_incorrect_answers_stay_low(bkt):
    """Many incorrect answers should keep P(know) low."""
    p = bkt.p_init
    for _ in range(50):
        p = bkt.update(p, correct=False)
    assert p < 0.5, f"Expected P(know) < 0.5 after 50 incorrect answers, got p={p}"


def test_initial_p_know_is_low(bkt):
    """Default initial P(know) should be low (0.1)."""
    assert bkt.p_init < 0.3, f"Expected p_init < 0.3, got {bkt.p_init}"


def test_bkt_update_is_deterministic(bkt):
    """Same inputs must always produce same output (BKT is deterministic)."""
    p1 = bkt.update(0.4, correct=True)
    p2 = bkt.update(0.4, correct=True)
    p3 = bkt.update(0.4, correct=True)
    assert p1 == p2 == p3, f"BKT is not deterministic: {p1}, {p2}, {p3}"


def test_transit_probability_applies_correctly(bkt):
    """
    When student already knows (p_know → 1.0 after correct), applying transit
    to a value of 1.0 should keep it at 1.0 (no-op).
    """
    # If p_know_given_obs = 1.0, then p_transit doesn't change anything
    p = 0.99
    p_next = bkt.update(p, correct=True)
    # Result should be close to 1.0 (within float precision)
    assert p_next >= p, f"Expected p_next >= p (transit shouldn't reduce high values), got {p_next}"


def test_slip_probability_reduces_p_correct(bkt):
    """
    P(correct | know=1.0) should be (1 - p_slip), not 1.0.
    Validate the BKT formula accounts for slip.
    """
    p_correct_if_know = bkt.p_correct(1.0)
    expected = 1.0 - bkt.p_slip
    assert abs(p_correct_if_know - expected) < 1e-6, (
        f"Expected p_correct(1.0) = {expected}, got {p_correct_if_know}"
    )
