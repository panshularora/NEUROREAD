import os
import json
from typing import Any, Dict

from dotenv import load_dotenv
from app.services.llm_client import get_groq_client

load_dotenv()

def _client():
    return get_groq_client()

# Plain-language replacements used when no LLM is available. Longer phrases
# come first so "prior to" wins over "prior".
PLAIN_WORDS = {
    "the administration of": "giving",
    "consideration of": "thought about",
    "in order to": "to",
    "prior to": "before",
    "subsequent to": "after",
    "in the event that": "if",
    "due to the fact that": "because",
    "with regard to": "about",
    "a large number of": "many",
    "is able to": "can",
    "are able to": "can",
    "necessitates": "needs",
    "necessitate": "need",
    "necessary": "needed",
    "meticulous": "careful",
    "meticulously": "carefully",
    "consideration": "thought",
    "particularly": "especially",
    "therefore": "so",
    "consequently": "so",
    "however": "but",
    "nevertheless": "still",
    "approximately": "about",
    "additional": "more",
    "commence": "start",
    "commenced": "started",
    "terminate": "end",
    "utilise": "use",
    "utilize": "use",
    "utilised": "used",
    "utilized": "used",
    "demonstrate": "show",
    "demonstrates": "shows",
    "facilitate": "help",
    "facilitates": "helps",
    "sufficient": "enough",
    "numerous": "many",
    "obtain": "get",
    "purchase": "buy",
    "assist": "help",
    "evaluate": "check",
    "administration": "giving",
    "pharmaceutical compounds": "medicines",
    "pharmaceutical": "medical",
    "medication": "medicine",
    "contraindications": "reasons not to use it",
    "comorbidities": "other illnesses",
    "renal": "kidney",
    "hepatic": "liver",
    "adverse": "harmful",
    "hospitalisation": "hospital stay",
    "hospitalization": "hospital stay",
    "physicians": "doctors",
    "physician": "doctor",
    "prescribing": "giving a prescription",
    "presenting with": "who have",
    "result in": "cause",
    "prolong": "lengthen",
    "individuals": "people",
    "individual": "person",
    "requirements": "needs",
    "objective": "goal",
    "modification": "change",
    "modifications": "changes",
    "complex": "hard",
    "comprehend": "understand",
    "comprehension": "understanding",
}

_PLAIN_RE = None


def _plain_pattern():
    import re

    global _PLAIN_RE
    if _PLAIN_RE is None:
        keys = sorted(PLAIN_WORDS, key=len, reverse=True)
        _PLAIN_RE = re.compile(r"\b(" + "|".join(re.escape(k) for k in keys) + r")\b", re.IGNORECASE)
    return _PLAIN_RE


def _replace_plain(text: str, used: Dict[str, str]) -> str:
    import re

    text = re.sub(r";\s*however,?\s+", ". But ", text, flags=re.IGNORECASE)
    text = re.sub(r";\s*nevertheless,?\s+", ". Still, ", text, flags=re.IGNORECASE)
    # Linking adverbs read badly once swapped mid-sentence ("must so check"),
    # so drop them there and only replace them at the start of a sentence.
    text = re.sub(r"(?<=\w)\s*,?\s+(therefore|consequently|thus|however),?(?=\s)", "", text, flags=re.IGNORECASE)

    def swap(m):
        word = m.group(0)
        plain = PLAIN_WORDS[word.lower()]
        used[word.lower()] = plain
        return plain[0].upper() + plain[1:] if word[0].isupper() else plain

    return _plain_pattern().sub(swap, text)


def _split_long_sentence(sentence: str, max_words: int) -> list:
    """Break a long sentence at clause boundaries; never cut inside a word."""
    import re

    if len(sentence.split()) <= max_words:
        return [sentence]
    parts = re.split(r";\s+|,\s+(?=(?:which|although|because|while|whereas|but)\b)", sentence)
    out = []
    for part in parts:
        part = part.strip().rstrip(".!?").strip()
        if not part:
            continue
        part = re.sub(r"^which\b", "This", part, flags=re.IGNORECASE)
        out.append(part[0].upper() + part[1:] + ".")
    return out or [sentence]


def _fallback_simplify(text: str, level: int) -> Dict[str, Any]:
    """Deterministic local fallback used when the LLM is unavailable.

    Swaps common formal words for plain ones and splits long sentences at
    clause boundaries. It never drops sentences or truncates words.
    """
    import re

    t = " ".join((text or "").strip().split())
    if not t:
        return {
            "simplified_text": "",
            "bullet_points": [],
            "definitions": {},
            "step_by_step_explanation": [],
        }

    max_words = 12 if level == 1 else 18 if level == 2 else 25
    used: Dict[str, str] = {}

    sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", t) if s.strip()]
    short = []
    for s in sentences:
        for piece in _split_long_sentence(_replace_plain(s, used), max_words):
            short.append(piece)

    simplified_text = " ".join(short)
    return {
        "simplified_text": simplified_text,
        "bullet_points": short,
        "definitions": dict(used),
        "step_by_step_explanation": short,
    }


def simplify_text(text: str, level: int) -> Dict[str, Any]:
    """Call Groq (OpenAI‑style) to simplify text for neurodiverse learners."""
    system_prompt = """
You are an AI accessibility assistant for neurodiverse learners.

Simplify the given text based on the level:

Level 1 = very simple, short sentences.
Level 2 = moderately simplified.
Level 3 = lightly simplified.

Return ONLY valid JSON in this exact format:

{
  "simplified_text": "...",
  "bullet_points": ["..."],
  "definitions": {"term": "..."},
  "step_by_step_explanation": ["step 1", "step 2"]
}

Do not return anything outside JSON.
"""

    user_prompt = f"""
Simplification level: {level}

Text:
{text}
"""

    try:
        response = _client().chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.3,
        )
        content = response.choices[0].message.content or ""
    except Exception as e:
        # If the provider is unreachable (network/DNS/timeout), fall back so the API doesn't 500.
        print(f"LLM Fetch Error: {e}")
        return _fallback_simplify(text, level)

    try:
        cleaned = content.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1]
            cleaned = cleaned.rsplit("```", 1)[0]
        return json.loads(cleaned)
    except Exception:
        return {
            "simplified_text": content,
            "bullet_points": [],
            "definitions": {},
            "step_by_step_explanation": [],
        }