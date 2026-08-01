"""
AI Brain — Main Orchestrator
The central intelligence that:
1. Receives user input (text or audio)
2. Builds context from memory
3. Calls GPT-4o with tool schemas
4. Executes tools
5. Generates final response
6. Speaks the response via TTS
"""

import os
import json
import time
from datetime import datetime
from typing import Optional, Generator
from dotenv import load_dotenv

load_dotenv()
load_dotenv("api/.env")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

# ── System Prompt Builder ─────────────────────────────────────────────────────

def _build_system_prompt(user_profile: str = "") -> str:
    now = datetime.now()
    time_str = now.strftime("%A, %B %d, %Y at %I:%M %p")
    return f"""You are JARVIS — Sandeep Kumar's personal AI Operating System and Executive Assistant.

CURRENT TIME: {time_str}
USER: Sandeep Kumar (Admin)

CAPABILITIES:
- Control the PC: open/close applications, mouse, keyboard, screenshots, volume, shutdown
- Browser automation: open websites, search Google, play YouTube videos
- File management: open folders, search files, create/read/delete files
- Web search: search the internet for current information
- Reminders: set, list, cancel reminders
- CRM: create leads, search and update clients, pipeline management
- Memory: save notes, search past conversations
- UI Navigation: navigate the AI OS dashboard pages

PERSONALITY:
- Be concise, confident, and professional
- Address user as "Sir" or "Sandeep Sir"
- When executing actions, briefly state what you're doing
- If unsure, ask for clarification
- Speak naturally — this is a voice conversation
- Responses should be conversational (2-4 sentences max for voice)
- For complex results, summarize the key information

LANGUAGE: Respond in English unless the user speaks in Hindi (then respond in Hindi or Hinglish)

{user_profile}

IMPORTANT: Always use tools to take real actions. Never pretend to do something."""


# ── Main Brain Class ──────────────────────────────────────────────────────────

class AIBrain:
    def __init__(self):
        self.client = None
        self._setup_openai()
        self._setup_memory()

    def _setup_openai(self):
        if OPENAI_API_KEY:
            try:
                from openai import OpenAI
                self.client = OpenAI(api_key=OPENAI_API_KEY)
                print("[Brain] GPT-4o ✅ ready")
            except Exception as e:
                print(f"[Brain] OpenAI setup error: {e}")
        else:
            print("[Brain] No OpenAI key — running in fallback mode")

    def _setup_memory(self):
        from memory.short_term import get_short_term
        from memory.long_term import get_long_term
        self.stm = get_short_term()
        self.ltm = get_long_term()

    # ── Core Process Method ───────────────────────────────────────────────

    def process(self, user_input: str, speak: bool = True) -> dict:
        """
        Full pipeline: text → AI thinking → tool execution → voice response.

        Returns: {
            "text": str,          # AI text response
            "audio": str|None,    # Path to audio file
            "actions": list,      # List of tools executed
            "status": str         # "success" | "fallback" | "error"
        }
        """
        if not user_input or not user_input.strip():
            return {"text": "", "audio": None, "actions": [], "status": "empty"}

        user_input = user_input.strip()
        print(f"\n[Brain] User: {user_input}")

        # 1. Save to short-term memory
        self.stm.add_user(user_input)
        self.ltm.save_message("user", user_input)

        actions_taken = []
        response_text = ""

        # 2. Build context
        if self.client:
            response_text, actions_taken = self._llm_process(user_input)
        else:
            response_text, actions_taken = self._fallback_process(user_input)

        # 3. Save AI response
        if response_text:
            self.stm.add_ai(response_text)
            self.ltm.save_message("ai", response_text)

        print(f"[Brain] AI: {response_text}")

        # 4. TTS
        audio_path = None
        if speak and response_text:
            try:
                from voice.tts import synthesize_speech
                audio_path = synthesize_speech(response_text)
            except Exception as e:
                print(f"[Brain] TTS error: {e}")

        return {
            "text": response_text,
            "audio": audio_path,
            "actions": actions_taken,
            "status": "success" if response_text else "error",
        }

    def _llm_process(self, user_input: str):
        """Full GPT-4o + tool calling pipeline."""
        from tools.router import TOOL_SCHEMAS, execute_tool, tool_result_to_text

        # Build messages
        user_profile = self.ltm.get_user_profile()
        messages = [
            {"role": "system", "content": _build_system_prompt(user_profile)}
        ]
        # Add conversation history (last 10 exchanges)
        messages.extend(self.stm.get_openai_messages(n=10)[:-1])  # exclude last user msg
        messages.append({"role": "user", "content": user_input})

        actions_taken = []
        response_text = ""
        max_iterations = 5  # Max tool call rounds

        for iteration in range(max_iterations):
            try:
                resp = self.client.chat.completions.create(
                    model="gpt-4o",
                    messages=messages,
                    tools=TOOL_SCHEMAS,
                    tool_choice="auto",
                    temperature=0.7,
                    max_tokens=500,
                )
            except Exception as e:
                print(f"[Brain] LLM error: {e}")
                break

            choice = resp.choices[0]
            msg = choice.message

            # Capture any text
            if msg.content:
                response_text = msg.content

            # Handle tool calls
            if not msg.tool_calls:
                break  # No more tools to call

            # Add assistant message with tool calls to history
            messages.append({"role": "assistant", "content": msg.content, "tool_calls": [
                {"id": tc.id, "type": "function", "function": {"name": tc.function.name, "arguments": tc.function.arguments}}
                for tc in msg.tool_calls
            ]})

            # Execute each tool
            for tc in msg.tool_calls:
                tool_name = tc.function.name
                try:
                    tool_args = json.loads(tc.function.arguments)
                except Exception:
                    tool_args = {}

                print(f"[Brain] 🔧 Calling tool: {tool_name}({tool_args})")
                result = execute_tool(tool_name, tool_args)
                result_text = tool_result_to_text(tool_name, result)

                actions_taken.append({
                    "tool": tool_name,
                    "args": tool_args,
                    "result": result,
                    "result_text": result_text,
                })

                # Add tool result to messages
                messages.append({
                    "role": "tool",
                    "tool_call_id": tc.id,
                    "content": result_text,
                })

        return response_text, actions_taken

    def _fallback_process(self, text: str):
        """Keyword-based fallback when no OpenAI key."""
        from tools.router import execute_tool
        lower = text.lower()
        actions = []

        # Open Chrome
        if any(k in lower for k in ["open chrome", "open browser", "chrome"]):
            r = execute_tool("open_application", {"app_name": "chrome"})
            actions.append({"tool": "open_application", "result": r})
            return "Opening Chrome for you, Sir.", actions

        # YouTube
        if "youtube" in lower and ("play" in lower or "open" in lower or "search" in lower):
            q = text.replace("play", "").replace("on youtube", "").replace("youtube", "").strip()
            r = execute_tool("play_youtube", {"query": q or "trending music"})
            actions.append({"tool": "play_youtube", "result": r})
            return f"Opening YouTube{' and searching for ' + q if q else ''}, Sir.", actions

        # Google search
        if "search" in lower and "google" in lower:
            q = text.replace("search", "").replace("on google", "").replace("google", "").strip()
            r = execute_tool("search_google", {"query": q})
            actions.append({"tool": "search_google", "result": r})
            return f"Searching Google for '{q}', Sir.", actions

        # Custom Intents for Sandeep Sir
        # 1. C Drive Open
        if "c drive" in lower or "c: drive" in lower:
            r = execute_tool("open_folder", {"path": "C:\\"})
            actions.append({"tool": "open_folder", "result": r})
            return "Opening C drive for you, Sir.", actions
            
        # 2. WhatsApp
        if "whatsapp" in lower:
            r = execute_tool("open_url", {"url": "https://web.whatsapp.com"})
            actions.append({"tool": "open_url", "result": r})
            if "read" in lower or "dekho" in lower or "message" in lower:
                return "Opening WhatsApp and fetching your recent messages, Sir.", actions
            return "Opening WhatsApp for you, Sir.", actions
            
        # 3. ChatGPT
        if "chatgpt" in lower or "chat gpt" in lower:
            r = execute_tool("open_url", {"url": "https://chatgpt.com"})
            actions.append({"tool": "open_url", "result": r})
            return "Opening ChatGPT for you, Sir.", actions
            
        # 4. GitHub
        if "github" in lower or "git hub" in lower:
            r = execute_tool("open_url", {"url": "https://github.com"})
            actions.append({"tool": "open_url", "result": r})
            return "Opening GitHub for you, Sir.", actions
            
        # 5. Find File
        if "file find" in lower or "find file" in lower:
            q = text.lower().replace("file find", "").replace("find file", "").replace("karo", "").strip()
            r = execute_tool("search_files", {"query": q or "recent"})
            actions.append({"tool": "search_files", "result": r})
            return f"Searching for files matching '{q}', Sir.", actions

        # Open folder
        if "open" in lower and ("folder" in lower or "downloads" in lower or "desktop" in lower or "documents" in lower):
            folder = "downloads" if "download" in lower else ("desktop" if "desktop" in lower else "documents")
            r = execute_tool("open_folder", {"path": folder})
            actions.append({"tool": "open_folder", "result": r})
            return f"Opening {folder} folder, Sir.", actions

        # Reminder
        if "remind" in lower or "reminder" in lower:
            r = execute_tool("set_reminder", {"title": text, "when": "in 10 minutes"})
            actions.append({"tool": "set_reminder", "result": r})
            return "Reminder set, Sir.", actions

        # System info
        if "cpu" in lower or "ram" in lower or "system" in lower or "battery" in lower:
            r = execute_tool("get_system_info", {})
            actions.append({"tool": "get_system_info", "result": r})
            info = r.get("info", {})
            return f"System status: CPU at {info.get('cpu_percent', '?')}%, RAM at {info.get('ram_percent', '?')}%.", actions

        # Shutdown
        if "shutdown" in lower or "shut down" in lower:
            r = execute_tool("shutdown_pc", {"delay_seconds": 10})
            actions.append({"tool": "shutdown_pc", "result": r})
            return "Shutting down your computer in 10 seconds, Sir. Goodbye!", actions

        # Lock
        if "lock" in lower:
            r = execute_tool("lock_screen", {})
            actions.append({"tool": "lock_screen", "result": r})
            return "Screen locked, Sir.", actions

        return (
            "I heard you, Sir. Please set your OpenAI API key in the .env file to enable full AI capabilities. "
            "Currently running in offline mode.",
            actions
        )

    # ── Voice Input Pipeline ──────────────────────────────────────────────

    def process_audio(self, audio_path: str, speak: bool = True) -> dict:
        """STT → Brain → TTS full pipeline."""
        try:
            from voice.stt import transcribe_audio
            text = transcribe_audio(audio_path)
            if not text:
                return {"text": "", "audio": None, "actions": [], "status": "no_speech"}
            result = self.process(text, speak=speak)
            result["transcription"] = text
            return result
        except Exception as e:
            print(f"[Brain] Audio processing error: {e}")
            return {"text": "", "audio": None, "actions": [], "status": "error", "error": str(e)}

    def process_audio_bytes(self, audio_bytes: bytes, speak: bool = True) -> dict:
        """Process raw audio bytes (from WebSocket)."""
        try:
            from voice.stt import transcribe_bytes
            text = transcribe_bytes(audio_bytes)
            if not text:
                return {"text": "", "audio": None, "actions": [], "status": "no_speech"}
            result = self.process(text, speak=speak)
            result["transcription"] = text
            return result
        except Exception as e:
            return {"text": "", "audio": None, "actions": [], "status": "error", "error": str(e)}

    def clear_memory(self):
        self.stm.clear()

    def get_status(self) -> dict:
        return {
            "llm": "gpt-4o" if self.client else "offline",
            "memory_messages": self.stm.message_count(),
            "session": self.stm.summary(),
        }


# ── Singleton ──────────────────────────────────────────────────────────────

_brain: Optional[AIBrain] = None

def get_brain() -> AIBrain:
    global _brain
    if _brain is None:
        _brain = AIBrain()
    return _brain
