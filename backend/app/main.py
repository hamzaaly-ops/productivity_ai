from fastapi import FastAPI
from app.routes import activity

app = FastAPI(title="AI Productivity Engine")

app.include_router(activity.router)

@app.get("/")
def health_check():
    return {"status": "running"}