"""
PC Control Tool — Mouse, keyboard, application control, system actions.
Uses PyAutoGUI + psutil + subprocess for Windows.
"""

import os
import sys
import time
import subprocess
import platform
from typing import Optional, Tuple

try:
    import pyautogui
    pyautogui.FAILSAFE = True   # Move mouse to corner to abort
    pyautogui.PAUSE = 0.05
    PYAUTOGUI_OK = True
except ImportError:
    PYAUTOGUI_OK = False

try:
    import psutil
    PSUTIL_OK = True
except ImportError:
    PSUTIL_OK = False

WIN = platform.system() == "Windows"

# ── Application Control ────────────────────────────────────────────────────

APP_ALIASES = {
    "chrome": "chrome",
    "google chrome": "chrome",
    "edge": "msedge",
    "microsoft edge": "msedge",
    "firefox": "firefox",
    "notepad": "notepad",
    "calculator": "calc",
    "file explorer": "explorer",
    "explorer": "explorer",
    "vs code": "code",
    "vscode": "code",
    "excel": "excel",
    "word": "winword",
    "powerpoint": "powerpnt",
    "paint": "mspaint",
    "cmd": "cmd",
    "powershell": "powershell",
    "terminal": "wt",
    "spotify": "spotify",
    "vlc": "vlc",
    "task manager": "taskmgr",
    "control panel": "control",
}

def open_application(app_name: str) -> dict:
    """Open an application by name."""
    name = app_name.lower().strip()
    cmd = APP_ALIASES.get(name, name)
    try:
        if WIN:
            subprocess.Popen(cmd, shell=True)
        else:
            subprocess.Popen([cmd])
        return {"success": True, "action": "open_app", "app": app_name, "message": f"Opening {app_name}"}
    except Exception as e:
        return {"success": False, "action": "open_app", "app": app_name, "error": str(e)}

def close_application(app_name: str) -> dict:
    """Close application by name."""
    if not PSUTIL_OK:
        return {"success": False, "error": "psutil not available"}
    killed = []
    for proc in psutil.process_iter(['pid', 'name']):
        if app_name.lower() in proc.info['name'].lower():
            proc.kill()
            killed.append(proc.info['name'])
    if killed:
        return {"success": True, "action": "close_app", "closed": killed}
    return {"success": False, "action": "close_app", "message": f"{app_name} not found running"}

def list_running_apps() -> list:
    """Get list of running application names."""
    if not PSUTIL_OK:
        return []
    apps = set()
    for proc in psutil.process_iter(['name']):
        try:
            apps.add(proc.info['name'])
        except Exception:
            pass
    return sorted(apps)

# ── Mouse Control ──────────────────────────────────────────────────────────

def move_mouse(x: int, y: int) -> dict:
    if not PYAUTOGUI_OK:
        return {"success": False, "error": "pyautogui not available"}
    pyautogui.moveTo(x, y, duration=0.3)
    return {"success": True, "action": "move_mouse", "x": x, "y": y}

def click(x: int = None, y: int = None, button: str = "left") -> dict:
    if not PYAUTOGUI_OK:
        return {"success": False, "error": "pyautogui not available"}
    if x is not None and y is not None:
        pyautogui.click(x, y, button=button)
    else:
        pyautogui.click(button=button)
    return {"success": True, "action": "click", "x": x, "y": y, "button": button}

def double_click(x: int = None, y: int = None) -> dict:
    if not PYAUTOGUI_OK:
        return {"success": False, "error": "pyautogui not available"}
    if x is not None and y is not None:
        pyautogui.doubleClick(x, y)
    else:
        pyautogui.doubleClick()
    return {"success": True, "action": "double_click"}

def right_click(x: int = None, y: int = None) -> dict:
    if not PYAUTOGUI_OK:
        return {"success": False, "error": "pyautogui not available"}
    if x is not None and y is not None:
        pyautogui.rightClick(x, y)
    else:
        pyautogui.rightClick()
    return {"success": True, "action": "right_click"}

def scroll(direction: str = "down", amount: int = 3) -> dict:
    if not PYAUTOGUI_OK:
        return {"success": False, "error": "pyautogui not available"}
    clicks = -amount if direction == "down" else amount
    pyautogui.scroll(clicks)
    return {"success": True, "action": "scroll", "direction": direction}

# ── Keyboard Control ───────────────────────────────────────────────────────

def type_text(text: str, interval: float = 0.03) -> dict:
    if not PYAUTOGUI_OK:
        return {"success": False, "error": "pyautogui not available"}
    pyautogui.typewrite(text, interval=interval)
    return {"success": True, "action": "type_text", "text": text[:50]}

def press_key(key: str) -> dict:
    if not PYAUTOGUI_OK:
        return {"success": False, "error": "pyautogui not available"}
    pyautogui.press(key)
    return {"success": True, "action": "press_key", "key": key}

def hotkey(*keys: str) -> dict:
    if not PYAUTOGUI_OK:
        return {"success": False, "error": "pyautogui not available"}
    pyautogui.hotkey(*keys)
    return {"success": True, "action": "hotkey", "keys": list(keys)}

SHORTCUTS = {
    "copy": ("ctrl", "c"),
    "paste": ("ctrl", "v"),
    "cut": ("ctrl", "x"),
    "undo": ("ctrl", "z"),
    "redo": ("ctrl", "y"),
    "save": ("ctrl", "s"),
    "select all": ("ctrl", "a"),
    "find": ("ctrl", "f"),
    "new tab": ("ctrl", "t"),
    "close tab": ("ctrl", "w"),
    "new window": ("ctrl", "n"),
    "refresh": ("f5",),
    "screenshot": ("win", "shift", "s"),
    "lock screen": ("win", "l"),
    "show desktop": ("win", "d"),
    "task view": ("win", "tab"),
    "search": ("win",),
    "alt tab": ("alt", "tab"),
    "zoom in": ("ctrl", "+"),
    "zoom out": ("ctrl", "-"),
}

def execute_shortcut(shortcut_name: str) -> dict:
    keys = SHORTCUTS.get(shortcut_name.lower())
    if keys:
        return hotkey(*keys)
    return {"success": False, "error": f"Unknown shortcut: {shortcut_name}"}

# ── System Actions ─────────────────────────────────────────────────────────

def take_screenshot(save_path: str = None) -> dict:
    if not PYAUTOGUI_OK:
        return {"success": False, "error": "pyautogui not available"}
    if not save_path:
        save_path = os.path.join(os.path.expanduser("~"), "Desktop", f"screenshot_{int(time.time())}.png")
    screenshot = pyautogui.screenshot()
    screenshot.save(save_path)
    return {"success": True, "action": "screenshot", "path": save_path}

def set_volume(level: int) -> dict:
    """Set system volume (0-100) on Windows."""
    level = max(0, min(100, level))
    if WIN:
        try:
            from ctypes import cast, POINTER
            from comtypes import CLSCTX_ALL
            from pycaw.pycaw import AudioUtilities, IAudioEndpointVolume
            devices = AudioUtilities.GetSpeakers()
            interface = devices.Activate(IAudioEndpointVolume._iid_, CLSCTX_ALL, None)
            volume = cast(interface, POINTER(IAudioEndpointVolume))
            volume.SetMasterVolumeLevelScalar(level / 100, None)
            return {"success": True, "action": "set_volume", "level": level}
        except Exception:
            # Fallback using nircmd or powershell
            subprocess.run(f'powershell -c "(New-Object -com WScript.Shell).SendKeys([char]174 * 10)"', shell=True, capture_output=True)
            return {"success": True, "action": "set_volume", "level": level, "method": "powershell"}
    return {"success": False, "error": "Unsupported OS"}

def get_system_info() -> dict:
    """Get current system information."""
    info = {"platform": platform.system(), "hostname": platform.node()}
    if PSUTIL_OK:
        info.update({
            "cpu_percent": psutil.cpu_percent(interval=1),
            "ram_percent": psutil.virtual_memory().percent,
            "ram_available_gb": round(psutil.virtual_memory().available / 1e9, 2),
            "disk_percent": psutil.disk_usage('/').percent if not WIN else psutil.disk_usage('C:\\').percent,
            "battery": psutil.sensors_battery()._asdict() if psutil.sensors_battery() else None,
        })
    return info

def lock_screen() -> dict:
    if WIN:
        subprocess.run("rundll32.exe user32.dll,LockWorkStation", shell=True)
        return {"success": True, "action": "lock_screen"}
    return {"success": False, "error": "Not Windows"}

def shutdown(delay: int = 5) -> dict:
    if WIN:
        subprocess.run(f"shutdown /s /t {delay}", shell=True)
        return {"success": True, "action": "shutdown", "delay": delay}
    return {"success": False, "error": "Not Windows"}

def restart(delay: int = 5) -> dict:
    if WIN:
        subprocess.run(f"shutdown /r /t {delay}", shell=True)
        return {"success": True, "action": "restart", "delay": delay}
    return {"success": False, "error": "Not Windows"}

def open_folder(path: str) -> dict:
    path = os.path.expanduser(path)
    if WIN:
        os.startfile(path)
    else:
        subprocess.Popen(["xdg-open", path])
    return {"success": True, "action": "open_folder", "path": path}

def get_screen_size() -> Tuple[int, int]:
    if PYAUTOGUI_OK:
        return pyautogui.size()
    return (1920, 1080)
