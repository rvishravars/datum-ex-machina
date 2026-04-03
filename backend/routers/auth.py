from fastapi import APIRouter, Depends, HTTPException, Request, Response
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from authlib.integrations.starlette_client import OAuth
from database import get_db, User
from auth_utils import create_access_token
from pydantic import BaseModel
from datetime import datetime
import os

router = APIRouter(prefix="/auth")

# OAuth2 Configuration
oauth = OAuth()

class GuestLoginRequest(BaseModel):
    email: str

@router.get("/login/{provider}")
async def login(provider: str, request: Request):
    # Only guest login is currently supported until keys are configured
    raise HTTPException(status_code=503, detail="OAuth2 providers are temporarily disabled. Please use Guest Login.")

@router.get("/callback/{provider}", name="auth_callback")
async def auth_callback(provider: str, request: Request, db: Session = Depends(get_db)):
    if provider == 'google':
        token = await oauth.google.authorize_access_token(request)
        user_info = token.get('userinfo')
        if not user_info:
            raise HTTPException(status_code=400, detail="Failed to fetch user info from Google")
        
        email = user_info.get('email')
        oauth_id = user_info.get('sub')
        full_name = user_info.get('name')
        picture = user_info.get('picture')
    else:
        raise HTTPException(status_code=400, detail="Invalid Provider")

    # Create or update user
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            email=email,
            oauth_id=oauth_id,
            provider=provider,
            full_name=full_name,
            picture=picture,
            is_guest=False
        )
        db.add(user)
    else:
        user.oauth_id = oauth_id
        user.last_login = datetime.utcnow()
    
    db.commit()
    db.refresh(user)

    # Issue JWT
    access_token = create_access_token(data={"sub": user.email, "id": user.id})
    
    # Redirect to frontend with token (In practice, use a secure cookie or postMessage)
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    return RedirectResponse(url=f"{frontend_url}/login/callback?token={access_token}")

@router.post("/guest")
async def guest_login(req: GuestLoginRequest, db: Session = Depends(get_db)):
    # Email is required for guest ID tracking per user request
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        user = User(
            email=req.email,
            provider="guest",
            is_guest=True,
            full_name="Guest Analysator"
        )
        db.add(user)
    else:
        user.last_login = datetime.utcnow()
    
    db.commit()
    db.refresh(user)
    
    access_token = create_access_token(data={"sub": user.email, "id": user.id, "is_guest": True})
    return {"token": access_token, "user": {"email": user.email, "is_guest": True}}
