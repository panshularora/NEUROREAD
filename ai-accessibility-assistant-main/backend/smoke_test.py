import requests

BASE = "http://127.0.0.1:8001"


def post(path: str, payload: dict, timeout: int = 25):
    r = requests.post(f"{BASE}{path}", json=payload, timeout=timeout)
    r.raise_for_status()
    return r.json()


def main():
    print("GET /", requests.get(f"{BASE}/", timeout=10).json())

    j = post(
        "/assistive/simplify",
        {
            "text": "Neurodiverse learners may face challenges when reading dense academic texts.",
            "profile": "default",
            "enable_audio": False,
        },
    )
    print("/assistive/simplify ok", bool(j.get("simplified_text")), "keywords", j.get("keywords"))

    j = post("/assistive/rewrite", {"text": "This is a sentence. Here is another one.", "mode": "simpler"})
    print("/assistive/rewrite n", len(j.get("rewrites", [])))

    j = post("/assistive/tutor", {"text": "Plants make food with sunlight.", "question": "How?", "mode": "explain"})
    print("/assistive/tutor answer_len", len(j.get("answer") or ""))

    j = post("/assistive/vocab-card", {"word": "resilient"})
    print("/assistive/vocab-card", j.get("word"), "syn", len(j.get("synonyms", [])))

    j = post("/learning/phonics", {"word": "reading"})
    print("/learning/phonics keys", list(j)[:5])

    j = post("/learning/exercise", {"text": "The quick brown fox jumps over the lazy dog.", "blanks": 3})
    print("/learning/exercise keys", list(j)[:5])

    j = post("/learning/spelling", {"text": "Apple banana orange.", "max_words": 3})
    print("/learning/spelling keys", list(j)[:5])

    j = post("/learning/comprehension", {"text": "The sky is blue because molecules scatter light.", "max_questions": 2})
    print("/learning/comprehension keys", list(j)[:5])

    print("OK")


if __name__ == "__main__":
    main()

