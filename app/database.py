"""
Database ulanishi.
Lokal: SQLite (hech narsa o'rnatish shart emas)
Production: DATABASE_URL muhit o'zgaruvchisi orqali PostgreSQL
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Agar DATABASE_URL berilmagan bo'lsa, lokal SQLite ishlatiladi
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./portfolio.db")

# Render.com PostgreSQL URL'i "postgres://" bilan boshlanadi,
# SQLAlchemy esa "postgresql://" talab qiladi — avtomatik tuzatamiz
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# SQLite uchun maxsus parametr kerak (FastAPI ko'p oqimli ishlaydi)
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Har bir so'rov uchun database sessiyasi (dependency injection)"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
