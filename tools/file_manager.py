"""
File Manager Tool — Open, create, search, move, copy, delete files and folders.
"""

import os
import shutil
import glob
import time
import platform
import subprocess
from pathlib import Path
from typing import List, Optional

WIN = platform.system() == "Windows"

# Common folder shortcuts
KNOWN_FOLDERS = {
    "desktop": os.path.join(os.path.expanduser("~"), "Desktop"),
    "downloads": os.path.join(os.path.expanduser("~"), "Downloads"),
    "documents": os.path.join(os.path.expanduser("~"), "Documents"),
    "pictures": os.path.join(os.path.expanduser("~"), "Pictures"),
    "music": os.path.join(os.path.expanduser("~"), "Music"),
    "videos": os.path.join(os.path.expanduser("~"), "Videos"),
    "home": os.path.expanduser("~"),
    "temp": os.environ.get("TEMP", "/tmp"),
}

def _resolve(path: str) -> str:
    """Resolve path with known folder shortcuts and user expansion."""
    lower = path.lower().strip()
    for name, folder in KNOWN_FOLDERS.items():
        if lower == name:
            return folder
    return os.path.expanduser(path)

def open_folder(path: str) -> dict:
    """Open a folder in File Explorer."""
    path = _resolve(path)
    if not os.path.exists(path):
        return {"success": False, "error": f"Path does not exist: {path}"}
    try:
        if WIN:
            os.startfile(path)
        else:
            subprocess.Popen(["xdg-open", path])
        return {"success": True, "action": "open_folder", "path": path}
    except Exception as e:
        return {"success": False, "error": str(e)}

def open_file(path: str) -> dict:
    """Open a file with its default application."""
    path = _resolve(path)
    if not os.path.exists(path):
        return {"success": False, "error": f"File not found: {path}"}
    try:
        if WIN:
            os.startfile(path)
        else:
            subprocess.Popen(["xdg-open", path])
        return {"success": True, "action": "open_file", "path": path}
    except Exception as e:
        return {"success": False, "error": str(e)}

def list_folder(path: str, show_hidden: bool = False) -> dict:
    """List contents of a folder."""
    path = _resolve(path)
    if not os.path.exists(path):
        return {"success": False, "error": f"Path does not exist: {path}"}
    try:
        items = []
        for entry in os.scandir(path):
            if not show_hidden and entry.name.startswith('.'):
                continue
            items.append({
                "name": entry.name,
                "type": "folder" if entry.is_dir() else "file",
                "size_kb": round(entry.stat().st_size / 1024, 1) if entry.is_file() else None,
                "modified": time.strftime('%Y-%m-%d %H:%M', time.localtime(entry.stat().st_mtime)),
            })
        items.sort(key=lambda x: (x["type"] == "file", x["name"].lower()))
        return {"success": True, "action": "list_folder", "path": path, "items": items, "count": len(items)}
    except Exception as e:
        return {"success": False, "error": str(e)}

def search_files(query: str, search_path: str = "~", extensions: List[str] = None) -> dict:
    """Search for files matching a name pattern."""
    search_path = _resolve(search_path)
    pattern = f"**/*{query}*"
    if extensions:
        results = []
        for ext in extensions:
            results.extend(glob.glob(os.path.join(search_path, f"**/*{query}*.{ext}"), recursive=True))
    else:
        results = glob.glob(os.path.join(search_path, pattern), recursive=True)

    files = [{"path": r, "name": os.path.basename(r)} for r in results[:20]]
    return {"success": True, "action": "search_files", "query": query, "results": files, "count": len(files)}

def create_folder(path: str) -> dict:
    """Create a new folder."""
    path = _resolve(path)
    try:
        os.makedirs(path, exist_ok=True)
        return {"success": True, "action": "create_folder", "path": path}
    except Exception as e:
        return {"success": False, "error": str(e)}

def create_file(path: str, content: str = "") -> dict:
    """Create a new text file."""
    path = _resolve(path)
    try:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        return {"success": True, "action": "create_file", "path": path}
    except Exception as e:
        return {"success": False, "error": str(e)}

def read_file(path: str, max_chars: int = 5000) -> dict:
    """Read content of a text file."""
    path = _resolve(path)
    if not os.path.exists(path):
        return {"success": False, "error": f"File not found: {path}"}
    try:
        with open(path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read(max_chars)
        return {"success": True, "action": "read_file", "path": path, "content": content, "truncated": len(content) == max_chars}
    except Exception as e:
        return {"success": False, "error": str(e)}

def delete_file(path: str, trash: bool = True) -> dict:
    """Delete a file (moves to recycle bin if trash=True)."""
    path = _resolve(path)
    if not os.path.exists(path):
        return {"success": False, "error": f"File not found: {path}"}
    try:
        if trash and WIN:
            import winshell
            winshell.delete_file(path, no_confirm=True)
        else:
            if os.path.isdir(path):
                shutil.rmtree(path)
            else:
                os.remove(path)
        return {"success": True, "action": "delete", "path": path}
    except Exception as e:
        # Fallback: direct delete
        try:
            os.remove(path)
            return {"success": True, "action": "delete", "path": path}
        except Exception as e2:
            return {"success": False, "error": str(e2)}

def copy_file(src: str, dst: str) -> dict:
    """Copy a file or folder."""
    src, dst = _resolve(src), _resolve(dst)
    try:
        if os.path.isdir(src):
            shutil.copytree(src, dst)
        else:
            shutil.copy2(src, dst)
        return {"success": True, "action": "copy", "src": src, "dst": dst}
    except Exception as e:
        return {"success": False, "error": str(e)}

def move_file(src: str, dst: str) -> dict:
    """Move a file or folder."""
    src, dst = _resolve(src), _resolve(dst)
    try:
        shutil.move(src, dst)
        return {"success": True, "action": "move", "src": src, "dst": dst}
    except Exception as e:
        return {"success": False, "error": str(e)}

def rename_file(path: str, new_name: str) -> dict:
    """Rename a file or folder."""
    path = _resolve(path)
    new_path = os.path.join(os.path.dirname(path), new_name)
    try:
        os.rename(path, new_path)
        return {"success": True, "action": "rename", "old": path, "new": new_path}
    except Exception as e:
        return {"success": False, "error": str(e)}

def get_file_info(path: str) -> dict:
    """Get detailed info about a file."""
    path = _resolve(path)
    if not os.path.exists(path):
        return {"success": False, "error": f"Not found: {path}"}
    stat = os.stat(path)
    return {
        "success": True,
        "path": path,
        "name": os.path.basename(path),
        "size_kb": round(stat.st_size / 1024, 2),
        "is_dir": os.path.isdir(path),
        "created": time.strftime('%Y-%m-%d %H:%M', time.localtime(stat.st_ctime)),
        "modified": time.strftime('%Y-%m-%d %H:%M', time.localtime(stat.st_mtime)),
        "extension": Path(path).suffix,
    }
