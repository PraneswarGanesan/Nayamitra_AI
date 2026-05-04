from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
import os
import shutil
import uuid
import json
from backend.utils.pipeline import create_pipeline
from backend.logger import get_logger
from backend.config import settings
from backend.database.db import save_document, get_document, get_all_approved_documents, log_audit
from backend.api.auth import get_current_user, require_role
from backend.core.schemas import ActionPlan

router = APIRouter()
logger = get_logger(__name__)
pipeline_app = create_pipeline()

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    current_user: dict = Depends(require_role(["law_officer", "admin"]))
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
        
    doc_id = str(uuid.uuid4())
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)
    
    file_path = os.path.join(upload_dir, f"{doc_id}_{file.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    logger.info(f"Received document upload: {file.filename}, generated ID: {doc_id} by user {current_user['id']}")
    
    # Store initial record
    save_document(
        doc_id=doc_id, 
        status="Processing", 
        pdf_path=file_path, 
        tenant_id=current_user["tenant_id"],
        uploaded_by=current_user["id"]
    )
    
    # Run the pipeline
    initial_state = {"pdf_path": file_path}
    try:
        final_state = pipeline_app.invoke(initial_state)
        action_plan = final_state.get("action_plan")
        
        save_document(
            doc_id=doc_id, 
            status="Pending Verification", 
            pdf_path=file_path, 
            action_plan=action_plan.dict() if action_plan else None,
            tenant_id=current_user["tenant_id"],
            uploaded_by=current_user["id"]
        )
        
        log_audit(current_user["id"], doc_id, "UPLOAD", {"filename": file.filename})
        
        logger.info(f"Pipeline completed successfully for document {doc_id}")
        return {"doc_id": doc_id, "message": "Extraction complete, pending verification.", "action_plan": action_plan.dict() if action_plan else None}
    except Exception as e:
        save_document(doc_id=doc_id, status="Failed", pdf_path=file_path, tenant_id=current_user["tenant_id"], uploaded_by=current_user["id"])
        logger.error(f"Pipeline failed for document {doc_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/documents")
async def list_documents(current_user: dict = Depends(get_current_user)):
    from backend.database.db import get_db_connection
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if current_user["role"] == "law_officer":
        cursor.execute("SELECT id, status, pdf_path FROM documents WHERE tenant_id = ? AND uploaded_by = ?", (current_user["tenant_id"], current_user["id"]))
    else:
        cursor.execute("SELECT id, status, pdf_path, uploaded_by FROM documents WHERE tenant_id = ?", (current_user["tenant_id"],))
        
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

@router.get("/document/{doc_id}")
async def get_document_by_id(doc_id: str, current_user: dict = Depends(get_current_user)):
    doc = get_document(doc_id, tenant_id=current_user["tenant_id"])
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found or access denied")
        
    if doc["action_plan"]:
        doc["action_plan"] = json.loads(doc["action_plan"])
        
    return doc

@router.post("/verify/{doc_id}")
async def verify_document(
    doc_id: str, 
    verified_plan: ActionPlan,
    current_user: dict = Depends(require_role(["reviewer", "admin"]))
):
    doc = get_document(doc_id, tenant_id=current_user["tenant_id"])
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found or access denied")
        
    from backend.database.db import get_db_connection
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE documents SET status = "Approved" WHERE id = ?
    ''', (doc_id,))
    cursor.execute('''
        UPDATE action_plans SET plan_json = ? WHERE document_id = ?
    ''', (json.dumps(verified_plan.dict()), doc_id))
    conn.commit()
    conn.close()
    
    log_audit(current_user["id"], doc_id, "VERIFY_BULK_APPROVE", {})
    logger.info(f"Document {doc_id} verified and approved by human reviewer.")
    return {"message": "Document verified and saved", "doc_id": doc_id}

@router.get("/dashboard/actions")
async def get_dashboard_actions(current_user: dict = Depends(get_current_user)):
    docs = get_all_approved_documents(tenant_id=current_user["tenant_id"])
    for doc in docs:
        if doc["action_plan"]:
            doc["action_plan"] = json.loads(doc["action_plan"])
    return docs
