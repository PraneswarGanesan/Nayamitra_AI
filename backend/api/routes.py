from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
import os
import shutil
import uuid
import json
from utils.pipeline import create_pipeline
from logger import get_logger
from config import settings
from database.db import save_document, get_document, get_all_approved_documents, log_audit
from api.auth import get_current_user, require_role
from core.schemas import ActionPlan, ChatRequest
from utils.llm import get_llm
from langchain_core.messages import HumanMessage, SystemMessage
from database.cache import redis_cache

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
        
        await redis_cache.delete_pattern(f"docs:{current_user['tenant_id']}:*")
        await redis_cache.delete_pattern(f"audit:{current_user['tenant_id']}")
        
        logger.info(f"Pipeline completed successfully for document {doc_id}")
        return {"doc_id": doc_id, "message": "Extraction complete, pending verification.", "action_plan": action_plan.dict() if action_plan else None}
    except Exception as e:
        save_document(doc_id=doc_id, status="Failed", pdf_path=file_path, tenant_id=current_user["tenant_id"], uploaded_by=current_user["id"])
        logger.error(f"Pipeline failed for document {doc_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/documents")
async def list_documents(current_user: dict = Depends(get_current_user)):
    cache_key = f"docs:{current_user['tenant_id']}:{current_user['id']}" if current_user["role"] == "law_officer" else f"docs:{current_user['tenant_id']}:all"
    cached = await redis_cache.get(cache_key)
    if cached:
        return cached

    from database.db import get_db_connection
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if current_user["role"] == "law_officer":
        cursor.execute("SELECT id, status, pdf_path FROM documents WHERE tenant_id = %s AND uploaded_by = %s", (current_user["tenant_id"], current_user["id"]))
    else:
        cursor.execute("SELECT id, status, pdf_path, uploaded_by FROM documents WHERE tenant_id = %s", (current_user["tenant_id"],))
        
    rows = cursor.fetchall()
    conn.close()
    
    result = [dict(r) for r in rows]
    await redis_cache.set(cache_key, result, ex=60)
    return result

@router.get("/document/{doc_id}")
async def get_document_by_id(doc_id: str, current_user: dict = Depends(get_current_user)):
    doc = get_document(doc_id, tenant_id=current_user["tenant_id"])
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found or access denied")
        
    if doc["action_plan"] and isinstance(doc["action_plan"], str):
        doc["action_plan"] = json.loads(doc["action_plan"])
        
    return doc

@router.post("/verify/{doc_id}")
async def verify_document(
    doc_id: str, 
    verified_plan: ActionPlan,
    current_user: dict = Depends(require_role(["reviewer", "admin", "law_officer"]))
):
    doc = get_document(doc_id, tenant_id=current_user["tenant_id"])
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found or access denied")
        
    from database.db import get_db_connection
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE documents SET status = 'Approved' WHERE id = %s
    ''', (doc_id,))
    cursor.execute('''
        UPDATE action_plans SET plan_json = %s WHERE document_id = %s
    ''', (json.dumps(verified_plan.dict()), doc_id))
    conn.commit()
    conn.close()
    
    log_audit(current_user["id"], doc_id, "VERIFY_BULK_APPROVE", {})
    
    await redis_cache.delete_pattern(f"docs:{current_user['tenant_id']}:*")
    await redis_cache.delete(f"dashboard:{current_user['tenant_id']}")
    await redis_cache.delete(f"audit:{current_user['tenant_id']}")
    
    logger.info(f"Document {doc_id} verified and approved by human reviewer.")
    return {"message": "Document verified and saved", "doc_id": doc_id}

@router.post("/reject/{doc_id}")
async def reject_document(
    doc_id: str, 
    current_user: dict = Depends(require_role(["reviewer", "admin", "law_officer"]))
):
    doc = get_document(doc_id, tenant_id=current_user["tenant_id"])
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found or access denied")
        
    from database.db import get_db_connection
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE documents SET status = 'Failed' WHERE id = %s
    ''', (doc_id,))
    conn.commit()
    conn.close()
    
    log_audit(current_user["id"], doc_id, "REJECT_DOCUMENT", {})
    
    await redis_cache.delete_pattern(f"docs:{current_user['tenant_id']}:*")
    await redis_cache.delete(f"dashboard:{current_user['tenant_id']}")
    await redis_cache.delete(f"audit:{current_user['tenant_id']}")
    
    logger.info(f"Document {doc_id} rejected by human reviewer.")
    return {"message": "Document rejected", "doc_id": doc_id}

@router.get("/dashboard/actions")
async def get_dashboard_actions(current_user: dict = Depends(get_current_user)):
    cache_key = f"dashboard:{current_user['tenant_id']}"
    cached = await redis_cache.get(cache_key)
    if cached:
        return cached
        
    docs = get_all_approved_documents(tenant_id=current_user["tenant_id"])
    for doc in docs:
        if doc["action_plan"] and isinstance(doc["action_plan"], str):
            doc["action_plan"] = json.loads(doc["action_plan"])
            
    await redis_cache.set(cache_key, docs, ex=300)
    return docs

@router.get("/audit-log")
async def get_audit_log(current_user: dict = Depends(get_current_user)):
    cache_key = f"audit:{current_user['tenant_id']}"
    cached = await redis_cache.get(cache_key)
    if cached:
        return cached

    from database.db import get_db_connection
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get audit logs for the current tenant's users
    query = '''
        SELECT a.id, a.user_id, a.document_id, a.action, a.details_json, a.timestamp, u.email as user_email
        FROM audit_log a
        JOIN users u ON a.user_id = u.id
        WHERE u.tenant_id = %s
        ORDER BY a.timestamp DESC
        LIMIT 50
    '''
    cursor.execute(query, (current_user["tenant_id"],))
    rows = cursor.fetchall()
    conn.close()
    
    logs = []
    for row in rows:
        log = dict(row)
        if log["details_json"] and isinstance(log["details_json"], str):
            log["details_json"] = json.loads(log["details_json"])
        # Format datetime for JSON serialization
        if "timestamp" in log and log["timestamp"]:
            log["timestamp"] = log["timestamp"].isoformat()
        logs.append(log)
        
    await redis_cache.set(cache_key, logs, ex=60)
    return logs

@router.post("/chat/{doc_id}")
async def chat_with_document(
    doc_id: str, 
    request: ChatRequest,
    current_user: dict = Depends(get_current_user)
):
    doc = get_document(doc_id, tenant_id=current_user["tenant_id"])
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found or access denied")
        
    action_plan_str = doc["action_plan"] or "{}"
    
    system_prompt = f"""You are an AI legal assistant helping a law officer review a document.
Here is the extracted Action Plan JSON for this document:
{action_plan_str}

Answer the user's questions based ONLY on the provided JSON data. If the answer is not in the JSON, politely state that you cannot find that information in the extracted data. Be concise and professional."""

    messages = [SystemMessage(content=system_prompt)]
    for msg in request.history:
        # Simplistic mapping, assuming history is list of dicts like {"role": "user", "content": "..."}
        messages.append(HumanMessage(content=msg["content"]) if msg["role"] == "user" else SystemMessage(content=msg["content"]))
    messages.append(HumanMessage(content=request.message))
    
    try:
        llm = get_llm(temperature=0.2)
        response = llm.invoke(messages)
        
        # Log the chat
        log_audit(current_user["id"], doc_id, "AI_CHAT", {"message": request.message})
        
        return {"reply": response.content}
    except Exception as e:
        logger.error(f"Chat failed for {doc_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to communicate with AI")
