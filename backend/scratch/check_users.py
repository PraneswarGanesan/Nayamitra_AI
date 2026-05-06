from database.db import get_db_connection
import json

def check_users():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id, email, role, tenant_id FROM users")
        users = cursor.fetchall()
        conn.close()
        print(f"Found {len(users)} users:")
        for u in users:
            print(u)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_users()
