"""Smoke test for all learning endpoints (new standardized format)."""
import json
import requests

BASE = "http://127.0.0.1:8001"


def post(path, payload, timeout=25):
    r = requests.post(f"{BASE}{path}", json=payload, timeout=timeout)
    r.raise_for_status()
    return r.json()


def get(path, timeout=25):
    r = requests.get(f"{BASE}{path}", timeout=timeout)
    r.raise_for_status()
    return r.json()


def check(label, data, expected_status="success"):
    status = data.get("status")
    has_data = "data" in data
    has_meta = "meta" in data
    ok = status == expected_status and has_data and has_meta
    print(f"{'✓' if ok else '✗'} {label}: status={status} data={has_data} meta={has_meta}")
    if not ok:
        print(f"  RESPONSE: {json.dumps(data, indent=2)[:300]}")
    return ok


def main():
    results = []

    # 1. Flashcard
    j = post("/learning/flashcards", {"letter": "c"})
    results.append(check("Flashcard /c", j))
    d = j.get("data", {})
    print(f"  letter={d.get('letter')} examples={d.get('examples')}")

    # 2. Sound Match
    j = post("/learning/sound-match", {"sound": "s"})
    results.append(check("Sound Match /s", j))
    d = j.get("data", {})
    print(f"  prompt={d.get('prompt')} options={d.get('options')} correct={d.get('correct')}")

    # 3. Build Word
    j = post("/learning/build-word", {"word": "cat"})
    results.append(check("Build Word 'cat'", j))
    d = j.get("data", {})
    print(f"  letters={d.get('letters')} hint={d.get('hint')} phonemes={d.get('phonemes')}")

    # 4. Rhyme
    j = post("/learning/rhyme", {"word": "cat"})
    results.append(check("Rhyme 'cat'", j))
    d = j.get("data", {})
    print(f"  prompt={d.get('prompt')} options={d.get('options')} correct={d.get('correct')}")

    # 5. Picture Match
    j = post("/learning/picture-match", {"word": "dog"})
    results.append(check("Picture Match 'dog'", j))
    d = j.get("data", {})
    print(f"  emoji={d.get('targetEmoji')} options={d.get('options')} correct={d.get('correct')}")

    # 6. Comprehension
    j = post("/learning/comprehension", {"text": "The cat sat on the mat. The dog ran to the park.", "max_questions": 3})
    results.append(check("Comprehension", j))
    qs = j.get("data", {}).get("questions", [])
    for q in qs:
        print(f"  Q: {q.get('question')[:60]} opts={len(q.get('options', []))}")

    # 7. Lesson
    j = get("/learning/lesson/demo-user-001")
    results.append(check("Lesson", j))
    d = j.get("data", {})
    print(f"  level={d.get('level')} focus={d.get('focus')} activities={len(d.get('activities', []))}")

    # 8. Progress GET
    j = get("/learning/progress/demo-user-001")
    results.append(check("Progress GET", j))
    d = j.get("data", {})
    print(f"  level={d.get('currentLevel')} words={d.get('wordsLearned')} badges={len(d.get('badges', []))}")

    # 9. Progress POST
    j = post("/learning/progress", {"user_id": "smoke-test-user", "exercise": "sound_match", "correct": True})
    results.append(check("Progress POST", j))
    d = j.get("data", {})
    print(f"  recorded={d.get('recorded')} accuracy={d.get('accuracy')}%")

    print(f"\n{'='*40}")
    passed = sum(results)
    total = len(results)
    print(f"Results: {passed}/{total} passed")
    if passed == total:
        print("ALL TESTS PASSED ✓")
    else:
        print("SOME TESTS FAILED ✗")


if __name__ == "__main__":
    main()
