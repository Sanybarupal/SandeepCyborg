"""
Reminder Tool — Set, list, and cancel reminders with background threading.
Reminders fire and speak aloud when due.
"""

import time
import threading
from typing import Optional, Callable
from datetime import datetime, timedelta
import re

from memory.long_term import get_long_term

_reminder_threads = {}
_speak_callback: Optional[Callable] = None

def set_speak_callback(fn: Callable):
    """Set function called when reminder fires (for TTS)."""
    global _speak_callback
    _speak_callback = fn

def _parse_time_expression(expr: str) -> Optional[float]:
    """
    Parse natural language time to Unix timestamp.
    Examples: 'in 10 minutes', 'tomorrow at 9am', 'at 5:30pm'
    """
    now = datetime.now()
    expr = expr.lower().strip()

    # "in X minutes/hours"
    m = re.match(r'in (\d+) (minute|minutes|min|hour|hours|hr|second|seconds|sec)', expr)
    if m:
        amount = int(m.group(1))
        unit = m.group(2)
        if 'hour' in unit or 'hr' in unit:
            return (now + timedelta(hours=amount)).timestamp()
        elif 'min' in unit:
            return (now + timedelta(minutes=amount)).timestamp()
        elif 'sec' in unit:
            return (now + timedelta(seconds=amount)).timestamp()

    # "tomorrow at H:MM am/pm"
    m = re.search(r'(?:tomorrow|tmrw)\s*(?:at\s*)?((\d{1,2})(?::(\d{2}))?\s*(am|pm)?)', expr)
    if m:
        base = now + timedelta(days=1)
        h = int(m.group(2))
        mi = int(m.group(3)) if m.group(3) else 0
        meridiem = m.group(4)
        if meridiem == 'pm' and h != 12:
            h += 12
        elif meridiem == 'am' and h == 12:
            h = 0
        dt = base.replace(hour=h, minute=mi, second=0, microsecond=0)
        return dt.timestamp()

    # "at H:MM am/pm" (today)
    m = re.search(r'at\s*((\d{1,2})(?::(\d{2}))?\s*(am|pm)?)', expr)
    if m:
        h = int(m.group(2))
        mi = int(m.group(3)) if m.group(3) else 0
        meridiem = m.group(4)
        if meridiem == 'pm' and h != 12:
            h += 12
        elif meridiem == 'am' and h == 12:
            h = 0
        dt = now.replace(hour=h, minute=mi, second=0, microsecond=0)
        if dt < now:
            dt += timedelta(days=1)
        return dt.timestamp()

    return None


def _reminder_thread(reminder_id: int, title: str, due_at: float):
    """Background thread that fires when reminder is due."""
    wait = due_at - time.time()
    if wait > 0:
        time.sleep(wait)

    msg = f"⏰ Reminder: {title}"
    print(f"\n[Reminder] FIRED: {msg}")

    if _speak_callback:
        try:
            _speak_callback(f"Sir, your reminder: {title}")
        except Exception:
            pass

    # Mark complete in DB
    try:
        ltm = get_long_term()
        ltm.complete_reminder(reminder_id)
    except Exception:
        pass


def set_reminder(title: str, when: str, description: str = "") -> dict:
    """
    Create a reminder.
    when: natural language like 'in 30 minutes', 'tomorrow at 9am', 'at 5:30pm'
    """
    due_at = _parse_time_expression(when)
    if due_at is None:
        # Default: 5 minutes from now
        due_at = time.time() + 300
        parsed_str = "in 5 minutes (could not parse time)"
    else:
        parsed_str = datetime.fromtimestamp(due_at).strftime('%b %d at %I:%M %p')

    # Save to long-term memory
    ltm = get_long_term()
    rid = ltm.add_reminder(title, due_at, description)

    # Start background thread
    t = threading.Thread(
        target=_reminder_thread,
        args=(rid, title, due_at),
        daemon=True,
        name=f"reminder_{rid}"
    )
    t.start()
    _reminder_threads[rid] = t

    return {
        "success": True,
        "action": "set_reminder",
        "id": rid,
        "title": title,
        "due_at": parsed_str,
        "message": f"Reminder set: '{title}' for {parsed_str}",
    }


def list_reminders() -> dict:
    """List all pending reminders."""
    ltm = get_long_term()
    reminders = ltm.get_pending_reminders()
    formatted = []
    for r in reminders:
        due = datetime.fromtimestamp(r['due_at']).strftime('%b %d at %I:%M %p')
        formatted.append({
            "id": r['id'],
            "title": r['title'],
            "due": due,
            "overdue": r['due_at'] < time.time(),
        })
    return {
        "success": True,
        "action": "list_reminders",
        "reminders": formatted,
        "count": len(formatted),
    }


def cancel_reminder(reminder_id: int) -> dict:
    """Cancel a pending reminder."""
    ltm = get_long_term()
    ltm.complete_reminder(reminder_id)
    return {
        "success": True,
        "action": "cancel_reminder",
        "id": reminder_id,
        "message": f"Reminder #{reminder_id} cancelled",
    }
