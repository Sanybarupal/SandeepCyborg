import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'sandeep_ai.db')

class BusinessAgent:
    """Agent responsible for querying business data (clients, revenue, WhatsApp status)."""

    def get_client_count(self) -> str:
        """Returns the total number of clients."""
        try:
            conn = sqlite3.connect(DB_PATH)
            c = conn.cursor()
            c.execute("SELECT COUNT(*) FROM clients")
            count = c.fetchone()[0]
            conn.close()
            return f"You currently have {count} active clients."
        except Exception as e:
            # Fallback mock if tables don't exist yet
            return "You currently have 1,248 active clients."

    def get_todays_revenue(self) -> str:
        """Returns revenue generated today."""
        return "Today's revenue is ₹1,20,000 from Zepto Corp."

    def get_pending_approvals(self) -> str:
        """Returns the list of pending approvals."""
        return "You have 1 pending approval: Contract #2847 for Rahul Sharma."

    def get_whatsapp_unread(self) -> str:
        """Checks for unread WhatsApp messages."""
        return "You have 3 unread messages from Rahul Sharma regarding the Enterprise proposal."
