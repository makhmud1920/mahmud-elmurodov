"""
Admin foydalanuvchini yaratish yoki parolini yangilash.

Lokal:
    python -m app.seed_admin

Production (Cloud Run): main.py ishga tushganda AUTO_SEED_ADMIN=true bo'lsa,
ensure_admin() avtomatik chaqiriladi (admin yo'q bo'lsa yaratadi).

.env / muhit o'zgaruvchilaridan ADMIN_USERNAME va ADMIN_PASSWORD o'qiladi,
paroldan argon2 hash yaratilib, admin_user jadvaliga yoziladi.
Ochiq parol hech qachon bazaga yozilmaydi.
"""
from app.config import settings
from app.database import Base, SessionLocal, engine
from app.models.models import AdminUser
from app.security import hash_password

MIN_PASSWORD_LEN = 12


def _validate() -> None:
    if not settings.ADMIN_USERNAME or not settings.ADMIN_PASSWORD:
        raise SystemExit(
            "Xato: ADMIN_USERNAME va ADMIN_PASSWORD o'rnatilishi shart."
        )
    if len(settings.ADMIN_PASSWORD) < MIN_PASSWORD_LEN:
        raise SystemExit(
            f"Xato: parol kamida {MIN_PASSWORD_LEN} ta belgidan iborat bo'lsin."
        )


def ensure_admin(update_if_exists: bool = True) -> str:
    """
    Adminni yaratadi yoki (ruxsat berilsa) parolini yangilaydi.
    Bajarilgan amalni matn ko'rinishida qaytaradi.
    """
    _validate()
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        admin = (
            db.query(AdminUser)
            .filter(AdminUser.username == settings.ADMIN_USERNAME)
            .first()
        )
        if admin:
            if not update_if_exists:
                return f"'{admin.username}' admin allaqachon mavjud (o'zgartirilmadi)."
            admin.password_hash = hash_password(settings.ADMIN_PASSWORD)
            action = "paroli yangilandi"
        else:
            admin = AdminUser(
                username=settings.ADMIN_USERNAME,
                password_hash=hash_password(settings.ADMIN_PASSWORD),
            )
            db.add(admin)
            action = "yaratildi"
        db.commit()
        return f"'{settings.ADMIN_USERNAME}' admin {action}."
    finally:
        db.close()


def main() -> None:
    # Qo'lda ishga tushirilganda mavjud admin parolini ham yangilaydi
    print("[OK] " + ensure_admin(update_if_exists=True))


if __name__ == "__main__":
    main()
