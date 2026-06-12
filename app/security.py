"""
Xavfsizlik yadrosi:
  - parol hash (argon2 — bugungi kunda eng kuchli)
  - JWT yaratish / tekshirish
  - get_current_admin dependency (cookie'dan token + CSRF tekshiruvi)
"""
import secrets
from datetime import datetime, timedelta, timezone

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, InvalidHashError, VerificationError
from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.models import AdminUser

# argon2id — standart va eng tavsiya etilgan parametrlar bilan
ph = PasswordHasher()

# Mavjud bo'lmagan foydalanuvchi uchun "soxta" tekshiruv —
# vaqt hujumidan (timing attack) himoya: javob vaqti bir xil bo'ladi.
_DUMMY_HASH = ph.hash("timing_attack_himoyasi_uchun_soxta_parol")

ACCESS_COOKIE_NAME = "access_token"
CSRF_COOKIE_NAME = "csrf_token"
CSRF_HEADER_NAME = "X-CSRF-Token"

# Holatni o'zgartirmaydigan, CSRF talab qilmaydigan metodlar
SAFE_METHODS = {"GET", "HEAD", "OPTIONS"}


# ---------- Parol ----------
def hash_password(password: str) -> str:
    return ph.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return ph.verify(password_hash, password)
    except (VerifyMismatchError, InvalidHashError, VerificationError):
        return False


def needs_rehash(password_hash: str) -> bool:
    """argon2 parametrlari yangilangan bo'lsa, hashni qayta hisoblash kerakligini bildiradi."""
    try:
        return ph.check_needs_rehash(password_hash)
    except InvalidHashError:
        return True


# ---------- JWT ----------
def create_access_token(username: str) -> tuple[str, str]:
    """JWT yaratadi va (token, csrf_token) juftligini qaytaradi."""
    csrf = secrets.token_urlsafe(32)
    now = datetime.now(timezone.utc)
    payload = {
        "sub": username,
        "csrf": csrf,
        "iat": now,
        "exp": now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return token, csrf


def decode_token(token: str) -> dict:
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])


# ---------- Dependency ----------
def get_current_admin(request: Request, db: Session = Depends(get_db)) -> AdminUser:
    """
    Himoyalangan endpointlar uchun. Quyidagilarni tekshiradi:
      1. Cookie'da yaroqli JWT bormi
      2. Yozish so'rovlarida (POST/PUT/DELETE) CSRF token to'g'rimi
      3. Token egasi haqiqatan ham mavjud adminmi
    """
    token = request.cookies.get(ACCESS_COOKIE_NAME)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Avtorizatsiya talab qilinadi",
        )

    try:
        payload = decode_token(token)
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sessiya muddati tugagan, qaytadan kiring",
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Yaroqsiz token",
        )

    # CSRF himoyasi (double-submit cookie) — faqat yozish so'rovlarida
    if request.method not in SAFE_METHODS:
        header_csrf = request.headers.get(CSRF_HEADER_NAME, "")
        token_csrf = payload.get("csrf", "")
        if not header_csrf or not secrets.compare_digest(header_csrf, token_csrf):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="CSRF tekshiruvi muvaffaqiyatsiz",
            )

    admin = db.query(AdminUser).filter(AdminUser.username == payload.get("sub")).first()
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin topilmadi",
        )
    return admin
