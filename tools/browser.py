"""
Browser Automation Tool using Playwright.
Supports: Chrome, Edge, Firefox
Actions: Open URL, search, YouTube, fill forms, download, login.
"""

import asyncio
import time
from typing import Optional

_browser = None
_page = None
_playwright = None

async def _get_page():
    global _browser, _page, _playwright
    if _page and not _page.is_closed():
        return _page
    try:
        from playwright.async_api import async_playwright
        if _playwright is None:
            _playwright = await async_playwright().start()
        if _browser is None or not _browser.is_connected():
            _browser = await _playwright.chromium.launch(
                headless=False,
                channel="chrome",  # Uses installed Chrome
            )
        context = await _browser.new_context(
            viewport={"width": 1280, "height": 720},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        )
        _page = await context.new_page()
        return _page
    except Exception as e:
        print(f"[Browser] Failed to start: {e}")
        return None

def _run(coro):
    """Run async coroutine from sync context."""
    try:
        loop = asyncio.get_event_loop()
        if loop.is_closed():
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
        if loop.is_running():
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as pool:
                future = pool.submit(asyncio.run, coro)
                return future.result(timeout=30)
        else:
            return loop.run_until_complete(coro)
    except Exception as e:
        return {"success": False, "error": str(e)}

# ── Browser Actions ────────────────────────────────────────────────────────

async def _open_url(url: str) -> dict:
    if not url.startswith("http"):
        url = "https://" + url
    page = await _get_page()
    if not page:
        return {"success": False, "error": "Browser failed to start"}
    await page.goto(url, wait_until="domcontentloaded", timeout=20000)
    title = await page.title()
    return {"success": True, "action": "open_url", "url": url, "title": title}

async def _search_google(query: str) -> dict:
    url = f"https://www.google.com/search?q={query.replace(' ', '+')}"
    page = await _get_page()
    if not page:
        return {"success": False, "error": "Browser failed to start"}
    await page.goto(url, wait_until="domcontentloaded", timeout=20000)
    # Extract first few results
    results = []
    try:
        items = await page.query_selector_all("h3")
        for item in items[:5]:
            text = await item.inner_text()
            if text.strip():
                results.append(text.strip())
    except Exception:
        pass
    return {"success": True, "action": "google_search", "query": query, "top_results": results}

async def _open_youtube_search(query: str) -> dict:
    url = f"https://www.youtube.com/results?search_query={query.replace(' ', '+')}"
    page = await _get_page()
    if not page:
        return {"success": False, "error": "Browser failed to start"}
    await page.goto(url, wait_until="domcontentloaded", timeout=20000)
    # Click first video
    try:
        await page.wait_for_selector("ytd-video-renderer", timeout=5000)
        video = await page.query_selector("ytd-video-renderer a#video-title")
        if video:
            await video.click()
            await asyncio.sleep(2)
            title = await page.title()
            return {"success": True, "action": "youtube_play", "query": query, "title": title}
    except Exception:
        pass
    return {"success": True, "action": "youtube_search", "query": query, "url": url}

async def _fill_form(selector: str, value: str) -> dict:
    page = await _get_page()
    if not page:
        return {"success": False, "error": "No active browser"}
    await page.fill(selector, value)
    return {"success": True, "action": "fill_form", "selector": selector}

async def _click_element(selector: str) -> dict:
    page = await _get_page()
    if not page:
        return {"success": False, "error": "No active browser"}
    await page.click(selector)
    return {"success": True, "action": "click_element", "selector": selector}

async def _get_page_content() -> dict:
    page = await _get_page()
    if not page:
        return {"success": False, "error": "No active browser"}
    title = await page.title()
    url = page.url
    text = await page.inner_text("body")
    return {"success": True, "title": title, "url": url, "text": text[:2000]}

async def _close_browser() -> dict:
    global _browser, _page, _playwright
    try:
        if _browser:
            await _browser.close()
            _browser = None
            _page = None
        if _playwright:
            await _playwright.stop()
            _playwright = None
        return {"success": True, "action": "close_browser"}
    except Exception as e:
        return {"success": False, "error": str(e)}

# ── Public Sync API ─────────────────────────────────────────────────────────

def open_url(url: str) -> dict:
    return asyncio.run(_open_url(url))

def search_google(query: str) -> dict:
    return asyncio.run(_search_google(query))

def open_youtube(query: str) -> dict:
    return asyncio.run(_open_youtube_search(query))

def play_youtube(song_or_query: str) -> dict:
    """Alias for playing music/videos on YouTube."""
    return open_youtube(song_or_query)

def fill_form(selector: str, value: str) -> dict:
    return asyncio.run(_fill_form(selector, value))

def click_element(selector: str) -> dict:
    return asyncio.run(_click_element(selector))

def get_page_content() -> dict:
    return asyncio.run(_get_page_content())

def close_browser() -> dict:
    return asyncio.run(_close_browser())

def navigate_back() -> dict:
    async def _back():
        page = await _get_page()
        if page:
            await page.go_back()
            return {"success": True, "action": "go_back"}
        return {"success": False}
    return asyncio.run(_back())

def scroll_page(direction: str = "down") -> dict:
    async def _scroll():
        page = await _get_page()
        if page:
            delta = 500 if direction == "down" else -500
            await page.mouse.wheel(0, delta)
            return {"success": True, "action": "scroll", "direction": direction}
        return {"success": False}
    return asyncio.run(_scroll())
