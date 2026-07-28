"""
Voice Agent API — WebSocket + REST endpoints for the Voice AI system.
WebSocket: real-time bidirectional voice streaming
REST: text commands, history, status
"""

import os
import json
import base64
import asyncio
import time
from datetime import datetime
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/voice", tags=["Voice AI"])

# Lazy import to avoid slow startup
_brain = None

def _get_brain():
    global _brain
    if _brain is None:
        import sys
        import os
        # Add root to path
        root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        if root not in sys.path:
            sys.path.insert(0, root)
        from core.brain import get_brain
        _brain = get_brain()
    return _brain

# ── Pydantic Models ────────────────────────────────────────────────────────

class TextCommandRequest(BaseModel):
    text: str
    speak: bool = False  # Generate TTS audio

class CommandResponse(BaseModel):
    text: str
    transcription: Optional[str] = None
    actions: list = []
    status: str
    timestamp: str = ""
    audio_b64: Optional[str] = None

# ── REST Endpoints ─────────────────────────────────────────────────────────

@router.post("/command")
async def text_command(req: TextCommandRequest):
    """Process a text command through the AI Brain."""
    try:
        brain = _get_brain()
        result = await asyncio.to_thread(brain.process, req.text, req.speak)

        response = {
            "text": result.get("text", ""),
            "actions": result.get("actions", []),
            "status": result.get("status", "error"),
            "timestamp": datetime.now().isoformat(),
        }

        # Include audio as base64 if requested
        if req.speak and result.get("audio"):
            try:
                with open(result["audio"], "rb") as f:
                    audio_bytes = f.read()
                response["audio_b64"] = base64.b64encode(audio_bytes).decode()
                response["audio_format"] = "mp3" if result["audio"].endswith(".mp3") else "wav"
                os.unlink(result["audio"])
            except Exception:
                pass

        return JSONResponse(content=response)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/transcribe")
async def transcribe_audio_file(file: UploadFile = File(...)):
    """Upload an audio file and get transcription."""
    import tempfile
    try:
        # Save uploaded file
        suffix = os.path.splitext(file.filename or "audio.wav")[1] or ".wav"
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False, prefix="upload_") as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name

        # Transcribe
        import sys
        root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        if root not in sys.path:
            sys.path.insert(0, root)
        from voice.stt import transcribe_audio
        text = await asyncio.to_thread(transcribe_audio, tmp_path)
        os.unlink(tmp_path)

        return {"text": text, "success": bool(text)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history")
async def get_history(limit: int = 20):
    """Get recent conversation history."""
    try:
        brain = _get_brain()
        messages = brain.stm.get_recent(limit)
        return {
            "messages": [m.to_dict() for m in messages],
            "count": len(messages),
            "session": brain.stm.summary(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/memory")
async def clear_memory():
    """Clear the current session memory."""
    try:
        brain = _get_brain()
        brain.clear_memory()
        return {"success": True, "message": "Memory cleared"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status")
async def get_status():
    """Get Voice AI system status."""
    try:
        brain = _get_brain()
        status = brain.get_status()
        return {
            "status": "online",
            "ai_mode": status["llm"],
            "memory_messages": status["memory_messages"],
            "session": status["session"],
            "timestamp": datetime.now().isoformat(),
            "capabilities": {
                "stt": "whisper" if os.getenv("OPENAI_API_KEY") else "google",
                "tts": "elevenlabs" if os.getenv("ELEVENLABS_API_KEY") else ("openai" if os.getenv("OPENAI_API_KEY") else "pyttsx3"),
                "llm": "gpt-4o" if os.getenv("OPENAI_API_KEY") else "offline",
                "tools": 25,
            }
        }
    except Exception as e:
        return {"status": "initializing", "error": str(e)}


@router.get("/reminders")
async def get_reminders():
    """Get all pending reminders."""
    try:
        import sys
        root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        if root not in sys.path:
            sys.path.insert(0, root)
        from tools.reminder import list_reminders
        return list_reminders()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── WebSocket Real-Time Voice ─────────────────────────────────────────────

@router.websocket("/ws")
async def voice_websocket(websocket: WebSocket):
    """
    Full-duplex WebSocket for real-time voice interaction.

    Client sends:
        { "type": "audio", "data": "<base64_wav>" }
        { "type": "text", "text": "user message" }
        { "type": "ping" }

    Server sends:
        { "type": "transcript", "text": "what user said" }
        { "type": "thinking" }
        { "type": "tool", "name": "...", "args": {...} }
        { "type": "response", "text": "...", "audio": "<base64_mp3>", "actions": [...] }
        { "type": "error", "message": "..." }
        { "type": "pong" }
    """
    await websocket.accept()
    print("[WS] Client connected to Voice AI WebSocket")

    try:
        brain = _get_brain()
    except Exception as e:
        await websocket.send_json({"type": "error", "message": f"Brain init failed: {e}"})
        await websocket.close()
        return

    # Send welcome
    await websocket.send_json({
        "type": "connected",
        "message": "Voice AI connected. Ready to listen.",
        "status": brain.get_status(),
    })

    try:
        while True:
            raw = await websocket.receive_text()
            try:
                data = json.loads(raw)
            except Exception:
                await websocket.send_json({"type": "error", "message": "Invalid JSON"})
                continue

            msg_type = data.get("type", "text")

            # ── Ping ──
            if msg_type == "ping":
                await websocket.send_json({"type": "pong", "ts": time.time()})
                continue

            # ── Audio Message ──
            elif msg_type == "audio":
                audio_b64 = data.get("data", "")
                if not audio_b64:
                    continue

                try:
                    audio_bytes = base64.b64decode(audio_b64)
                except Exception:
                    await websocket.send_json({"type": "error", "message": "Invalid base64 audio"})
                    continue

                # Send thinking status
                await websocket.send_json({"type": "thinking", "stage": "transcribing"})

                # STT in thread
                try:
                    from voice.stt import transcribe_bytes
                    text = await asyncio.to_thread(transcribe_bytes, audio_bytes)
                except Exception as e:
                    await websocket.send_json({"type": "error", "message": f"STT failed: {e}"})
                    continue

                if not text:
                    await websocket.send_json({"type": "no_speech", "message": "No speech detected"})
                    continue

                # Send transcript
                await websocket.send_json({"type": "transcript", "text": text})

                # Process with brain
                await _process_and_stream(websocket, brain, text)

            # ── Text Message ──
            elif msg_type == "text":
                text = data.get("text", "").strip()
                if not text:
                    continue
                await websocket.send_json({"type": "thinking", "stage": "processing"})
                await _process_and_stream(websocket, brain, text)

            # ── Clear Memory ──
            elif msg_type == "clear":
                brain.clear_memory()
                await websocket.send_json({"type": "cleared", "message": "Memory cleared"})

    except WebSocketDisconnect:
        print("[WS] Client disconnected")
    except Exception as e:
        print(f"[WS] Error: {e}")
        try:
            await websocket.send_json({"type": "error", "message": str(e)})
        except Exception:
            pass


async def _process_and_stream(websocket: WebSocket, brain, text: str):
    """Process text through brain and stream results back to WebSocket client."""
    try:
        # Run in thread to avoid blocking the event loop
        result = await asyncio.to_thread(brain.process, text, True)

        # Send each tool action as it completes
        for action in result.get("actions", []):
            await websocket.send_json({
                "type": "tool",
                "name": action["tool"],
                "args": action.get("args", {}),
                "result_text": action.get("result_text", ""),
            })

        # Build final response
        response_data = {
            "type": "response",
            "text": result.get("text", ""),
            "actions": [{"tool": a["tool"], "result_text": a.get("result_text", "")} for a in result.get("actions", [])],
            "status": result.get("status", "error"),
            "timestamp": datetime.now().isoformat(),
        }

        # Attach audio
        audio_path = result.get("audio")
        if audio_path and os.path.exists(audio_path):
            try:
                with open(audio_path, "rb") as f:
                    audio_bytes = f.read()
                response_data["audio_b64"] = base64.b64encode(audio_bytes).decode()
                response_data["audio_format"] = "mp3" if audio_path.endswith(".mp3") else "wav"
                os.unlink(audio_path)
            except Exception:
                pass

        await websocket.send_json(response_data)

    except Exception as e:
        await websocket.send_json({"type": "error", "message": str(e)})
