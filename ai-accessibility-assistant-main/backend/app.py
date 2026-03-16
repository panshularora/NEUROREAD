"""
Legacy entrypoint shim.

This project used to include a small Flask mock server at `backend/app.py`.
The real backend is now FastAPI and should be started with:

  python main.py

To avoid confusion (and "it runs but the APIs don't match"), this file now
starts the FastAPI app too when run directly.
"""

import uvicorn


def main():
    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=8000,
        reload=False,
        log_level="info",
    )


if __name__ == "__main__":
    main()

