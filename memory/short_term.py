"""
Short-Term Memory — In-memory conversation buffer for active session.
Holds last N messages + current task context.
"""

import time
from collections import deque
from dataclasses import dataclass, field
from typing import Optional, List, Dict, Any


@dataclass
class Message:
    role: str          # 'user' | 'ai' | 'system' | 'tool'
    content: str
    timestamp: float = field(default_factory=time.time)
    tool_name: Optional[str] = None
    tool_result: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict:
        return {
            "role": self.role,
            "content": self.content,
            "timestamp": self.timestamp,
            "tool_name": self.tool_name,
        }

    def to_openai(self) -> dict:
        """Convert to OpenAI message format."""
        if self.role == 'ai':
            return {"role": "assistant", "content": self.content}
        elif self.role in ('user', 'system'):
            return {"role": self.role, "content": self.content}
        elif self.role == 'tool':
            return {"role": "tool", "content": self.content, "tool_call_id": self.tool_name or ""}
        return {"role": "user", "content": self.content}


class ShortTermMemory:
    """
    Session-scoped circular buffer memory.
    Keeps the last `max_messages` exchanges in RAM.
    """

    def __init__(self, max_messages: int = 30):
        self.max_messages = max_messages
        self._buffer: deque = deque(maxlen=max_messages)
        self.current_task: Optional[str] = None
        self.session_start = time.time()
        self.user_name = "Sandeep"

    # ── Write ──────────────────────────────────────────────────────────────

    def add(self, role: str, content: str, **kwargs) -> Message:
        msg = Message(role=role, content=content, **kwargs)
        self._buffer.append(msg)
        return msg

    def add_user(self, content: str) -> Message:
        return self.add('user', content)

    def add_ai(self, content: str) -> Message:
        return self.add('ai', content)

    def add_tool(self, tool_name: str, result: str) -> Message:
        return self.add('tool', result, tool_name=tool_name)

    def set_task(self, task: str):
        """Track what the AI is currently working on."""
        self.current_task = task

    def clear_task(self):
        self.current_task = None

    # ── Read ───────────────────────────────────────────────────────────────

    def get_recent(self, n: int = 10) -> List[Message]:
        """Get last n messages."""
        return list(self._buffer)[-n:]

    def get_openai_messages(self, n: int = 15) -> List[dict]:
        """Get last n messages in OpenAI chat format."""
        recent = self.get_recent(n)
        return [m.to_openai() for m in recent]

    def get_context_string(self, n: int = 8) -> str:
        """Get last n exchanges as a readable string for context injection."""
        lines = []
        for m in self.get_recent(n):
            prefix = "User" if m.role == 'user' else ("AI" if m.role == 'ai' else "Tool")
            lines.append(f"{prefix}: {m.content}")
        return "\n".join(lines)

    def last_user_message(self) -> Optional[str]:
        for m in reversed(list(self._buffer)):
            if m.role == 'user':
                return m.content
        return None

    def message_count(self) -> int:
        return len(self._buffer)

    def clear(self):
        self._buffer.clear()
        self.current_task = None

    def summary(self) -> dict:
        return {
            "messages": self.message_count(),
            "current_task": self.current_task,
            "session_duration_s": round(time.time() - self.session_start, 1),
            "user": self.user_name,
        }


# ── Singleton per process ──────────────────────────────────────────────────
_short_term = ShortTermMemory()

def get_short_term() -> ShortTermMemory:
    return _short_term
