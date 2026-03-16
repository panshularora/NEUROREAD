from __future__ import annotations

import json
import os

from dotenv import load_dotenv
from app.services.llm_client import get_groq_client

load_dotenv()

def _client():
    return get_groq_client()


def run_tutor(text: str, question: str, mode: str):
    """
    Use the Groq LLM to act as a reading tutor for the given text.
    """
    mode_instruction = {
        "explain": "Explain the answer step by step, using clear and accessible language.",
        "summarize": "Summarize the key ideas that answer the question.",
        "example": "Answer the question and provide concrete, age‑appropriate examples.",
    }.get(mode, "Explain the answer clearly.")

    system_prompt = """
You are an AI reading tutor helping a neurodiverse learner understand a text.

Return ONLY valid JSON in the following format:
{
  "answer": "...",
  "suggested_questions": ["..."],
  "confidence_score": 0.0
}
"""

    user_payload = {
        "instruction": mode_instruction,
        "text": text,
        "question": question,
    }

    try:
        response = _client().chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": json.dumps(user_payload)},
            ],
            temperature=0.4,
        )
        content = response.choices[0].message.content or ""
        cleaned = content.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1]
            cleaned = cleaned.rsplit("```", 1)[0]
        data = json.loads(cleaned)
    except Exception:
        data = {}

    answer = data.get("answer") or "I was unable to generate a detailed answer. Please try again."
    suggested_questions = data.get("suggested_questions") or []
    if not isinstance(suggested_questions, list):
        suggested_questions = [str(suggested_questions)]
    confidence_score = float(data.get("confidence_score") or 0.6)

    return answer, [str(q).strip() for q in suggested_questions if str(q).strip()], float(
        max(0.0, min(1.0, confidence_score))
    )

