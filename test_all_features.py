import sys, os, io, traceback, sqlite3

# Force UTF-8 output on Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

PASS = "[PASS]"
FAIL = "[FAIL]"

results = []

def test(name, fn):
    try:
        result = fn()
        detail = str(result) if result is not None else "OK"
        results.append((name, PASS, detail))
        print(f"{PASS}  {name}")
        print(f"       => {detail}")
    except Exception as e:
        results.append((name, FAIL, str(e)))
        print(f"{FAIL}  {name}")
        print(f"       => ERROR: {e}")

print("=" * 60)
print("   SANJEEV AI - FULL FEATURE TEST SUITE")
print("=" * 60)

# ────────────────────────────────────────
# [1] DATABASE MODULE
# ────────────────────────────────────────
print("\n--- [1] DATABASE MODULE ---")

def test_db_init():
    from database.engine import init_db, DB_PATH
    init_db()
    assert os.path.exists(DB_PATH), f"DB file not found at {DB_PATH}"
    return f"DB file exists at: {DB_PATH}"

def test_db_tables():
    from database.engine import DB_PATH
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = [row[0] for row in c.fetchall()]
    conn.close()
    assert 'users' in tables, "users table MISSING"
    assert 'conversations' in tables, "conversations table MISSING"
    return f"Tables found: {tables}"

test("DB Initialization", test_db_init)
test("DB Tables (users, conversations)", test_db_tables)

# ────────────────────────────────────────
# [2] MEMORY MODULE
# ────────────────────────────────────────
print("\n--- [2] MEMORY MODULE ---")

def test_memory_add():
    from memory.engine import MemoryEngine
    mem = MemoryEngine(user_id=1)
    mem.add_message(role='user', content='Hello Sanjeev, test message!')
    mem.add_message(role='ai', content='Hello! I am Sanjeev AI, test reply.')
    return "2 messages added (user + ai)"

def test_memory_retrieve():
    from memory.engine import MemoryEngine
    mem = MemoryEngine(user_id=1)
    history = list(mem.get_recent_history(limit=5))
    assert len(history) > 0, "No history found in DB!"
    sample = [f"[{r}]: {c[:30]}..." for r, c in history]
    return f"Retrieved {len(history)} records -> {sample}"

test("Memory: add_message (user + ai)", test_memory_add)
test("Memory: get_recent_history (limit=5)", test_memory_retrieve)

# ────────────────────────────────────────
# [3] VOICE MODULE (STT + TTS)
# ────────────────────────────────────────
print("\n--- [3] VOICE MODULE (STT + TTS) ---")

def test_stt():
    from voice.stt import transcribe_audio
    result = transcribe_audio("fake_audio.wav")
    assert isinstance(result, str) and len(result) > 0, "STT returned empty/None"
    return f"STT output: '{result}'"

def test_tts():
    from voice.tts import synthesize_speech
    result = synthesize_speech("Hello, I am Sanjeev AI.")
    assert isinstance(result, str) and len(result) > 0, "TTS returned empty/None"
    return f"TTS output path: '{result}'"

test("STT: transcribe_audio (mock)", test_stt)
test("TTS: synthesize_speech (mock)", test_tts)

# ────────────────────────────────────────
# [4] CORE ENGINE
# ────────────────────────────────────────
print("\n--- [4] CORE ENGINE ---")

def test_core_text():
    from core.engine import CoreEngine
    engine = CoreEngine()
    response = engine.process_text_input("Hello Sanjeev, how are you?")
    assert isinstance(response, str) and len(response) > 0
    return f"Response: '{response}'"

def test_core_audio():
    from core.engine import CoreEngine
    engine = CoreEngine()
    response = engine.process_audio_input("mock_audio.wav")
    assert isinstance(response, str) and len(response) > 0
    return f"Audio->Text->Response: '{response}'"

test("Core: process_text_input", test_core_text)
test("Core: process_audio_input (via STT mock)", test_core_audio)

# ────────────────────────────────────────
# [5] END-TO-END DB PERSISTENCE
# ────────────────────────────────────────
print("\n--- [5] END-TO-END PERSISTENCE ---")

def test_db_persist():
    from database.engine import DB_PATH
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM conversations WHERE user_id=1")
    count = c.fetchone()[0]
    conn.close()
    assert count > 0, "No conversations in DB!"
    return f"{count} total conversation records stored"

def test_db_last_records():
    from database.engine import DB_PATH
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT role, content, timestamp FROM conversations ORDER BY id DESC LIMIT 4")
    rows = c.fetchall()
    conn.close()
    out = ""
    for r in rows:
        out += f"\n       [{r[0]}] '{r[1][:40]}' @ {r[2]}"
    return out

test("E2E: Conversations saved in SQLite DB", test_db_persist)
test("E2E: Last 4 DB records", test_db_last_records)

# ────────────────────────────────────────
# SUMMARY
# ────────────────────────────────────────
print("\n" + "=" * 60)
print("   SUMMARY")
print("=" * 60)
passed = sum(1 for _, s, _ in results if s == PASS)
failed = sum(1 for _, s, _ in results if s == FAIL)
print(f"\n  Total  : {len(results)}")
print(f"  Passed : {passed}")
print(f"  Failed : {failed}")
if failed == 0:
    print("\n  STATUS: ALL TESTS PASSED! App is working correctly.")
else:
    print(f"\n  STATUS: {failed} TESTS FAILED. Check errors above.")
print("=" * 60)
