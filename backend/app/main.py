from fastapi import FastAPI
from app.auth_routes import router as auth_router
from app.core import create_database_tables
from app.routes import router as activity_router

app = FastAPI(title="AI Productivity Engine")


@app.on_event("startup")
def startup() -> None:
    create_database_tables()


app.include_router(auth_router)
app.include_router(activity_router)

@app.get("/")
def health_check():
    return {"status": "running", "service": "ai-productivity-engine"}
