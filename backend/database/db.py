import psycopg2
from psycopg2.extras import RealDictCursor
import json
import uuid
from config import settings

def get_db_connection():
    conn = psycopg2.connect(settings.SUPABASE_URI, cursor_factory=RealDictCursor)
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Tenants
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tenants (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL
        )
    ''')
    
    # Users
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            hashed_password TEXT NOT NULL,
            role TEXT NOT NULL,
            tenant_id TEXT,
            FOREIGN KEY(tenant_id) REFERENCES tenants(id)
        )
    ''')
    
    # Documents
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS documents (
            id TEXT PRIMARY KEY,
            tenant_id TEXT,
            uploaded_by TEXT,
            status TEXT NOT NULL,
            pdf_path TEXT,
            FOREIGN KEY(tenant_id) REFERENCES tenants(id),
            FOREIGN KEY(uploaded_by) REFERENCES users(id)
        )
    ''')
    
    # Action Plans (JSON payload)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS action_plans (
            id TEXT PRIMARY KEY,
            document_id TEXT UNIQUE NOT NULL,
            plan_json JSONB,
            FOREIGN KEY(document_id) REFERENCES documents(id)
        )
    ''')
    
    # Verifications (Field-level tracking)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS verifications (
            id TEXT PRIMARY KEY,
            document_id TEXT NOT NULL,
            field_path TEXT NOT NULL,
            action TEXT NOT NULL,
            original_value TEXT,
            edited_value TEXT,
            verified_by TEXT,
            verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(document_id) REFERENCES documents(id),
            FOREIGN KEY(verified_by) REFERENCES users(id)
        )
    ''')
    
    # Audit Log
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS audit_log (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            document_id TEXT,
            action TEXT NOT NULL,
            details_json JSONB,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id),
            FOREIGN KEY(document_id) REFERENCES documents(id)
        )
    ''')
    
    conn.commit()
    conn.close()

def save_document(doc_id: str, status: str, pdf_path: str, action_plan: dict = None, tenant_id: str = "default_tenant", uploaded_by: str = None):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Ensure default tenant exists for testing if not present
    cursor.execute('INSERT INTO tenants (id, name) VALUES (%s, %s) ON CONFLICT (id) DO NOTHING', ("default_tenant", "Default Department"))
    
    cursor.execute('''
        INSERT INTO documents (id, tenant_id, uploaded_by, status, pdf_path)
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT (id) DO UPDATE SET status=EXCLUDED.status
    ''', (doc_id, tenant_id, uploaded_by, status, pdf_path))
    
    if action_plan:
        plan_id = str(uuid.uuid4())
        cursor.execute('''
            INSERT INTO action_plans (id, document_id, plan_json)
            VALUES (%s, %s, %s)
            ON CONFLICT (document_id) DO UPDATE SET plan_json=EXCLUDED.plan_json
        ''', (plan_id, doc_id, json.dumps(action_plan)))
        
    conn.commit()
    conn.close()

def get_document(doc_id: str, tenant_id: str = None):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    query = '''
        SELECT d.id, d.status, d.pdf_path, d.tenant_id, a.plan_json as action_plan
        FROM documents d
        LEFT JOIN action_plans a ON d.id = a.document_id
        WHERE d.id = %s
    '''
    params = [doc_id]
    
    if tenant_id:
        query += ' AND d.tenant_id = %s'
        params.append(tenant_id)
        
    cursor.execute(query, params)
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return dict(row)
    return None

def get_all_approved_documents(tenant_id: str = None):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    query = '''
        SELECT d.id, d.status, d.pdf_path, d.tenant_id, a.plan_json as action_plan
        FROM documents d
        LEFT JOIN action_plans a ON d.id = a.document_id
        WHERE d.status = 'Approved'
    '''
    params = []
    
    if tenant_id:
        query += ' AND d.tenant_id = %s'
        params.append(tenant_id)
        
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def log_audit(user_id: str, document_id: str, action: str, details: dict):
    conn = get_db_connection()
    cursor = conn.cursor()
    audit_id = str(uuid.uuid4())
    cursor.execute('''
        INSERT INTO audit_log (id, user_id, document_id, action, details_json)
        VALUES (%s, %s, %s, %s, %s)
    ''', (audit_id, user_id, document_id, action, json.dumps(details)))
    conn.commit()
    conn.close()

# Initialize DB tables on import
try:
    init_db()
except Exception as e:
    print(f"Failed to initialize database: {e}")
