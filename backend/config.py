import os
from dotenv import load_dotenv

load_dotenv()

# ─── App Info ──────────────────────────────────────
APP_NAME = "Sandeep Clone — AI Operating System"
VERSION = "1.0.0"

# ─── API Keys ──────────────────────────────────────
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")

# ─── Database ──────────────────────────────────────
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./sandeep_ai.db")

# ─── AI Settings ───────────────────────────────────
AI_MODEL = os.getenv("AI_MODEL", "gpt-4o")
AI_MOCK_MODE = not bool(OPENAI_API_KEY)  # Mock mode if no API key

# ─── CORS ──────────────────────────────────────────
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
