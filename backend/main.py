from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from api.routes import router as api_router
from api.auth import router as auth_router
from api.feedback import router as feedback_router
import os
from dotenv import load_dotenv
from config import settings

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

# Mount the uploads directory so PDFs can be served to the frontend
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(api_router, prefix="/api", tags=["documents"])
app.include_router(feedback_router, prefix="/api/router", tags=["feedback"])

@app.get("/")
def root():
    return {"message": "Welcome to NyayaMitra API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
