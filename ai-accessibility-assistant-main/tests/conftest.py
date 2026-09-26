import os
import sys
import tempfile

# Keep the SQLite file out of the working tree. This has to run before any
# test imports app.database, which reads DATABASE_URL at import time.
_DB_DIR = tempfile.mkdtemp(prefix="neuroread-tests-")
os.environ.setdefault("DATABASE_URL", f"sqlite:///{os.path.join(_DB_DIR, 'test.db')}")

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))
