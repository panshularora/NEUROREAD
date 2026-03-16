import uvicorn


def main():
    # Run from backend/ with: python main.py
    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=8001,
        reload=False,
        log_level="info",
    )


if __name__ == "__main__":
    main()

