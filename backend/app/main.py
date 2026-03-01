from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth_routes import router as auth_router
from app.api.routes import router as activity_router
from app.api.v1.auth import router as v1_auth_router
from app.api.v1.heartbeat import router as v1_heartbeat_router
from app.api.v1.sessions import router as v1_sessions_router
from app.core import create_database_tables


app = FastAPI(title="AI Productivity Engine")
origins = [
    "http://localhost:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup() -> None:
    create_database_tables()


app.include_router(auth_router)
app.include_router(activity_router)

# API v1 (async, UUID models)
app.include_router(v1_auth_router, prefix="/api/v1")
app.include_router(v1_sessions_router, prefix="/api/v1")
app.include_router(v1_heartbeat_router, prefix="/api/v1")

@app.get("/")
def health_check():
    return {"status": "running", "service": "ai-productivity-engine"}
