"""
Web Search Tool — DuckDuckGo search with result summarization.
No API key required for basic search.
"""

import time
from typing import List, Optional

def search_web(query: str, max_results: int = 5) -> dict:
    """
    Search the web using DuckDuckGo (no API key needed).
    Returns titles, URLs, and snippets.
    """
    try:
        from duckduckgo_search import DDGS

        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=max_results))

        formatted = []
        for r in results:
            formatted.append({
                "title": r.get("title", ""),
                "url": r.get("href", ""),
                "snippet": r.get("body", ""),
            })

        return {
            "success": True,
            "action": "web_search",
            "query": query,
            "results": formatted,
            "count": len(formatted),
        }

    except Exception as e:
        return {"success": False, "action": "web_search", "query": query, "error": str(e)}


def search_news(query: str, max_results: int = 5) -> dict:
    """Search for recent news articles."""
    try:
        from duckduckgo_search import DDGS
        with DDGS() as ddgs:
            results = list(ddgs.news(query, max_results=max_results))
        formatted = [{"title": r.get("title"), "url": r.get("url"), "date": r.get("date"), "body": r.get("body")} for r in results]
        return {"success": True, "action": "news_search", "query": query, "results": formatted}
    except Exception as e:
        return {"success": False, "error": str(e)}


def get_weather(city: str) -> dict:
    """Get current weather for a city (via wttr.in JSON API)."""
    try:
        import urllib.request
        import json
        url = f"https://wttr.in/{city.replace(' ', '+')}?format=j1"
        with urllib.request.urlopen(url, timeout=10) as response:
            data = json.loads(response.read().decode())
        current = data['current_condition'][0]
        return {
            "success": True,
            "city": city,
            "temp_c": current.get("temp_C"),
            "feels_like_c": current.get("FeelsLikeC"),
            "condition": current.get("weatherDesc", [{}])[0].get("value", ""),
            "humidity": current.get("humidity"),
            "wind_kmph": current.get("windspeedKmph"),
        }
    except Exception as e:
        return {"success": False, "city": city, "error": str(e)}


def summarize_results(results: List[dict]) -> str:
    """Convert search results to a readable text summary."""
    if not results:
        return "No results found."
    lines = []
    for i, r in enumerate(results, 1):
        title = r.get("title", "")
        snippet = r.get("snippet") or r.get("body", "")
        url = r.get("url") or r.get("href", "")
        lines.append(f"{i}. {title}")
        if snippet:
            lines.append(f"   {snippet[:200]}")
        if url:
            lines.append(f"   {url}")
    return "\n".join(lines)
