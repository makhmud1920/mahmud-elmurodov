"""
Auth API — login / logout / me.

Ro'yxatdan o'tish (registration) endpointi YO'Q — bu ataylab.
Admin faqat seed skript orqali (.env'dan) yaratiladi.

Login muvaffaqiyatli bo'lsa, ikkita cookie o'rnatiladi:
  - access_token : httpOnly JWT (JavaScript o'qiy olmaydi -> XSS himoya)
  - csrf_token   : JS o'qiy oladigan token (yozish so'rovlarida header orqali yuboriladi)
"""
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.models import AdminUser
from app.rate_limit import limiter
from app.security import (
    ACCESS_COOKIE_NAME,
    CSRF_COOKIE_NAME,
    _DUMMY_HASH,
    create_access_token,
    get_current_admin,
    hash_password,
    needs_rehash,
    verify_password,
)

router = APIRouter(prefix="/api/auth", tags=["Auth"])


class LoginRequest(BaseModel):
    username: str = Field(min_length=1, max_length=100)
    password: str = Field(min_length=1, max_length=200)


class AdminInfo(BaseModel):
    username: str


def _set_auth_cookies(response: Response, token: str, csrf: str) -> None:
    max_age = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    response.set_cookie(
        key=ACCESS_COOKIE_NAME,
        value=token,
        httponly=True,  # JS o'qiy olmaydi
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        max_age=max_age,
        path="/",
    )
    response.set_cookie(
        key=CSRF_COOKIE_NAME,
        value=csrf,
        httponly=False,  # frontend o'qib, X-CSRF-Token header'da qaytaradi
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        max_age=max_age,
        path="/",
    )


def _clear_auth_cookies(response: Response) -> None:
    response.delete_cookie(ACCESS_COOKIE_NAME, path="/")
    response.delete_cookie(CSRF_COOKIE_NAME, path="/")


@router.post("/login", response_model=AdminInfo)
@limiter.limit("5/minute")  # bir IP'dan daqiqada 5 ta urinish — brute-force himoya
def login(
    request: Request,
    response: Response,
    data: LoginRequest,
    db: Session = Depends(get_db),
):
    admin = db.query(AdminUser).filter(AdminUser.username == data.username).first()

    if not admin:
        # Vaqt hujumidan himoya: foydalanuvchi bo'lmasa ham hash tekshiramiz
        verify_password(data.password, _DUMMY_HASH)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Login yoki parol noto'g'ri",
        )

    if not verify_password(data.password, admin.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Login yoki parol noto'g'ri",
        )

    # argon2 parametrlari yangilangan bo'lsa, hashni shaffof yangilaymiz
    if needs_rehash(admin.password_hash):
        admin.password_hash = hash_password(data.password)
        db.commit()

    token, csrf = create_access_token(admin.username)
    _set_auth_cookies(response, token, csrf)
    return AdminInfo(username=admin.username)


@router.post("/logout")
def logout(response: Response, admin: AdminUser = Depends(get_current_admin)):
    _clear_auth_cookies(response)
    return {"message": "Tizimdan chiqdingiz"}


@router.get("/me", response_model=AdminInfo)
def me(admin: AdminUser = Depends(get_current_admin)):
    """Frontend tekshirishi uchun: hozir kim tizimga kirgan."""
    return AdminInfo(username=admin.username)
