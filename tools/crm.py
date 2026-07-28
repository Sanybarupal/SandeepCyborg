"""
CRM Tool — Create leads, update clients, search customer database.
Operates on the existing SQLite database.
"""

import os
import sqlite3
import time
import json
from typing import Optional, List

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'sanjeev_ai.db')

def _conn():
    c = sqlite3.connect(DB_PATH)
    c.row_factory = sqlite3.Row
    return c

def _init():
    with _conn() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS crm_clients (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT,
                phone TEXT,
                company TEXT,
                status TEXT DEFAULT 'lead',
                pipeline_stage TEXT DEFAULT 'new',
                notes TEXT DEFAULT '',
                assigned_to TEXT DEFAULT 'Sandeep',
                tags TEXT DEFAULT '[]',
                created_at REAL,
                updated_at REAL
            );
            CREATE TABLE IF NOT EXISTS crm_tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                client_id INTEGER,
                title TEXT NOT NULL,
                description TEXT,
                status TEXT DEFAULT 'pending',
                due_at REAL,
                created_at REAL
            );
        """)
_init()

def create_lead(name: str, email: str = "", phone: str = "", company: str = "", notes: str = "") -> dict:
    """Create a new lead in the CRM."""
    now = time.time()
    with _conn() as conn:
        c = conn.cursor()
        c.execute(
            "INSERT INTO crm_clients (name, email, phone, company, notes, created_at, updated_at) VALUES (?,?,?,?,?,?,?)",
            (name, email, phone, company, notes, now, now)
        )
        lead_id = c.lastrowid
    return {
        "success": True, "action": "create_lead",
        "id": lead_id, "name": name,
        "message": f"Lead '{name}' created with ID #{lead_id}",
    }

def search_client(query: str) -> dict:
    """Search clients by name, email, or company."""
    with _conn() as conn:
        rows = conn.execute(
            "SELECT id, name, email, phone, company, status, pipeline_stage FROM crm_clients WHERE name LIKE ? OR email LIKE ? OR company LIKE ? LIMIT 10",
            (f"%{query}%", f"%{query}%", f"%{query}%")
        ).fetchall()
    clients = [dict(r) for r in rows]
    return {
        "success": True, "action": "search_client",
        "query": query, "results": clients, "count": len(clients),
    }

def update_client(client_id: int, **fields) -> dict:
    """Update client fields (status, pipeline_stage, notes, etc.)."""
    allowed = {'name', 'email', 'phone', 'company', 'status', 'pipeline_stage', 'notes', 'assigned_to', 'tags'}
    updates = {k: v for k, v in fields.items() if k in allowed}
    if not updates:
        return {"success": False, "error": "No valid fields to update"}
    updates['updated_at'] = time.time()
    set_clause = ", ".join(f"{k}=?" for k in updates)
    values = list(updates.values()) + [client_id]
    with _conn() as conn:
        conn.execute(f"UPDATE crm_clients SET {set_clause} WHERE id=?", values)
    return {"success": True, "action": "update_client", "id": client_id, "updated": list(updates.keys())}

def get_all_clients(status: str = None, limit: int = 20) -> dict:
    """Get client list, optionally filtered by status."""
    with _conn() as conn:
        if status:
            rows = conn.execute(
                "SELECT id, name, email, company, status, pipeline_stage FROM crm_clients WHERE status=? ORDER BY updated_at DESC LIMIT ?",
                (status, limit)
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT id, name, email, company, status, pipeline_stage FROM crm_clients ORDER BY updated_at DESC LIMIT ?",
                (limit,)
            ).fetchall()
    return {"success": True, "clients": [dict(r) for r in rows], "count": len(rows)}

def get_pipeline_summary() -> dict:
    """Get CRM pipeline overview by stage."""
    with _conn() as conn:
        rows = conn.execute(
            "SELECT pipeline_stage, COUNT(*) as count FROM crm_clients GROUP BY pipeline_stage"
        ).fetchall()
    return {
        "success": True, "action": "pipeline_summary",
        "stages": {r['pipeline_stage']: r['count'] for r in rows},
    }

def assign_task(client_id: int, title: str, description: str = "", due_at: float = None) -> dict:
    """Assign a task to a client."""
    now = time.time()
    with _conn() as conn:
        c = conn.cursor()
        c.execute(
            "INSERT INTO crm_tasks (client_id, title, description, due_at, created_at) VALUES (?,?,?,?,?)",
            (client_id, title, description, due_at or now + 86400, now)
        )
        task_id = c.lastrowid
    return {
        "success": True, "action": "assign_task",
        "task_id": task_id, "client_id": client_id, "title": title,
    }
