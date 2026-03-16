# ============================================================
#  Smart Food Mess Feedback System — Backend Entry Point
#  Run with: uvicorn main:app --reload
# ============================================================

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from core.database import connect_db, close_db
from routes import feedback, auth, mess_config, dashboard, ai_insights, qr_code


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Connect to MongoDB when app starts, close when app stops."""
    await connect_db()
    yield
    await close_db()


app = FastAPI(
    title="Smart Mess Feedback API",
    description="QR-based mess feedback system for educational institutions",
    version="1.0.0",
    lifespan=lifespan,
)

# Allow React frontend (port 5173) to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all route modules
app.include_router(feedback.router,    prefix="/api/feedback",   tags=["Feedback"])
app.include_router(auth.router,        prefix="/api/auth",        tags=["Auth"])
app.include_router(mess_config.router, prefix="/api/mess",        tags=["Mess Config"])
app.include_router(dashboard.router,   prefix="/api/dashboard",   tags=["Dashboard"])
app.include_router(ai_insights.router, prefix="/api/insights",    tags=["AI Insights"])
app.include_router(qr_code.router,     prefix="/api/qr",          tags=["QR Code"])


@app.get("/")
async def root():
    return {"message": "Smart Mess Feedback API is running ✅"}
