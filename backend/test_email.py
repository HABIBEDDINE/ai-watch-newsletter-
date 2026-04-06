"""
Step 1+2: Test SMTP config and connection for AI Watch newsletter.
Run: python test_email.py
"""
import os, smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).resolve().parent.parent / "config" / ".env")

SMTP_HOST     = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT     = int(os.getenv("SMTP_PORT", 587))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM     = os.getenv("SMTP_FROM_EMAIL", "")
RECIPIENTS    = os.getenv("NEWSLETTER_RECIPIENTS", "")

# ── Step 1: Print config ──────────────────────────────────────────────────────
print("=== SMTP CONFIG ===")
print(f"SMTP_HOST      = {SMTP_HOST!r}")
print(f"SMTP_PORT      = {SMTP_PORT}")
print(f"SMTP_USERNAME  = {SMTP_USERNAME!r}")
print(f"SMTP_FROM      = {SMTP_FROM!r}")
print(f"SMTP_PASSWORD  = {'*' * len(SMTP_PASSWORD)!r}  (length={len(SMTP_PASSWORD)})")
print(f"RECIPIENTS     = {RECIPIENTS!r}")
print()

# ── Validate ──────────────────────────────────────────────────────────────────
errors = []
if not SMTP_USERNAME:
    errors.append("SMTP_USERNAME is empty")
if not SMTP_PASSWORD:
    errors.append("SMTP_PASSWORD is empty")
if not SMTP_FROM:
    errors.append("SMTP_FROM_EMAIL is empty")
if not RECIPIENTS:
    errors.append("NEWSLETTER_RECIPIENTS is empty")
if SMTP_FROM and SMTP_USERNAME and SMTP_FROM != SMTP_USERNAME:
    print(f"⚠️  WARNING: SMTP_FROM_EMAIL ({SMTP_FROM}) != SMTP_USERNAME ({SMTP_USERNAME})")
    print("    Gmail requires these to match. Using SMTP_USERNAME as From address.")

if errors:
    for e in errors:
        print(f"❌ {e}")
    raise SystemExit(1)

# ── Step 2: Test SMTP connection and send ─────────────────────────────────────
print("=== SMTP CONNECTION TEST ===")
recipients_list = [r.strip() for r in RECIPIENTS.split(",") if r.strip()]

msg = MIMEMultipart("alternative")
msg["Subject"] = "AI Watch — SMTP test email"
msg["From"]    = SMTP_USERNAME          # must equal login for Gmail
msg["To"]      = ", ".join(recipients_list)
msg.attach(MIMEText("This is a plain-text test from AI Watch newsletter.", "plain", "utf-8"))
msg.attach(MIMEText("<h2>AI Watch SMTP test ✅</h2><p>If you see this, email delivery is working.</p>", "html", "utf-8"))

try:
    print(f"Connecting to {SMTP_HOST}:{SMTP_PORT} ...")
    with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=15) as server:
        server.set_debuglevel(1)          # prints SMTP conversation
        server.ehlo()
        print("STARTTLS ...")
        server.starttls()
        server.ehlo()
        print(f"Logging in as {SMTP_USERNAME} ...")
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        print(f"Sending to {recipients_list} ...")
        server.sendmail(SMTP_USERNAME, recipients_list, msg.as_string())
    print(f"\nSUCCESS — Test email sent to: {recipients_list}")
except smtplib.SMTPAuthenticationError as e:
    print(f"\nFAILED — AUTH REJECTED: {e}")
    print()
    print("Gmail App Password checklist:")
    print("  1. Go to myaccount.google.com -> Security -> 2-Step Verification")
    print("  2. At the bottom: App passwords -> create one for 'Mail'")
    print("  3. Copy the 16-char code (no spaces) into SMTP_PASSWORD in .env")
    print("  4. Your regular Gmail password will NOT work here")
except smtplib.SMTPException as e:
    print(f"\nFAILED — SMTP ERROR: {type(e).__name__}: {e}")
except Exception as e:
    print(f"\nFAILED — CONNECTION ERROR: {type(e).__name__}: {e}")
