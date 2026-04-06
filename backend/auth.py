"""
Auth router for AI Watch — register, login, logout, refresh,
Google OAuth, forgot/reset password, current user.
"""
from dotenv import load_dotenv
from pathlib import Path
load_dotenv(Path(__file__).resolve().parent.parent / "config" / ".env")

import os, hashlib, secrets, datetime
from fastapi import APIRouter, HTTPException, Response, Request
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
import bcrypt
from jose import jwt, JWTError
import httpx
from urllib.parse import urlencode

from db import supabase

# ── config ────────────────────────────────────────────────────────────────────
JWT_SECRET       = os.getenv("JWT_SECRET", "change-me-in-production-please")
JWT_ALGORITHM    = "HS256"
ACCESS_TTL       = 15 * 60        # 15 min
REFRESH_TTL      = 7 * 24 * 3600  # 7 days
RESET_TTL        = 15 * 60        # 15 min

GOOGLE_CLIENT_ID     = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
GOOGLE_REDIRECT_URI  = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:3000/api/auth/google/callback")
FRONTEND_URL         = os.getenv("FRONTEND_URL", "http://localhost:3000")

auth_router  = APIRouter(prefix="/api/auth",  tags=["auth"])
users_router = APIRouter(prefix="/api/users", tags=["users"])

# ── helpers ───────────────────────────────────────────────────────────────────
def _hash_pw(plain: str) -> str:
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt(12)).decode()

def _verify_pw(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())

def _access_token(user_id: str, role: str, full_name: str = "") -> str:
    exp = datetime.datetime.utcnow() + datetime.timedelta(seconds=ACCESS_TTL)
    return jwt.encode({"sub": user_id, "role": role, "full_name": full_name, "exp": exp}, JWT_SECRET, algorithm=JWT_ALGORITHM)

def _raw_refresh() -> str:
    return secrets.token_urlsafe(48)

def _hash(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()

def _now() -> datetime.datetime:
    return datetime.datetime.utcnow()

def _exp(seconds: int) -> str:
    return (_now() + datetime.timedelta(seconds=seconds)).isoformat()

def _validate_pw(pw: str):
    if len(pw) < 8 or not any(c.isupper() for c in pw) or not any(c.isdigit() for c in pw):
        raise HTTPException(422, "Password must be ≥8 chars, include 1 uppercase letter and 1 number")

def _set_refresh_cookie(response, token: str):
    response.set_cookie(
        "refresh_token", token,
        httponly=True, samesite="lax", secure=False,
        max_age=REFRESH_TTL, path="/",
    )

def _store_refresh(user_id: str, token: str):
    supabase.table("refresh_tokens").insert({
        "user_id": user_id,
        "token_hash": _hash(token),
        "expires_at": _exp(REFRESH_TTL),
    }).execute()

# ── schemas ───────────────────────────────────────────────────────────────────
class RegisterBody(BaseModel):
    full_name: str
    email: str
    password: str
    company: str = ""
    role: str = "other"

class LoginBody(BaseModel):
    email: str
    password: str

class ForgotBody(BaseModel):
    email: str

class ResetBody(BaseModel):
    token: str
    password: str

# ── rate limiter (in-memory) ──────────────────────────────────────────────────
_attempts: dict = {}

def _check_rate(email: str):
    now = _now()
    b = _attempts.get(email, {"n": 0, "reset": now})
    if now > b["reset"]:
        b = {"n": 0, "reset": now + datetime.timedelta(minutes=15)}
    if b["n"] >= 5:
        raise HTTPException(429, "Too many attempts. Try again in 15 minutes.")
    return b

def _bump(email: str):
    b = _attempts.get(email, {"n": 0, "reset": _now() + datetime.timedelta(minutes=15)})
    b["n"] += 1
    _attempts[email] = b

# ── register ──────────────────────────────────────────────────────────────────
@auth_router.post("/register", status_code=201)
async def register(body: RegisterBody, response: Response):
    email = body.email.lower().strip()
    _validate_pw(body.password)
    existing = supabase.table("users").select("id").eq("email", email).execute()
    if existing.data:
        raise HTTPException(409, "Email already registered")
    created = supabase.table("users").insert({
        "email": email, "full_name": body.full_name,
        "company": body.company, "role": body.role,
        "password_hash": _hash_pw(body.password), "is_verified": False,
    }).execute()
    if not created.data:
        raise HTTPException(500, "Failed to create user")
    user = created.data[0]
    # Auto-subscribe new user's email to newsletter
    try:
        supabase.table("newsletter_subscribers").upsert({"email": email}).execute()
    except Exception:
        pass  # Non-critical
    refresh = _raw_refresh()
    _store_refresh(user["id"], refresh)
    _set_refresh_cookie(response, refresh)
    return {"user_id": user["id"], "email": user["email"], "role": user["role"],
            "access_token": _access_token(user["id"], user["role"], user["full_name"]), "token_type": "bearer"}

# ── login ─────────────────────────────────────────────────────────────────────
@auth_router.post("/login")
async def login(body: LoginBody, response: Response):
    email = body.email.lower().strip()
    b = _check_rate(email)
    users = supabase.table("users").select("*").eq("email", email).execute()
    if not users.data or not users.data[0].get("password_hash"):
        _bump(email); _attempts[email] = b
        raise HTTPException(401, "Invalid credentials")
    user = users.data[0]
    if not _verify_pw(body.password, user["password_hash"]):
        _bump(email); _attempts[email] = b
        raise HTTPException(401, "Invalid credentials")
    _attempts.pop(email, None)
    refresh = _raw_refresh()
    _store_refresh(user["id"], refresh)
    _set_refresh_cookie(response, refresh)
    return {
        "access_token": _access_token(user["id"], user["role"], user["full_name"]),
        "token_type": "bearer", "expires_in": ACCESS_TTL,
        "user": {"user_id": user["id"], "full_name": user["full_name"],
                 "role": user["role"], "email": user["email"]},
    }

# ── logout ────────────────────────────────────────────────────────────────────
@auth_router.post("/logout")
async def logout(request: Request, response: Response):
    rt = request.cookies.get("refresh_token")
    if rt:
        supabase.table("refresh_tokens").delete().eq("token_hash", _hash(rt)).execute()
    response.delete_cookie("refresh_token", path="/")
    return {"ok": True}

# ── refresh ───────────────────────────────────────────────────────────────────
@auth_router.post("/refresh")
async def refresh(request: Request, response: Response):
    rt = request.cookies.get("refresh_token")
    if not rt:
        raise HTTPException(401, "No refresh token")
    rows = supabase.table("refresh_tokens").select("*").eq("token_hash", _hash(rt)).execute()
    if not rows.data:
        raise HTTPException(401, "Invalid refresh token")
    row = rows.data[0]
    exp = datetime.datetime.fromisoformat(row["expires_at"].replace("Z", ""))
    if _now() > exp:
        supabase.table("refresh_tokens").delete().eq("id", row["id"]).execute()
        raise HTTPException(401, "Refresh token expired")
    users = supabase.table("users").select("*").eq("id", row["user_id"]).execute()
    if not users.data:
        raise HTTPException(401, "User not found")
    user = users.data[0]
    supabase.table("refresh_tokens").delete().eq("id", row["id"]).execute()
    new_rt = _raw_refresh()
    _store_refresh(user["id"], new_rt)
    _set_refresh_cookie(response, new_rt)
    return {"access_token": _access_token(user["id"], user["role"], user["full_name"]),
            "token_type": "bearer", "expires_in": ACCESS_TTL}

# ── Google OAuth ──────────────────────────────────────────────────────────────
@auth_router.get("/google")
async def google_start():
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(501, "Google OAuth not configured — set GOOGLE_CLIENT_ID in .env")
    params = {"client_id": GOOGLE_CLIENT_ID, "redirect_uri": GOOGLE_REDIRECT_URI,
              "response_type": "code", "scope": "openid email profile", "access_type": "offline"}
    return RedirectResponse(f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}")

@auth_router.get("/google/callback")
async def google_callback(code: str, response: Response):
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(501, "Google OAuth not configured")
    async with httpx.AsyncClient() as client:
        tok = (await client.post("https://oauth2.googleapis.com/token", data={
            "code": code, "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "redirect_uri": GOOGLE_REDIRECT_URI, "grant_type": "authorization_code",
        })).json()
        guser = (await client.get("https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {tok['access_token']}"})).json()
    email = guser["email"].lower()
    existing = supabase.table("users").select("*").eq("email", email).execute()
    if existing.data:
        user = existing.data[0]
    else:
        user = supabase.table("users").insert({
            "email": email, "full_name": guser.get("name", email),
            "oauth_provider": "google", "oauth_id": str(guser["id"]),
            "is_verified": True, "role": "other",
        }).execute().data[0]
        # Auto-subscribe new Google user's email to newsletter
        try:
            supabase.table("newsletter_subscribers").upsert({"email": email}).execute()
        except Exception:
            pass
    rt = _raw_refresh(); _store_refresh(user["id"], rt)
    at = _access_token(user["id"], user["role"], user.get("full_name", ""))
    resp = RedirectResponse(f"{FRONTEND_URL}/?token={at}")
    _set_refresh_cookie(resp, rt)
    return resp

# ── forgot password ───────────────────────────────────────────────────────────
@auth_router.post("/forgot-password")
async def forgot_password(body: ForgotBody):
    email = body.email.lower().strip()
    _SAFE = {"ok": True, "message": "If that email exists, a reset link has been sent."}
    users = supabase.table("users").select("id").eq("email", email).execute()
    if not users.data:
        return _SAFE
    user_id = users.data[0]["id"]
    token = secrets.token_urlsafe(32)
    supabase.table("password_reset_tokens").insert({
        "user_id": user_id, "token_hash": _hash(token),
        "expires_at": _exp(RESET_TTL),
    }).execute()
    reset_url = f"{FRONTEND_URL}/reset-password/{token}"
    print(f"[DEV] Password reset → {reset_url}")
    # TODO: replace print with actual email send (SendGrid / SMTP)
    return _SAFE

# ── reset password ────────────────────────────────────────────────────────────
@auth_router.post("/reset-password")
async def reset_password(body: ResetBody):
    rows = supabase.table("password_reset_tokens").select("*").eq("token_hash", _hash(body.token)).execute()
    if not rows.data:
        raise HTTPException(410, "Invalid or expired reset link")
    row = rows.data[0]
    if row.get("used_at"):
        raise HTTPException(410, "Reset link has already been used")
    exp = datetime.datetime.fromisoformat(row["expires_at"].replace("Z", ""))
    if _now() > exp:
        raise HTTPException(410, "Reset link expired — please request a new one")
    _validate_pw(body.password)
    supabase.table("users").update({"password_hash": _hash_pw(body.password)}).eq("id", row["user_id"]).execute()
    supabase.table("password_reset_tokens").update({"used_at": _now().isoformat()}).eq("id", row["id"]).execute()
    return {"ok": True, "message": "Password updated. You can now log in."}

# ── current user ──────────────────────────────────────────────────────────────
@users_router.get("/me")
async def get_me(request: Request):
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(401, "Not authenticated")
    try:
        payload = jwt.decode(auth[7:], JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except JWTError:
        raise HTTPException(401, "Invalid or expired token")
    users = supabase.table("users").select("id,email,full_name,role,company,is_verified,created_at").eq("id", payload["sub"]).execute()
    if not users.data:
        raise HTTPException(404, "User not found")
    return users.data[0]
