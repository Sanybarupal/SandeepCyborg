"""
Speech-to-Text (STT) Engine
Primary: OpenAI Whisper API
Fallback: Google Speech Recognition (SpeechRecognition library)
Supports: English, Hindi, Hinglish
"""

import os
import time
import tempfile
from typing import Optional
from dotenv import load_dotenv

load_dotenv()
load_dotenv("api/.env")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

# ── Whisper via OpenAI API ───────────────────────────────────────────────────

def transcribe_with_whisper(audio_path: str, language: Optional[str] = None) -> str:
    """
    Transcribe audio using OpenAI Whisper API.
    language: 'en', 'hi', or None (auto-detect including Hinglish)
    """
    if not OPENAI_API_KEY:
        print("[STT] No OpenAI key — falling back to Google STT")
        return transcribe_with_google(audio_path)

    try:
        from openai import OpenAI
        client = OpenAI(api_key=OPENAI_API_KEY)

        with open(audio_path, 'rb') as f:
            params = {
                "model": "whisper-1",
                "file": f,
                "response_format": "text",
            }
            if language:
                params["language"] = language

            start = time.time()
            result = client.audio.transcriptions.create(**params)
            elapsed = time.time() - start

        text = result.strip() if isinstance(result, str) else str(result).strip()
        print(f"[STT] Whisper ✅ ({elapsed:.2f}s): {text}")
        return text

    except Exception as e:
        print(f"[STT] Whisper error: {e} — falling back to Google")
        return transcribe_with_google(audio_path)


# ── Google Speech Recognition (Fallback) ────────────────────────────────────

def transcribe_with_google(audio_path: str) -> str:
    """
    Transcribe using Google Speech Recognition (free, no API key).
    """
    try:
        import speech_recognition as sr
        recognizer = sr.Recognizer()

        with sr.AudioFile(audio_path) as source:
            recognizer.adjust_for_ambient_noise(source, duration=0.3)
            audio = recognizer.record(source)

        # Try English + Hindi
        try:
            text = recognizer.recognize_google(audio, language="en-IN")
        except sr.UnknownValueError:
            text = recognizer.recognize_google(audio, language="hi-IN")

        print(f"[STT] Google ✅: {text}")
        return text

    except Exception as e:
        print(f"[STT] Google STT error: {e}")
        return ""


# ── Unified Transcribe API ────────────────────────────────────────────────────

def transcribe_audio(audio_path: str, language: Optional[str] = None) -> str:
    """
    Main transcription function.
    Uses Whisper if API key available, otherwise Google STT.

    Args:
        audio_path: Path to WAV/MP3 audio file
        language: Force language ('en', 'hi') or None for auto-detect

    Returns:
        Transcribed text string
    """
    if not audio_path or not os.path.exists(audio_path):
        return ""

    if OPENAI_API_KEY:
        return transcribe_with_whisper(audio_path, language)
    else:
        return transcribe_with_google(audio_path)


def transcribe_bytes(audio_bytes: bytes, format: str = "wav") -> str:
    """
    Transcribe from raw bytes (for WebSocket streaming).
    Saves to temp file then transcribes.
    """
    tmp = tempfile.NamedTemporaryFile(suffix=f'.{format}', delete=False, prefix='ws_audio_')
    try:
        tmp.write(audio_bytes)
        tmp.close()
        return transcribe_audio(tmp.name)
    finally:
        try:
            os.unlink(tmp.name)
        except Exception:
            pass


# ── Wake Word Detection ───────────────────────────────────────────────────────

WAKE_WORDS = [
    "hey sandeep", "ok sandeep", "hey clone", "ok clone",
    "jarvis", "hey jarvis", "sandeep", "clone",
    "hey ai", "ok ai",
]

def contains_wake_word(text: str) -> bool:
    """Check if text contains any wake word."""
    lower = text.lower().strip()
    return any(w in lower for w in WAKE_WORDS)

def strip_wake_word(text: str) -> str:
    """Remove wake word from the beginning of text."""
    lower = text.lower().strip()
    for w in sorted(WAKE_WORDS, key=len, reverse=True):
        if lower.startswith(w):
            return text[len(w):].strip().lstrip(',').strip()
    return text
