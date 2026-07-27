class NavigationAgent:
    """Agent responsible for pushing navigation and UI updates to the frontend."""

    def navigate_to(self, page_name: str) -> str:
        """Navigates the UI to a specific page (e.g., 'dashboard', 'clients', 'whatsapp')."""
        # In a real app, this would push an event via WebSocket or SSE to the frontend.
        # For now, it returns a command string that the backend can parse.
        return f"NAVIGATE_TO:{page_name.lower()}"

    def show_notification(self, message: str, type: str = "info") -> str:
        """Pushes a notification toast to the frontend UI."""
        return f"SHOW_NOTIFICATION:{type}:{message}"
