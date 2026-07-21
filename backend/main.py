"""
Sandeep Clone — FastAPI Backend Main Entry Point
Run: uvicorn main:app --reload --port 8000
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import APP_NAME, VERSION, FRONTEND_URL, AI_MOCK_MODE
from database import init_db

# Import all route modules
from routes.dashboard import router as dashboard_router
from routes.clients import router as clients_router
from routes.chat import router as chat_router
from routes.approvals import router as approvals_router
from routes.uploads import router as uploads_router
from routes.notifications import router as notifications_router
from routes.whatsapp import router as whatsapp_router

# ─── App Init ──────────────────────────────────────
app = FastAPI(
    title=APP_NAME,
    version=VERSION,
    description="Sandeep Clone — Personal AI Operating System API",
)

# ─── CORS (allow frontend) ─────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Register Routers ──────────────────────────────
app.include_router(dashboard_router, prefix="/api")
app.include_router(clients_router,   prefix="/api")
app.include_router(chat_router,      prefix="/api")
app.include_router(approvals_router, prefix="/api")
app.include_router(uploads_router,   prefix="/api")
app.include_router(notifications_router, prefix="/api")
app.include_router(whatsapp_router,    prefix="/api")


# ─── Startup ───────────────────────────────────────
@app.on_event("startup")
async def startup():
    init_db()
    mode = "MOCK (No OpenAI Key)" if AI_MOCK_MODE else "GPT-4 Live"
    print(f"\n{'='*50}")
    print(f"  {APP_NAME} v{VERSION}")
    print(f"  AI Mode: {mode}")
    print(f"  Docs: http://localhost:8000/docs")
    print(f"{'='*50}\n")


# ─── Health Check ──────────────────────────────────
@app.get("/")
def root():
    return {
        "app": APP_NAME,
        "version": VERSION,
        "status": "running",
        "ai_mode": "mock" if AI_MOCK_MODE else "gpt4",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {"status": "ok", "message": "Sandeep Clone Backend chal raha hai!"}
