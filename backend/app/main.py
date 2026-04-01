from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.api.health import router as health_router
from app.api.auth import router as auth_router
from app.api.user import router as user_router
from app.api.astro import router as astro_router
from app.api.telegram import router as telegram_router
from app.api.jobs import router as jobs_router
from app.api.contact import router as contact_router
from app.db import connect_db, disconnect_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to MongoDB
    await connect_db()
    yield
    # Shutdown: Disconnect from MongoDB
    await disconnect_db()


app = FastAPI(title="Vedic Astrology Bot API", version="0.1.0", lifespan=lifespan)

# CORS for local dev + Vercel frontend
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://vedic-astro-phi.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(user_router, prefix="/user", tags=["user"])
app.include_router(astro_router, prefix="/astro", tags=["astro"])
app.include_router(telegram_router, prefix="/telegram", tags=["telegram"])
app.include_router(jobs_router, prefix="/jobs", tags=["jobs"])
app.include_router(contact_router, prefix="/contact", tags=["contact"]) 