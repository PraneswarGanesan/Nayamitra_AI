import sqlite3
import json
from pathlib import Path
from backend.config import settings

def get_db_connection():
    # settings.DB_PATH ensures it uses the central config
    conn = sqlite3.connect(settings.DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create documents table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS documents (
            id TEXT PRIMARY KEY,
            status TEXT NOT NULL,
            pdf_path TEXT,
            action_plan JSON
        )
    ''')
    
    conn.commit()
    conn.close()

def save_document(doc_id: str, status: str, pdf_path: str, action_plan: dict = None):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO documents (id, status, pdf_path, action_plan)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            status=excluded.status,
            action_plan=excluded.action_plan
    ''', (doc_id, status, pdf_path, json.dumps(action_plan) if action_plan else None))
    conn.commit()
    conn.close()

def get_document(doc_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM documents WHERE id = ?', (doc_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return dict(row)
    return None

def get_all_approved_documents():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM documents WHERE status = "Approved"')
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

# Initialize DB tables on import
init_db()
