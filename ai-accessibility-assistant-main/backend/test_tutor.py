import os
from dotenv import load_dotenv
load_dotenv()
from app.services.llm_client import get_groq_client
import json

def test():
    client = get_groq_client()
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "test"},
                {"role": "user", "content": "test"},
            ],
            temperature=0.4,
        )
        print("Success:", response.choices[0].message.content)
    except Exception as e:
        print("Error:", type(e), e)

test()
