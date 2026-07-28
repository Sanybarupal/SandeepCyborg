"""
Long-Term Memory — Persistent storage with semantic search via ChromaDB.
Stores: conversations, preferences, notes, reminders, tasks.
"""

import os
import json
import time
import sqlite3
import hashlib
from typing import Optional, List, Dict, Any
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'sanjeev_ai.db')

# ── SQLite helpers ────────────────────────────────────────────────────────────

def _get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def _init_tables():
    conn = _get_conn()
    c = conn.cursor()
    c.executescript("""
        CREATE TABLE IF NOT EXISTS conversations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            timestamp REAL NOT NULL,
            metadata TEXT DEFAULT '{}'
        );
        CREATE TABLE IF NOT EXISTS memories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT UNIQUE NOT NULL,
            value TEXT NOT NULL,
            category TEXT DEFAULT 'general',
            updated_at REAL NOT NULL
        );
        CREATE TABLE IF NOT EXISTS reminders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            due_at REAL NOT NULL,
            created_at REAL NOT NULL,
            completed INTEGER DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS user_notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            content TEXT NOT NULL,
            tags TEXT DEFAULT '[]',
            created_at REAL NOT NULL,
            updated_at REAL NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_conv_session ON conversations(session_id);
        CREATE INDEX IF NOT EXISTS idx_conv_role ON conversations(role);
    """)
    conn.commit()
    conn.close()

_init_tables()


# ── ChromaDB Vector Store (optional) ─────────────────────────────────────────

_chroma_client = None
_chroma_collection = None

def _get_chroma():
    global _chroma_client, _chroma_collection
    if _chroma_collection is not None:
        return _chroma_collection
    try:
        import chromadb
        persist_dir = os.path.join(os.path.dirname(__file__), '..', 'chroma_db')
        os.makedirs(persist_dir, exist_ok=True)
        _chroma_client = chromadb.PersistentClient(path=persist_dir)
        _chroma_collection = _chroma_client.get_or_create_collection(
            name="ai_memory",
            metadata={"hnsw:space": "cosine"}
        )
        print("[LTM] ChromaDB ✅ initialized")
        return _chroma_collection
    except Exception as e:
        print(f"[LTM] ChromaDB not available: {e} (will use SQLite only)")
        return None


# ── Long-Term Memory Class ────────────────────────────────────────────────────

class LongTermMemory:
    """
    Persistent memory with SQLite + ChromaDB semantic search.
    """

    def __init__(self, session_id: Optional[str] = None):
        self.session_id = session_id or f"session_{int(time.time())}"
        self.chroma = _get_chroma()

    # ── Conversation Persistence ──────────────────────────────────────────

    def save_message(self, role: str, content: str, metadata: dict = None) -> int:
        """Save a conversation message to SQLite."""
        conn = _get_conn()
        c = conn.cursor()
        c.execute(
            "INSERT INTO conversations (session_id, role, content, timestamp, metadata) VALUES (?,?,?,?,?)",
            (self.session_id, role, content, time.time(), json.dumps(metadata or {}))
        )
        msg_id = c.lastrowid
        conn.commit()
        conn.close()

        # Also embed in ChromaDB for semantic search
        if self.chroma and content.strip():
            try:
                doc_id = f"msg_{msg_id}"
                self.chroma.add(
                    documents=[content],
                    metadatas=[{"role": role, "session": self.session_id, "ts": time.time()}],
                    ids=[doc_id]
                )
            except Exception:
                pass

        return msg_id

    def get_recent_conversations(self, limit: int = 20) -> List[dict]:
        """Get recent messages from current session."""
        conn = _get_conn()
        rows = conn.execute(
            "SELECT role, content, timestamp FROM conversations WHERE session_id=? ORDER BY id DESC LIMIT ?",
            (self.session_id, limit)
        ).fetchall()
        conn.close()
        return [dict(r) for r in reversed(rows)]

    def get_all_sessions(self) -> List[str]:
        """List all past session IDs."""
        conn = _get_conn()
        rows = conn.execute("SELECT DISTINCT session_id FROM conversations ORDER BY id DESC LIMIT 50").fetchall()
        conn.close()
        return [r['session_id'] for r in rows]

    def search_conversations(self, query: str, top_k: int = 5) -> List[dict]:
        """Semantic search across all past conversations."""
        if self.chroma:
            try:
                results = self.chroma.query(
                    query_texts=[query],
                    n_results=min(top_k, 10),
                    where={"role": {"$in": ["user", "ai"]}}
                )
                docs = results.get('documents', [[]])[0]
                metas = results.get('metadatas', [[]])[0]
                return [{"content": d, "meta": m} for d, m in zip(docs, metas)]
            except Exception as e:
                print(f"[LTM] Chroma search error: {e}")

        # Fallback: SQLite LIKE search
        conn = _get_conn()
        rows = conn.execute(
            "SELECT role, content, timestamp FROM conversations WHERE content LIKE ? ORDER BY id DESC LIMIT ?",
            (f"%{query}%", top_k)
        ).fetchall()
        conn.close()
        return [dict(r) for r in rows]

    # ── User Preferences / Key-Value Memory ──────────────────────────────

    def remember(self, key: str, value: Any, category: str = "general"):
        """Store a named memory (preferences, facts about user)."""
        conn = _get_conn()
        conn.execute(
            "INSERT OR REPLACE INTO memories (key, value, category, updated_at) VALUES (?,?,?,?)",
            (key, json.dumps(value), category, time.time())
        )
        conn.commit()
        conn.close()

    def recall(self, key: str) -> Optional[Any]:
        """Retrieve a named memory."""
        conn = _get_conn()
        row = conn.execute("SELECT value FROM memories WHERE key=?", (key,)).fetchone()
        conn.close()
        if row:
            return json.loads(row['value'])
        return None

    def recall_all(self, category: str = None) -> Dict[str, Any]:
        """Recall all memories, optionally filtered by category."""
        conn = _get_conn()
        if category:
            rows = conn.execute("SELECT key, value FROM memories WHERE category=?", (category,)).fetchall()
        else:
            rows = conn.execute("SELECT key, value FROM memories").fetchall()
        conn.close()
        return {r['key']: json.loads(r['value']) for r in rows}

    # ── Reminders ──────────────────────────────────────────────────────────

    def add_reminder(self, title: str, due_at: float, description: str = "") -> int:
        conn = _get_conn()
        c = conn.cursor()
        c.execute(
            "INSERT INTO reminders (title, description, due_at, created_at) VALUES (?,?,?,?)",
            (title, description, due_at, time.time())
        )
        rid = c.lastrowid
        conn.commit()
        conn.close()
        return rid

    def get_pending_reminders(self) -> List[dict]:
        conn = _get_conn()
        rows = conn.execute(
            "SELECT * FROM reminders WHERE completed=0 ORDER BY due_at ASC"
        ).fetchall()
        conn.close()
        return [dict(r) for r in rows]

    def complete_reminder(self, reminder_id: int):
        conn = _get_conn()
        conn.execute("UPDATE reminders SET completed=1 WHERE id=?", (reminder_id,))
        conn.commit()
        conn.close()

    # ── Notes ──────────────────────────────────────────────────────────────

    def add_note(self, content: str, title: str = "", tags: list = None) -> int:
        conn = _get_conn()
        c = conn.cursor()
        now = time.time()
        c.execute(
            "INSERT INTO user_notes (title, content, tags, created_at, updated_at) VALUES (?,?,?,?,?)",
            (title, content, json.dumps(tags or []), now, now)
        )
        nid = c.lastrowid
        conn.commit()
        conn.close()
        return nid

    def get_notes(self, limit: int = 20) -> List[dict]:
        conn = _get_conn()
        rows = conn.execute("SELECT * FROM user_notes ORDER BY updated_at DESC LIMIT ?", (limit,)).fetchall()
        conn.close()
        return [dict(r) for r in rows]

    # ── Summary for AI context ────────────────────────────────────────────

    def get_user_profile(self) -> str:
        """Get a text summary of known user facts for system prompt injection."""
        prefs = self.recall_all(category="preference")
        facts = self.recall_all(category="fact")
        lines = ["Known user information:"]
        for k, v in {**facts, **prefs}.items():
            lines.append(f"  - {k}: {v}")
        reminders = self.get_pending_reminders()
        if reminders:
            lines.append(f"Pending reminders: {len(reminders)}")
            for r in reminders[:3]:
                due = datetime.fromtimestamp(r['due_at']).strftime('%b %d %I:%M %p')
                lines.append(f"  - {r['title']} (due {due})")
        return "\n".join(lines) if len(lines) > 1 else ""


# ── Singleton ──────────────────────────────────────────────────────────────
_ltm: Optional[LongTermMemory] = None

def get_long_term(session_id: str = None) -> LongTermMemory:
    global _ltm
    if _ltm is None:
        _ltm = LongTermMemory(session_id)
    return _ltm
