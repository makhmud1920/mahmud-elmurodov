"""
Database jadvallari (SQLAlchemy modellari).
projects  — portfolio loyihalari
posts     — o'rganish kundaligi (blog)
skills    — texnologiyalar va darajalar
messages  — aloqa formasidan kelgan xabarlar
admin_user — admin (faqat siz)
"""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
from app.database import Base


def now_utc():
    return datetime.now(timezone.utc)


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)          # Loyiha nomi
    description = Column(Text, nullable=False)           # To'liq tavsif
    tech_stack = Column(String(500), nullable=False)     # "React, FastAPI, PostgreSQL"
    image_url = Column(String(500), nullable=True)       # Rasm havolasi
    github_url = Column(String(500), nullable=True)
    live_url = Column(String(500), nullable=True)        # Ishlab turgan sayt havolasi
    is_featured = Column(Boolean, default=False)         # Bosh sahifada ko'rsatish
    created_at = Column(DateTime(timezone=True), default=now_utc)


class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300), nullable=False)
    slug = Column(String(300), unique=True, index=True)  # URL uchun: /blog/sql-window-functions
    content = Column(Text, nullable=False)               # Markdown formatda
    tags = Column(String(300), nullable=True)            # "SQL, Statistika"
    is_published = Column(Boolean, default=True)         # Qoralama yoki chop etilgan
    created_at = Column(DateTime(timezone=True), default=now_utc)
    updated_at = Column(DateTime(timezone=True), default=now_utc, onupdate=now_utc)


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)            # "Python", "SQL", "Power BI"
    category = Column(String(100), nullable=False)        # "Dasturlash", "Ma'lumotlar tahlili"
    level = Column(Integer, default=50)                   # 0-100 (progress bar uchun)
    icon = Column(String(100), nullable=True)             # Ikonka nomi (frontend uchun)


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    email = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=now_utc)


class AdminUser(Base):
    __tablename__ = "admin_user"

    id = Column(Integer, primary_key=True)
    username = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(300), nullable=False)   # bcrypt hash (hech qachon ochiq parol emas!)
