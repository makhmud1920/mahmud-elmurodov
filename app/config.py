"""
Sozlamalar — barcha maxfiy ma'lumotlar .env faylidan o'qiladi.
Kodda hech qachon parol yoki kalit yozilmaydi!
"""
import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    # --- Muhit ---
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # --- JWT / xavfsizlik ---
    SECRET_KEY: str = os.getenv("SECRET_KEY", "")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

    # --- Admin (seed skript uchun) ---
    ADMIN_USERNAME: str = os.getenv("ADMIN_USERNAME", "")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "")
    # Production'da (Cloud Run) server ishga tushganda adminni avtomatik yaratish
    AUTO_SEED_ADMIN: bool = os.getenv("AUTO_SEED_ADMIN", "false").lower() == "true"

    # --- Cookie sozlamalari ---
    # Lokalda http ishlatamiz -> COOKIE_SECURE=false
    # Productionda https majburiy -> COOKIE_SECURE=true
    COOKIE_SECURE: bool = os.getenv("COOKIE_SECURE", "false").lower() == "true"
    COOKIE_SAMESITE: str = os.getenv("COOKIE_SAMESITE", "lax")  # lax | strict | none

    # --- CORS (frontend manzillari, vergul bilan ajratilgan) ---
    FRONTEND_ORIGINS: list[str] = [
        o.strip()
        for o in os.getenv(
            "FRONTEND_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173",
        ).split(",")
        if o.strip()
    ]

    @property
    def IS_PRODUCTION(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"


settings = Settings()

# Fail-fast: SECRET_KEY bo'lmasa, server umuman ishga tushmasin.
if not settings.SECRET_KEY:
    raise RuntimeError(
        "SECRET_KEY .env faylida o'rnatilmagan!\n"
        "Yangi kalit yaratish:  "
        'python -c "import secrets; print(secrets.token_hex(32))"'
    )

if settings.IS_PRODUCTION and not settings.COOKIE_SECURE:
    raise RuntimeError(
        "Production muhitida COOKIE_SECURE=true bo'lishi shart (HTTPS majburiy)."
    )
