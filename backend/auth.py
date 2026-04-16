"""
Auth router for AI Watch — register, login, logout, refresh,
Google OAuth, forgot/reset password, email verification, current user.
"""
from dotenv import load_dotenv
from pathlib import Path
load_dotenv(Path(__file__).resolve().parent.parent / "config" / ".env")

import os, hashlib, secrets, datetime, smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from fastapi import APIRouter, HTTPException, Response, Request
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from typing import Optional
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
VERIFY_TTL       = 24 * 3600      # 24 h

GOOGLE_CLIENT_ID     = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
GOOGLE_REDIRECT_URI  = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:3000/api/auth/google/callback")
FRONTEND_URL         = os.getenv("FRONTEND_URL", "http://localhost:3000")

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USERNAME", "")
SMTP_PASS = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM = os.getenv("SMTP_FROM_EMAIL", "")

VALID_ROLES = ["cto", "innovation_manager", "strategy_director", "other"]

auth_router  = APIRouter(prefix="/api/auth",  tags=["auth"])
users_router = APIRouter(prefix="/api/users", tags=["users"])

# ── helpers ───────────────────────────────────────────────────────────────────
def _hash_pw(plain: str) -> str:
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt(12)).decode()

def _verify_pw(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())

def _access_token(user_id: str, role: str, full_name: str = "", is_verified: bool = False, email: str = "") -> str:
    exp = datetime.datetime.utcnow() + datetime.timedelta(seconds=ACCESS_TTL)
    return jwt.encode(
        {"sub": user_id, "role": role, "full_name": full_name,
         "email": email, "is_verified": is_verified, "exp": exp},
        JWT_SECRET, algorithm=JWT_ALGORITHM
    )

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

def _require_auth(request: Request) -> dict:
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(401, "Not authenticated")
    try:
        return jwt.decode(auth[7:], JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except JWTError:
        raise HTTPException(401, "Invalid or expired token")

# ── email helpers ─────────────────────────────────────────────────────────────
def _send_email(to: str, subject: str, html: str):
    if not SMTP_USER or not SMTP_PASS or not SMTP_FROM:
        print(f"[Email] SMTP not configured (SMTP_USERNAME/PASSWORD/FROM_EMAIL missing)")
        return
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"]    = f"AI Watch <{SMTP_FROM}>"
        msg["To"]      = to
        msg.attach(MIMEText(html, "html", "utf-8"))
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=15) as s:
            s.ehlo()
            s.starttls()
            s.ehlo()
            s.login(SMTP_USER, SMTP_PASS)
            s.sendmail(SMTP_FROM, [to], msg.as_string())
        print(f"[Email] ✓ Sent '{subject}' → {to}")
    except smtplib.SMTPAuthenticationError:
        print(f"[Email] ✗ SMTP auth failed — check SMTP_USERNAME and SMTP_PASSWORD in .env")
    except smtplib.SMTPException as e:
        print(f"[Email] ✗ SMTP error sending to {to}: {e}")
    except Exception as e:
        print(f"[Email] ✗ Unexpected error sending to {to}: {type(e).__name__}: {e}")

def _send_verification_email(email: str, token: str, full_name: str = ""):
    url  = f"{FRONTEND_URL}/verify-email?token={token}"
    # Always print for dev convenience — works even if SMTP fails
    print(f"[DEV] Email verify → {url}")
    name = full_name or email
    html = f"""
<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f4f4f4;font-family:'Open Sans',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
  <tr><td align="center">
    <table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.07);">
      <tr><td style="background:#1A1A2E;padding:28px 36px;">
        <span style="color:#fff;font-size:20px;font-weight:800;letter-spacing:-0.5px;">AI Watch</span>
        <span style="color:rgba(255,255,255,0.4);font-size:13px;margin-left:8px;">by DXC Technology</span>
      </td></tr>
      <tr><td style="padding:36px 36px 28px;">
        <p style="font-size:15px;color:#111;margin:0 0 8px;">Hi {name},</p>
        <p style="font-size:14px;color:#555;line-height:1.7;margin:0 0 28px;">
          Thanks for registering. Please verify your email address to unlock all features,
          including email alerts and personalised briefings.
        </p>
        <a href="{url}" style="display:inline-block;background:#1A4A9E;color:#fff;
          text-decoration:none;font-size:14px;font-weight:700;padding:13px 28px;
          border-radius:8px;letter-spacing:0.3px;">Verify Email Address</a>
        <p style="font-size:12px;color:#999;margin:24px 0 0;line-height:1.7;">
          This link expires in 24 hours. If you didn't create an account, you can ignore this email.<br>
          Or copy this URL: <a href="{url}" style="color:#1A4A9E;">{url}</a>
        </p>
      </td></tr>
      <tr><td style="background:#f9f9f9;padding:16px 36px;border-top:1px solid #eee;">
        <p style="font-size:11px;color:#aaa;margin:0;">AI Watch · DXC Technology · Internal use only</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>"""
    _send_email(email, "Verify your AI Watch account", html)

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

class ResendVerifyBody(BaseModel):
    email: str

class UpdateMeBody(BaseModel):
    full_name: Optional[str] = None
    company:   Optional[str] = None
    role:      Optional[str] = None

class OnboardingBody(BaseModel):
    role: str
    trend_topics: list = []

# ── rate limiters (in-memory) ─────────────────────────────────────────────────
_attempts: dict = {}
_resend_times: dict = {}  # user_id → last resend datetime

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

def _check_resend_rate(user_id: str):
    last = _resend_times.get(user_id)
    if last and (_now() - last).total_seconds() < 300:
        raise HTTPException(429, "Please wait 5 minutes before requesting another verification email.")

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

    # Auto-subscribe to newsletter
    try:
        supabase.table("newsletter_subscribers").upsert({"email": email}).execute()
    except Exception:
        pass

    # Send email verification (non-fatal)
    try:
        v_token = secrets.token_urlsafe(32)
        supabase.table("email_verification_tokens").insert({
            "user_id": user["id"],
            "token_hash": _hash(v_token),
            "expires_at": _exp(VERIFY_TTL),
        }).execute()
        _send_verification_email(email, v_token, body.full_name)
    except Exception as e:
        print(f"[Auth] Verification email failed: {e}")

    refresh = _raw_refresh()
    _store_refresh(user["id"], refresh)
    _set_refresh_cookie(response, refresh)
    return {
        "user_id": user["id"], "email": user["email"], "role": user["role"],
        "access_token": _access_token(user["id"], user["role"], user["full_name"], False, user["email"]),
        "token_type": "bearer",
    }

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
        "access_token": _access_token(user["id"], user["role"], user["full_name"], bool(user.get("is_verified")), user["email"]),
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
    exp = datetime.datetime.fromisoformat(row["expires_at"].replace("Z", "")).replace(tzinfo=None)
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
    return {
        "access_token": _access_token(user["id"], user["role"], user["full_name"], bool(user.get("is_verified")), user["email"]),
        "token_type": "bearer", "expires_in": ACCESS_TTL,
    }

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
        try:
            supabase.table("newsletter_subscribers").upsert({"email": email}).execute()
        except Exception:
            pass
    rt = _raw_refresh()
    _store_refresh(user["id"], rt)
    at = _access_token(user["id"], user["role"], user.get("full_name", ""), True, email)
    resp = RedirectResponse(f"{FRONTEND_URL}/?token={at}")
    _set_refresh_cookie(resp, rt)
    return resp

# ── verify email ──────────────────────────────────────────────────────────────
@auth_router.get("/verify-email")
async def verify_email(token: str):
    rows = supabase.table("email_verification_tokens").select("*").eq("token_hash", _hash(token)).execute()
    if not rows.data:
        raise HTTPException(410, "Invalid or expired verification link")
    row = rows.data[0]
    if row.get("used_at"):
        raise HTTPException(410, "This link has already been used")
    exp = datetime.datetime.fromisoformat(row["expires_at"].replace("Z", "")).replace(tzinfo=None)
    if _now() > exp:
        raise HTTPException(410, "Verification link expired — please request a new one")
    supabase.table("users").update({
        "is_verified": True,
        "email_verified_at": _now().isoformat(),
    }).eq("id", row["user_id"]).execute()
    supabase.table("email_verification_tokens").update(
        {"used_at": _now().isoformat()}
    ).eq("id", row["id"]).execute()
    return {"ok": True, "message": "Email verified! You can now use all features."}

# ── resend verification ───────────────────────────────────────────────────────
@auth_router.post("/resend-verification")
async def resend_verification(body: ResendVerifyBody):
    email = body.email.lower().strip()
    _SAFE = {"ok": True}
    users = supabase.table("users").select("id, full_name, is_verified").eq("email", email).execute()
    if not users.data:
        return _SAFE
    user = users.data[0]
    if user.get("is_verified"):
        return {"ok": True, "message": "Email already verified"}
    _check_resend_rate(user["id"])
    v_token = secrets.token_urlsafe(32)
    supabase.table("email_verification_tokens").insert({
        "user_id": user["id"],
        "token_hash": _hash(v_token),
        "expires_at": _exp(VERIFY_TTL),
    }).execute()
    _send_verification_email(email, v_token, user.get("full_name", ""))
    _resend_times[user["id"]] = _now()
    return {"ok": True, "message": "Verification email sent. Check your inbox."}

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
    # TODO: send actual email
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
    exp = datetime.datetime.fromisoformat(row["expires_at"].replace("Z", "")).replace(tzinfo=None)
    if _now() > exp:
        raise HTTPException(410, "Reset link expired — please request a new one")
    _validate_pw(body.password)
    supabase.table("users").update({"password_hash": _hash_pw(body.password)}).eq("id", row["user_id"]).execute()
    supabase.table("password_reset_tokens").update({"used_at": _now().isoformat()}).eq("id", row["id"]).execute()
    return {"ok": True, "message": "Password updated. You can now log in."}

# ── current user ──────────────────────────────────────────────────────────────
@users_router.get("/me")
async def get_me(request: Request):
    payload = _require_auth(request)
    users = supabase.table("users").select(
        "id,email,full_name,role,company,is_verified,created_at"
    ).eq("id", payload["sub"]).execute()
    if not users.data:
        raise HTTPException(404, "User not found")
    return users.data[0]

# ── update profile ────────────────────────────────────────────────────────────
@users_router.put("/me")
async def update_me(body: UpdateMeBody, request: Request):
    payload = _require_auth(request)
    updates = {}
    if body.full_name is not None:
        updates["full_name"] = body.full_name.strip()
    if body.company is not None:
        updates["company"] = body.company.strip()
    if body.role is not None:
        if body.role not in VALID_ROLES:
            raise HTTPException(422, f"Role must be one of: {', '.join(VALID_ROLES)}")
        updates["role"] = body.role
    if not updates:
        raise HTTPException(422, "Nothing to update")
    result = supabase.table("users").update(updates).eq("id", payload["sub"]).execute()
    if not result.data:
        raise HTTPException(404, "User not found")
    user = result.data[0]
    return {
        "ok": True,
        "access_token": _access_token(
            user["id"], user["role"], user["full_name"], bool(user.get("is_verified")), user["email"]
        ),
        "token_type": "bearer",
        "user": {
            "user_id": user["id"], "full_name": user["full_name"],
            "role": user["role"], "company": user.get("company", ""),
            "email": user["email"], "is_verified": user.get("is_verified", False),
        },
    }

# ── onboarding (trend personalization) ───────────────────────────────────────
@users_router.post("/onboarding")
async def complete_onboarding(body: OnboardingBody, request: Request):
    """Save user's trend preferences and mark onboarding as completed."""
    payload = _require_auth(request)
    user_id = payload["sub"]

    if body.role not in VALID_ROLES:
        raise HTTPException(422, f"Role must be one of: {', '.join(VALID_ROLES)}")

    updates = {
        "role": body.role,
        "trend_topics": body.trend_topics,
        "onboarding_completed": True,
    }

    result = supabase.table("users").update(updates).eq("id", user_id).execute()
    if not result.data:
        raise HTTPException(404, "User not found")

    user = result.data[0]
    return {
        "ok": True,
        "access_token": _access_token(
            user["id"], user["role"], user["full_name"], bool(user.get("is_verified")), user["email"]
        ),
        "token_type": "bearer",
        "user": {
            "user_id": user["id"], "full_name": user["full_name"],
            "role": user["role"], "trend_topics": user.get("trend_topics", []),
            "onboarding_completed": True,
        },
    }
