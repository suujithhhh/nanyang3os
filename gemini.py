"""
Gemini service — embedding + chat generation.
Uses:
  - gemini-embedding-001  (3072 dims) for vector embeddings
  - gemini-2.5-flash-lite for chat / generation
"""

import os
import google.generativeai as genai
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).parent.parent / ".env")

GEMINI_API_KEY = os.getenv("EXTERNAL_API_KEY")
if not GEMINI_API_KEY:
    raise EnvironmentError("EXTERNAL_API_KEY is not set in .env")

genai.configure(api_key=GEMINI_API_KEY)

EMBEDDING_MODEL = "models/gemini-embedding-001"  # 3072-dimensional
CHAT_MODEL      = "gemini-2.5-flash-lite"

_chat_model = genai.GenerativeModel(CHAT_MODEL)

# Per-agent generation settings
AGENT_CONFIG = {
    "mentor": {
        "temperature": 0.3,    # precise, faithful to lecture material
        "max_tokens":  1200,   # detailed explanations
    },
    "analyse": {
        "temperature": 0.45,   # slightly more exploratory for gap diagnosis
        "max_tokens":  900,    # focused diagnostic output
    },
    "plan": {
        "temperature": 0.2,    # highly deterministic, structured plans
        "max_tokens":  800,    # concise, actionable schedules
    },
}


def embed_text(text: str, task_type: str = "retrieval_document") -> list[float]:
    """
    Generate a 3072-dim embedding for the given text using gemini-embedding-001.
    task_type:
      - "retrieval_document"  when indexing PDF chunks
      - "retrieval_query"     when embedding a user query
    """
    result = genai.embed_content(
        model=EMBEDDING_MODEL,
        content=text,
        task_type=task_type,
    )
    return result["embedding"]


def embed_query(text: str) -> list[float]:
    """Convenience wrapper for query-time embedding."""
    return embed_text(text, task_type="retrieval_query")


def generate_response(
    system_prompt: str,
    user_message: str,
    temperature: float = 0.4,
    max_tokens: int = 1024,
) -> str:
    """
    Call Gemini chat model with a system prompt + user message.
    Returns the text response.
    """
    response = _chat_model.generate_content(
        contents=[
            {"role": "user", "parts": [system_prompt]},
            {"role": "model", "parts": ["Understood. I am ready to help."]},
            {"role": "user", "parts": [user_message]},
        ],
        generation_config=genai.types.GenerationConfig(
            temperature=temperature,
            max_output_tokens=max_tokens,
        ),
    )
    return response.text
