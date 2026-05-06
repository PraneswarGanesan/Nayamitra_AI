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

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
import time
from database.cache import redis_cache

app = FastAPI(title="NyayaMitra API", description="AI co-pilot for CCMS")

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    client_ip = request.client.host if request.client else "unknown"
    current_minute = int(time.time() // 60)
    key = f"ratelimit:{client_ip}:{current_minute}"
    
    count = await redis_cache.incr(key)
    if count and int(count) > 100:
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={"detail": "Rate limit exceeded (100 req/min). Please try again later."}
        )
        
    return await call_next(request)

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
