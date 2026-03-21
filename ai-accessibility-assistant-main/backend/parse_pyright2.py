import subprocess
import json
import sys

try:
    process = subprocess.run(["cmd", "/c", "npx pyright --outputjson"], capture_output=True, text=True, encoding="utf-8", errors="replace")
    data = json.loads(process.stdout)
    for d in data.get("generalDiagnostics", []):
        if d.get("severity") == "error":
            print(f"{d['file']}:{d['range']['start']['line']}: {d['message']}")
except Exception as e:
    print("Error:", e)
