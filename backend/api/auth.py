from datetime import datetime, timedelta
from typing import Optional, Dict
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext
from jose import JWTError, jwt
from config import settings
from database.db import get_db_connection
import uuid
from core.schemas import SignupRequest

router = APIRouter()

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/token")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, email, role, tenant_id FROM users WHERE id = %s", (user_id,))
    user = cursor.fetchone()
    conn.close()
    
    if user is None:
        raise credentials_exception
    return dict(user)

def require_role(allowed_roles: list):
    def role_checker(user: dict = Depends(get_current_user)):
        if user["role"] not in allowed_roles:
            raise HTTPException(status_code=403, detail="Not enough permissions")
        return user
    return role_checker

@router.post("/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    print(f"Login attempt for email: {form_data.username}")
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        # Case-insensitive email search
        cursor.execute("SELECT id, email, hashed_password, role, tenant_id FROM users WHERE LOWER(email) = LOWER(%s)", (form_data.username,))
        user = cursor.fetchone()
        conn.close()
    except Exception as e:
        print(f"Database error during login: {e}")
        raise HTTPException(status_code=500, detail="Internal server error - Database connection failed")
    
    if not user:
        print(f"User not found: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not verify_password(form_data.password, user["hashed_password"]):
        print(f"Invalid password for user: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    print(f"Login successful for: {form_data.username}")
        
    access_token_expires = timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["id"], "role": user["role"], "tenant_id": user["tenant_id"]}, 
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/signup")
async def signup(request: SignupRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if user exists
    cursor.execute("SELECT id FROM users WHERE email = %s", (request.email,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Email already registered")
        
    # Ensure tenant exists
    cursor.execute('INSERT INTO tenants (id, name) VALUES (%s, %s) ON CONFLICT (id) DO NOTHING', (request.tenant_id, "Default Department"))
    
    # Create user
    user_id = str(uuid.uuid4())
    hashed_password = get_password_hash(request.password)
    
    cursor.execute('''
        INSERT INTO users (id, email, hashed_password, role, tenant_id)
        VALUES (%s, %s, %s, %s, %s)
    ''', (user_id, request.email, hashed_password, request.role, request.tenant_id))
    
    conn.commit()
    conn.close()
    
    # Auto login and return token
    access_token_expires = timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_id, "role": request.role, "tenant_id": request.tenant_id}, 
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "message": "User created successfully"}
