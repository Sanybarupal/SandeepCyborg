import sqlite3
from database.engine import DB_PATH

class MemoryEngine:
    def __init__(self, user_id=1):
        self.user_id = user_id

    def add_message(self, role: str, content: str):
        """Stores a message in the SQLite database."""
        conn = sqlite3.connect(DB_PATH)
        try:
            c = conn.cursor()
            c.execute("INSERT INTO conversations (user_id, role, content) VALUES (?, ?, ?)", (self.user_id, role, content))
            conn.commit()
        except Exception as e:
            print(f"Database Error: {e}")
        finally:
            conn.close()

    def get_recent_history(self, limit=5):
        """Retrieves the most recent conversation history."""
        conn = sqlite3.connect(DB_PATH)
        try:
            c = conn.cursor()
            c.execute("SELECT role, content FROM conversations WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?", (self.user_id, limit))
            rows = c.fetchall()
            return reversed(rows)
        finally:
            conn.close()
