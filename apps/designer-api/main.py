from fastapi import FastAPI
from routers.designer_router import router as designer_router

app = FastAPI(title="Designer API", version="0.1.0")

app.include_router(designer_router, prefix="/designers", tags=["designers"])


@app.get("/health")
def health_check():
    return {"status": "ok"}
