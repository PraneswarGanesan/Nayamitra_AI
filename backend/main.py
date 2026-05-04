from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api.routes import router as api_router
from backend.api.auth import router as auth_router
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="NyayaMitra API", description="AI co-pilot for CCMS")

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(api_router, prefix="/api", tags=["documents"])

@app.get("/")
def root():
    return {"message": "Welcome to NyayaMitra API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
