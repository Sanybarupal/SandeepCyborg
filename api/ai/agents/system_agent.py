import subprocess
import os
import platform

class SystemAgent:
    """Agent responsible for controlling the local operating system."""

    def open_application(self, app_name: str) -> str:
        """Opens a local application like VS Code or Chrome."""
        system = platform.system()
        try:
            if system == "Windows":
                # Basic mock/wrapper for Windows
                if "code" in app_name.lower() or "vs" in app_name.lower():
                    subprocess.Popen(["code"], shell=True)
                    return "Opened Visual Studio Code."
                elif "chrome" in app_name.lower() or "browser" in app_name.lower():
                    subprocess.Popen(["start", "chrome"], shell=True)
                    return "Opened Google Chrome."
                else:
                    subprocess.Popen(["start", app_name], shell=True)
                    return f"Attempted to open {app_name}."
            elif system == "Darwin":
                subprocess.Popen(["open", "-a", app_name])
                return f"Opened {app_name} on macOS."
            else:
                return f"Opening apps on {system} is not fully implemented yet."
        except Exception as e:
            return f"Failed to open {app_name}. Error: {str(e)}"

    def execute_terminal_command(self, command: str) -> str:
        """Runs a safe terminal command (mocked for safety)."""
        # In a real environment, you'd want strict validation here.
        return f"Simulated execution of: {command}"

    def get_system_status(self) -> dict:
        """Returns mock CPU/Memory status."""
        return {
            "cpu_usage": "34%",
            "memory_usage": "45%",
            "status": "All systems operational."
        }
