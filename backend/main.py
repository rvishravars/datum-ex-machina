"""
Datum Ex Machina — FastAPI Backend
Comics-Based Statistical Analysis Stage
"""

import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from routers import analyze, quiz, auth, discovery
from starlette.middleware.sessions import SessionMiddleware

app = FastAPI(
    title="Datum Ex Machina",
    description="Statistical Narrative Stage",
    # Disable Swagger and ReDoc in production to 'hide' the API layer structure
    docs_url=None if os.getenv("ENV") == "production" else "/docs",
    redoc_url=None if os.getenv("ENV") == "production" else "/redoc",
)

# CORS configuration for cross-container communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Authentication and Session Management
app.add_middleware(
    SessionMiddleware, secret_key=os.getenv("SECRET_KEY", "DATUM-SESSION-SECRET")
)

# API Routes
app.include_router(analyze.router, prefix="/api")
app.include_router(quiz.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(discovery.router, prefix="/api")

# Static Files (Frontend)
# We look for a 'static' folder which will contain the React build
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")

if os.path.exists(STATIC_DIR):
    app.mount(
        "/assets",
        StaticFiles(directory=os.path.join(STATIC_DIR, "assets")),
        name="assets",
    )

    # Serve the main app at the root and any non-api routes (SPA support)
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # If it's an API route, let the router handle it
        if full_path.startswith("api"):
            return None  # This won't actually be called as the router has priority

        index_file = os.path.join(STATIC_DIR, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {"status": "Backend running, but frontend not found in static folder."}
else:

    @app.get("/")
    def root():
        return {
            "status": "Backend Live",
            "message": "Frontend static folder not found. Build the frontend and place it in the 'static' directory.",
        }
