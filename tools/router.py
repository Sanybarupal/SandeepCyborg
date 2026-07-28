"""
Tool Router — Maps GPT-4 tool call names to Python functions.
Defines ALL tool schemas for the AI and dispatches executions.
"""

import json
from typing import Any, Dict, List, Optional

# ── Tool Function Definitions for OpenAI ─────────────────────────────────────

TOOL_SCHEMAS = [
    # ── PC Control ──
    {
        "type": "function",
        "function": {
            "name": "open_application",
            "description": "Open a local application like Chrome, VS Code, Excel, Notepad, Spotify, etc.",
            "parameters": {
                "type": "object",
                "properties": {
                    "app_name": {"type": "string", "description": "Application name e.g. 'chrome', 'excel', 'notepad', 'spotify'"}
                },
                "required": ["app_name"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "close_application",
            "description": "Close/kill a running application by name.",
            "parameters": {
                "type": "object",
                "properties": {
                    "app_name": {"type": "string"}
                },
                "required": ["app_name"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "type_text",
            "description": "Type text using the keyboard at the current cursor position.",
            "parameters": {
                "type": "object",
                "properties": {
                    "text": {"type": "string", "description": "Text to type"},
                    "press_enter": {"type": "boolean", "default": False}
                },
                "required": ["text"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "press_shortcut",
            "description": "Execute a keyboard shortcut like 'copy', 'paste', 'save', 'screenshot', 'lock screen'.",
            "parameters": {
                "type": "object",
                "properties": {
                    "shortcut": {"type": "string", "description": "Shortcut name e.g. 'copy', 'paste', 'save', 'screenshot', 'lock screen'"}
                },
                "required": ["shortcut"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "take_screenshot",
            "description": "Take a screenshot of the current screen.",
            "parameters": {"type": "object", "properties": {}}
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_system_info",
            "description": "Get system information: CPU usage, RAM, disk space, battery status.",
            "parameters": {"type": "object", "properties": {}}
        }
    },
    {
        "type": "function",
        "function": {
            "name": "shutdown_pc",
            "description": "Shut down the computer. Use only when explicitly requested.",
            "parameters": {
                "type": "object",
                "properties": {
                    "delay_seconds": {"type": "integer", "default": 10}
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "restart_pc",
            "description": "Restart the computer. Use only when explicitly requested.",
            "parameters": {
                "type": "object",
                "properties": {
                    "delay_seconds": {"type": "integer", "default": 10}
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "lock_screen",
            "description": "Lock the computer screen.",
            "parameters": {"type": "object", "properties": {}}
        }
    },
    # ── Browser ──
    {
        "type": "function",
        "function": {
            "name": "open_url",
            "description": "Open a specific website URL in the browser.",
            "parameters": {
                "type": "object",
                "properties": {
                    "url": {"type": "string", "description": "URL to open e.g. 'youtube.com', 'https://google.com'"}
                },
                "required": ["url"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "search_google",
            "description": "Search Google for information.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Search query"}
                },
                "required": ["query"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "play_youtube",
            "description": "Search YouTube and play the first matching video or song.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Song/video to play e.g. 'Arijit Singh songs'"}
                },
                "required": ["query"]
            }
        }
    },
    # ── File Manager ──
    {
        "type": "function",
        "function": {
            "name": "open_folder",
            "description": "Open a folder in File Explorer. Supports 'desktop', 'downloads', 'documents', 'pictures' etc.",
            "parameters": {
                "type": "object",
                "properties": {
                    "path": {"type": "string", "description": "Folder path or name like 'downloads', 'desktop', 'C:/Projects'"}
                },
                "required": ["path"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "search_files",
            "description": "Search for files by name on the computer.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string"},
                    "search_path": {"type": "string", "default": "~"},
                    "extensions": {"type": "array", "items": {"type": "string"}}
                },
                "required": ["query"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "read_file",
            "description": "Read the content of a text file.",
            "parameters": {
                "type": "object",
                "properties": {
                    "path": {"type": "string"}
                },
                "required": ["path"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "create_file",
            "description": "Create a new text file with optional content.",
            "parameters": {
                "type": "object",
                "properties": {
                    "path": {"type": "string"},
                    "content": {"type": "string", "default": ""}
                },
                "required": ["path"]
            }
        }
    },
    # ── Web Search ──
    {
        "type": "function",
        "function": {
            "name": "search_web",
            "description": "Search the internet for information. Use for questions about current events, facts, or anything that requires up-to-date data.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string"},
                    "max_results": {"type": "integer", "default": 5}
                },
                "required": ["query"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get current weather for a city.",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {"type": "string"}
                },
                "required": ["city"]
            }
        }
    },
    # ── Reminders ──
    {
        "type": "function",
        "function": {
            "name": "set_reminder",
            "description": "Set a reminder that will alert at the specified time.",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {"type": "string", "description": "What to remind"},
                    "when": {"type": "string", "description": "When: 'in 30 minutes', 'tomorrow at 9am', 'at 5:30pm'"},
                    "description": {"type": "string", "default": ""}
                },
                "required": ["title", "when"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "list_reminders",
            "description": "List all pending reminders.",
            "parameters": {"type": "object", "properties": {}}
        }
    },
    # ── CRM ──
    {
        "type": "function",
        "function": {
            "name": "create_lead",
            "description": "Create a new client lead in the CRM.",
            "parameters": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "email": {"type": "string", "default": ""},
                    "phone": {"type": "string", "default": ""},
                    "company": {"type": "string", "default": ""},
                    "notes": {"type": "string", "default": ""}
                },
                "required": ["name"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "search_client",
            "description": "Search for a client in the CRM by name, email, or company.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string"}
                },
                "required": ["query"]
            }
        }
    },
    # ── Memory / Notes ──
    {
        "type": "function",
        "function": {
            "name": "save_note",
            "description": "Save a note or important information to remember.",
            "parameters": {
                "type": "object",
                "properties": {
                    "content": {"type": "string"},
                    "title": {"type": "string", "default": ""}
                },
                "required": ["content"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "search_memory",
            "description": "Search past conversations and notes for information.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string"}
                },
                "required": ["query"]
            }
        }
    },
    # ── Navigation ──
    {
        "type": "function",
        "function": {
            "name": "navigate_ui",
            "description": "Navigate the AI OS dashboard to a specific page.",
            "parameters": {
                "type": "object",
                "properties": {
                    "page": {"type": "string", "description": "Page name: 'dashboard', 'clients', 'chat', 'voice', 'whatsapp', 'settings', 'upload', 'approvals', 'website-builder'"}
                },
                "required": ["page"]
            }
        }
    },
]


# ── Tool Execution Dispatcher ─────────────────────────────────────────────────

def execute_tool(tool_name: str, args: Dict[str, Any]) -> dict:
    """
    Execute a tool by name with given arguments.
    Returns a dict with 'success', 'result', and optional 'message'.
    """
    try:
        # ── PC Control ──
        if tool_name == "open_application":
            from tools.pc_control import open_application
            return open_application(args.get("app_name", ""))

        elif tool_name == "close_application":
            from tools.pc_control import close_application
            return close_application(args.get("app_name", ""))

        elif tool_name == "type_text":
            from tools.pc_control import type_text, press_key
            result = type_text(args.get("text", ""))
            if args.get("press_enter"):
                press_key("enter")
            return result

        elif tool_name == "press_shortcut":
            from tools.pc_control import execute_shortcut
            return execute_shortcut(args.get("shortcut", ""))

        elif tool_name == "take_screenshot":
            from tools.pc_control import take_screenshot
            return take_screenshot()

        elif tool_name == "get_system_info":
            from tools.system_info import get_system_info
            return get_system_info()

        elif tool_name == "shutdown_pc":
            from tools.pc_control import shutdown
            return shutdown(args.get("delay_seconds", 10))

        elif tool_name == "restart_pc":
            from tools.pc_control import restart
            return restart(args.get("delay_seconds", 10))

        elif tool_name == "lock_screen":
            from tools.pc_control import lock_screen
            return lock_screen()

        # ── Browser ──
        elif tool_name == "open_url":
            from tools.browser import open_url
            return open_url(args.get("url", ""))

        elif tool_name == "search_google":
            from tools.browser import search_google
            return search_google(args.get("query", ""))

        elif tool_name == "play_youtube":
            from tools.browser import play_youtube
            return play_youtube(args.get("query", ""))

        # ── File Manager ──
        elif tool_name == "open_folder":
            from tools.file_manager import open_folder
            return open_folder(args.get("path", "~"))

        elif tool_name == "search_files":
            from tools.file_manager import search_files
            return search_files(args.get("query", ""), args.get("search_path", "~"), args.get("extensions"))

        elif tool_name == "read_file":
            from tools.file_manager import read_file
            return read_file(args.get("path", ""))

        elif tool_name == "create_file":
            from tools.file_manager import create_file
            return create_file(args.get("path", ""), args.get("content", ""))

        # ── Web Search ──
        elif tool_name == "search_web":
            from tools.web_search import search_web, summarize_results
            result = search_web(args.get("query", ""), args.get("max_results", 5))
            if result.get("success"):
                result["summary"] = summarize_results(result.get("results", []))
            return result

        elif tool_name == "get_weather":
            from tools.web_search import get_weather
            return get_weather(args.get("city", ""))

        # ── Reminders ──
        elif tool_name == "set_reminder":
            from tools.reminder import set_reminder
            return set_reminder(args.get("title", ""), args.get("when", ""), args.get("description", ""))

        elif tool_name == "list_reminders":
            from tools.reminder import list_reminders
            return list_reminders()

        # ── CRM ──
        elif tool_name == "create_lead":
            from tools.crm import create_lead
            return create_lead(args.get("name", ""), args.get("email", ""), args.get("phone", ""), args.get("company", ""), args.get("notes", ""))

        elif tool_name == "search_client":
            from tools.crm import search_client
            return search_client(args.get("query", ""))

        # ── Memory / Notes ──
        elif tool_name == "save_note":
            from memory.long_term import get_long_term
            ltm = get_long_term()
            nid = ltm.add_note(args.get("content", ""), args.get("title", ""))
            return {"success": True, "action": "save_note", "id": nid, "message": "Note saved to memory"}

        elif tool_name == "search_memory":
            from memory.long_term import get_long_term
            ltm = get_long_term()
            results = ltm.search_conversations(args.get("query", ""))
            return {"success": True, "action": "search_memory", "results": results}

        # ── Navigation ──
        elif tool_name == "navigate_ui":
            page = args.get("page", "dashboard")
            return {"success": True, "action": "navigate", "page": page, "url": f"/{page}"}

        else:
            return {"success": False, "error": f"Unknown tool: {tool_name}"}

    except Exception as e:
        print(f"[ToolRouter] Error executing {tool_name}: {e}")
        return {"success": False, "tool": tool_name, "error": str(e)}


def tool_result_to_text(tool_name: str, result: dict) -> str:
    """Convert tool result dict to natural language for AI to summarize."""
    if not result.get("success"):
        return f"Tool {tool_name} failed: {result.get('error', 'unknown error')}"

    if "message" in result:
        return result["message"]
    if "summary" in result:
        return result["summary"]
    if "info" in result:
        info = result["info"]
        return f"System: CPU {info.get('cpu_percent','?')}%, RAM {info.get('ram_percent','?')}%, Disk {info.get('disk_percent','?')}%"
    if "results" in result:
        count = result.get("count", len(result["results"]))
        return f"Found {count} results for '{result.get('query', '')}'"
    if "reminders" in result:
        r = result["reminders"]
        if not r:
            return "No pending reminders."
        return "Reminders: " + "; ".join(f"{x['title']} ({x['due']})" for x in r[:3])
    if "clients" in result:
        c = result["clients"]
        return f"Found {len(c)} clients" + (f": {', '.join(x['name'] for x in c[:3])}" if c else "")

    return f"Tool {tool_name} executed successfully."
