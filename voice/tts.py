"""
Text-to-Speech (TTS) Engine
Primary: ElevenLabs (natural, streaming)
Fallback: pyttsx3 (offline, no API key needed)
Supports: English, Hindi, Hinglish
"""

import os
import time
import tempfile
import threading
from typing import Optional
from dotenv import load_dotenv

load_dotenv()
load_dotenv("api/.env")

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

# Default voice settings
DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"  # ElevenLabs "Rachel" — clear, professional
HINDI_VOICE_ID = "pNInz6obpgDQGcFmaJgB"     # ElevenLabs "Adam" — works for Hindi too

_tts_lock = threading.Lock()


# ── ElevenLabs TTS ──────────────────────────────────────────────────────────

def synthesize_with_elevenlabs(text: str, voice_id: str = DEFAULT_VOICE_ID) -> Optional[str]:
    """
    Synthesize speech using ElevenLabs API.
    Returns path to temp MP3 file.
    """
    if not ELEVENLABS_API_KEY:
        return None
    try:
        from elevenlabs.client import ElevenLabs
        from elevenlabs import save

        client = ElevenLabs(api_key=ELEVENLABS_API_KEY)
        audio = client.generate(
            text=text,
            voice=voice_id,
            model="eleven_multilingual_v2",  # Supports Hindi, English, Hinglish
        )

        tmp = tempfile.NamedTemporaryFile(suffix='.mp3', delete=False, prefix='tts_eleven_')
        save(audio, tmp.name)
        tmp.close()
        print(f"[TTS] ElevenLabs ✅: {tmp.name}")
        return tmp.name

    except Exception as e:
        print(f"[TTS] ElevenLabs error: {e}")
        return None


# ── OpenAI TTS ───────────────────────────────────────────────────────────────

def synthesize_with_openai(text: str, voice: str = "nova") -> Optional[str]:
    """
    Synthesize using OpenAI TTS API (gpt-4o-audio / tts-1-hd).
    Voices: alloy, echo, fable, onyx, nova, shimmer
    """
    if not OPENAI_API_KEY:
        return None
    try:
        from openai import OpenAI
        client = OpenAI(api_key=OPENAI_API_KEY)

        tmp = tempfile.NamedTemporaryFile(suffix='.mp3', delete=False, prefix='tts_openai_')
        tmp.close()

        response = client.audio.speech.create(
            model="tts-1-hd",
            voice=voice,
            input=text,
        )
        response.stream_to_file(tmp.name)
        print(f"[TTS] OpenAI TTS ✅: {tmp.name}")
        return tmp.name

    except Exception as e:
        print(f"[TTS] OpenAI TTS error: {e}")
        return None


# ── pyttsx3 Offline TTS ───────────────────────────────────────────────────────

def synthesize_with_pyttsx3(text: str) -> Optional[str]:
    """
    Synthesize using pyttsx3 (fully offline, no API key needed).
    Returns path to temp WAV file.
    """
    try:
        import pyttsx3
        engine = pyttsx3.init()
        engine.setProperty('rate', 175)    # Speaking speed
        engine.setProperty('volume', 0.95)

        # Try to set a good voice
        voices = engine.getProperty('voices')
        if voices:
            # Prefer female voice
            for v in voices:
                if 'zira' in v.name.lower() or 'female' in v.name.lower() or 'hazel' in v.name.lower():
                    engine.setProperty('voice', v.id)
                    break

        tmp = tempfile.NamedTemporaryFile(suffix='.wav', delete=False, prefix='tts_pyttsx3_')
        tmp.close()

        engine.save_to_file(text, tmp.name)
        engine.runAndWait()
        print(f"[TTS] pyttsx3 ✅: {tmp.name}")
        return tmp.name

    except Exception as e:
        print(f"[TTS] pyttsx3 error: {e}")
        return None


# ── Play Audio ───────────────────────────────────────────────────────────────

def play_audio(file_path: str):
    """Play an audio file (WAV or MP3) using sounddevice or playsound."""
    if not file_path or not os.path.exists(file_path):
        return
    try:
        import sounddevice as sd
        import soundfile as sf
        data, samplerate = sf.read(file_path)
        sd.play(data, samplerate)
        sd.wait()
    except Exception:
        # Fallback: use Windows built-in
        try:
            os.system(f'powershell -c "(New-Object Media.SoundPlayer \'{file_path}\').PlaySync()"')
        except Exception as e:
            print(f"[TTS] Play error: {e}")


# ── Main Unified API ─────────────────────────────────────────────────────────

def synthesize_speech(
    text: str,
    play: bool = False,
    voice_id: Optional[str] = None,
) -> Optional[str]:
    """
    Main TTS function. Tries providers in order:
    1. ElevenLabs (best quality, needs API key)
    2. OpenAI TTS (good quality, needs API key)
    3. pyttsx3 (offline fallback)

    Args:
        text: Text to synthesize
        play: Whether to play audio immediately
        voice_id: Optional ElevenLabs voice ID override

    Returns:
        Path to audio file, or None on failure
    """
    if not text or not text.strip():
        return None

    # Clean text (remove markdown formatting for TTS)
    clean = text.replace('**', '').replace('*', '').replace('#', '').replace('`', '')
    clean = ' '.join(clean.split())  # Normalize whitespace

    audio_path = None

    with _tts_lock:
        # Try ElevenLabs first
        if ELEVENLABS_API_KEY:
            vid = voice_id or DEFAULT_VOICE_ID
            audio_path = synthesize_with_elevenlabs(clean, vid)

        # Try OpenAI TTS
        if not audio_path and OPENAI_API_KEY:
            audio_path = synthesize_with_openai(clean)

        # Offline fallback
        if not audio_path:
            audio_path = synthesize_with_pyttsx3(clean)

    if audio_path and play:
        play_audio(audio_path)

    return audio_path


def speak(text: str):
    """Convenience function: synthesize and immediately play."""
    path = synthesize_speech(text, play=True)
    return path


def synthesize_to_bytes(text: str) -> Optional[bytes]:
    """
    Synthesize and return raw audio bytes (for WebSocket streaming).
    """
    path = synthesize_speech(text)
    if path and os.path.exists(path):
        with open(path, 'rb') as f:
            data = f.read()
        try:
            os.unlink(path)
        except Exception:
            pass
        return data
    return None
