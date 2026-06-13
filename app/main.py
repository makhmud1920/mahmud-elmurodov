"""
Portfolio backend — asosiy fayl.
Ishga tushirish:  uvicorn app.main:app --reload
API hujjatlari:   http://127.0.0.1:8000/docs  (faqat development'da)
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.database import Base, engine
from app.models import models  # jadvallar ro'yxatdan o'tishi uchun
from app.rate_limit import limiter
from app.routers import auth, posts, projects

# Jadvallarni yaratish (agar mavjud bo'lmasa)
Base.metadata.create_all(bind=engine)

# Production'da adminni avtomatik yaratish (AUTO_SEED_ADMIN=true bo'lsa)
if settings.AUTO_SEED_ADMIN:
    from app.seed_admin import ensure_admin

    print("[seed] " + ensure_admin(update_if_exists=False))

# Productionda interaktiv hujjatlarni yopamiz (hujum yuzasini kamaytirish)
_docs = not settings.IS_PRODUCTION

app = FastAPI(
    title="Portfolio API",
    description="Shaxsiy portfolio sayt uchun backend",
    version="0.1.0",
    docs_url="/docs" if _docs else None,
    redoc_url=None,
    openapi_url="/openapi.json" if _docs else None,
)

# Rate limiter'ni ulash
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# Xavfsizlik header'lari — har bir javobga qo'shiladi
@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    if settings.IS_PRODUCTION:
        # API faqat JSON qaytaradi -> hech qanday resursga ruxsat bermaymiz
        response.headers["Content-Security-Policy"] = (
            "default-src 'none'; frame-ancestors 'none'"
        )
        response.headers["Strict-Transport-Security"] = (
            "max-age=63072000; includeSubDomains; preload"
        )
    return response


# CORS — cookie ishlatilgani uchun allow_origins aniq ko'rsatiladi ("*" emas)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.FRONTEND_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "X-CSRF-Token"],
)

# Routerlar
app.include_router(auth.router)
app.include_router(posts.router)
app.include_router(projects.router)


@app.get("/")
def root():
    return {"status": "ok", "message": "Portfolio API ishlayapti 🚀"}
