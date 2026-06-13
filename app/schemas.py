"""
Pydantic sxemalari — API'ga kiruvchi va chiquvchi ma'lumotlar shakli.
SQLAlchemy modeli = database jadvali
Pydantic sxema   = JSON validatsiya
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict


# ---------- PROJECT ----------
class ProjectBase(BaseModel):
    title: str
    description: str
    tech_stack: str
    image_url: Optional[str] = None
    github_url: Optional[str] = None
    live_url: Optional[str] = None
    is_featured: bool = False


class ProjectCreate(ProjectBase):
    """Yangi loyiha qo'shishda keladigan ma'lumot"""
    pass


class ProjectOut(ProjectBase):
    """API qaytaradigan ma'lumot (id va sana bilan)"""
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)  # SQLAlchemy obyektidan o'qish


# ---------- POST (o'rganish mavzulari) ----------
class PostBase(BaseModel):
    title: str
    content: str  # Markdown
    tags: Optional[str] = None
    is_published: bool = True


class PostCreate(PostBase):
    """Yangi mavzu qo'shish/tahrirlash uchun"""
    pass


class PostOut(PostBase):
    id: int
    slug: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------- MESSAGE (aloqa formasi) ----------
class MessageCreate(BaseModel):
    name: str
    email: EmailStr  # email formati avtomatik tekshiriladi
    content: str


class MessageOut(MessageCreate):
    id: int
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
