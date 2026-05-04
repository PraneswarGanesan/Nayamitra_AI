from fastapi import APIRouter, UploadFile, File, HTTPException
import os
import shutil
import uuid
from backend.utils.pipeline import create_pipeline
from backend.logger import get_logger
from backend.config import settings
from backend.database.db import save_document, get_document, get_all_approved_documents
import json

router = APIRouter()
logger = get_logger(__name__)

pipeline_app = create_pipeline()

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
        
    doc_id = str(uuid.uuid4())
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)
    
    file_path = os.path.join(upload_dir, f"{doc_id}_{file.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    logger.info(f"Received document upload: {file.filename}, generated ID: {doc_id}")
    
    # Run the pipeline
    initial_state = {"pdf_path": file_path}
    try:
        final_state = pipeline_app.invoke(initial_state)
        action_plan = final_state.get("action_plan")
        
        # Store in local DB via centralized wrapper
        save_document(
            doc_id=doc_id, 
            status="Pending Verification", 
            pdf_path=file_path, 
            action_plan=action_plan.dict() if action_plan else None
        )
        
        logger.info(f"Pipeline completed successfully for document {doc_id}")
        return {"doc_id": doc_id, "message": "Extraction complete, pending verification.", "action_plan": action_plan.dict() if action_plan else None}
    except Exception as e:
        logger.error(f"Pipeline failed for document {doc_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/document/{doc_id}")
async def get_document(doc_id: str):
    doc = get_document(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    if doc["action_plan"]:
        doc["action_plan"] = json.loads(doc["action_plan"])
        
    return doc

@router.post("/verify/{doc_id}")
async def verify_document(doc_id: str, verified_plan: ActionPlan):
    doc = get_document(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    save_document(
        doc_id=doc_id,
        status="Approved",
        pdf_path=doc["pdf_path"],
        action_plan=verified_plan.dict()
    )
    
    logger.info(f"Document {doc_id} verified and approved by human reviewer.")
    # Easy transition point to Supabase in the future
    
    return {"message": "Document verified and saved", "doc_id": doc_id}

@router.get("/actions")
async def get_approved_actions():
    docs = get_all_approved_documents()
    for doc in docs:
        if doc["action_plan"]:
            doc["action_plan"] = json.loads(doc["action_plan"])
    return docs
