
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from contextlib import asynccontextmanager

from . import models
from .database import Base, engine, get_db
from .routers import api_router
from .services.key_manager import KeyManager


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize KeyManager
    db = next(get_db())
    try:
        KeyManager.initialize(db)
        print("✓ KeyManager initialized on startup")
    except Exception as e:
        print(f"⚠ Warning: Failed to initialize KeyManager: {e}")
    finally:
        db.close()
    
    yield
    
    # Shutdown (if needed)
    pass


def create_app() -> FastAPI:
    app = FastAPI(
        title="Private Plane CRM & Shared Charter API",
        version="0.1.0",
        lifespan=lifespan
    )
    # CORS configuration - explicitly allow frontend origins
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:5173",
            "http://localhost:5174",  # Vite dev server (alternative port)
            "http://localhost:3000",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:5174",
            "http://127.0.0.1:3000",
        ],
        allow_credentials=True,
        allow_methods=["*"],  # Allow all HTTP methods
        allow_headers=["*"],  # Allow all headers
        expose_headers=["*"],  # Expose all headers
    )
    app.include_router(api_router)
    
    # Mount static files for uploads
    uploads_dir = Path("uploads")
    uploads_dir.mkdir(exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")
    
    return app


Base.metadata.create_all(bind=engine)
app = create_app()

