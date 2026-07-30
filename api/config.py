import os
from dotenv import load_dotenv

load_dotenv()

# ─── App Info ──────────────────────────────────────
APP_NAME = "Sandeep Clone — AI Operating System"
VERSION = "1.0.0"

# ─── API Keys ──────────────────────────────────────
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

if "VERCEL" in os.environ and "DATABASE_URL" not in os.environ:
    DATABASE_URL = "sqlite:////tmp/sandeep_ai.db"
else:
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./sandeep_ai.db")

# ─── AI Settings ───────────────────────────────────
AI_MODEL = os.getenv("AI_MODEL", "gemini-3.1-pro")
AI_MOCK_MODE = not bool(OPENAI_API_KEY) and not bool(GEMINI_API_KEY)  # Mock mode if no API key

# ─── CORS ──────────────────────────────────────────
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
