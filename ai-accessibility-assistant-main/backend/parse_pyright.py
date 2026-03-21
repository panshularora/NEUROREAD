import json
with open("pyright_output.json", "r", encoding="utf-16le") as f:
    data = json.load(f)
for d in data.get("generalDiagnostics", []):
    print(f"{d['file']}:{d['range']['start']['line']}: {d['message']}")
