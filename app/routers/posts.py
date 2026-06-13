"""
Mavzular (o'rganish daftari) API'si.

O'qish (GET) — hammaga ochiq (faqat chop etilgan mavzular).
Yozish (POST/PUT/DELETE) — faqat admin.
Admin uchun /admin/all — qoralamalar bilan birga barcha mavzular.
"""
import re

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import AdminUser, Post
from app.schemas import PostCreate, PostOut
from app.security import get_current_admin

router = APIRouter(prefix="/api/posts", tags=["Mavzular"])


def slugify(text: str) -> str:
    """Sarlavhadan URL uchun slug yasaydi: 'SQL window' -> 'sql-window'."""
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text).strip("-")
    return text or "mavzu"


def unique_slug(db: Session, base: str, exclude_id: int | None = None) -> str:
    """Takrorlanmas slug — band bo'lsa oxiriga raqam qo'shadi."""
    slug, i = base, 2
    while True:
        q = db.query(Post).filter(Post.slug == slug)
        if exclude_id is not None:
            q = q.filter(Post.id != exclude_id)
        if not q.first():
            return slug
        slug = f"{base}-{i}"
        i += 1


# ---------- Ommaviy (o'qish) ----------
@router.get("/", response_model=list[PostOut])
def list_posts(db: Session = Depends(get_db)):
    """Chop etilgan mavzular, eng yangisi birinchi."""
    return (
        db.query(Post)
        .filter(Post.is_published.is_(True))
        .order_by(Post.created_at.desc())
        .all()
    )


# ---------- Admin (qoralamalar bilan) ----------
@router.get("/admin/all", response_model=list[PostOut])
def admin_list_posts(
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    """Barcha mavzular (qoralamalar ham) — faqat admin."""
    return db.query(Post).order_by(Post.created_at.desc()).all()


@router.get("/{slug}", response_model=PostOut)
def get_post(slug: str, db: Session = Depends(get_db)):
    """Bitta mavzu (slug bo'yicha) — ochiq."""
    post = db.query(Post).filter(Post.slug == slug, Post.is_published.is_(True)).first()
    if not post:
        raise HTTPException(status_code=404, detail="Mavzu topilmadi")
    return post


# ---------- Yozish (faqat admin) ----------
@router.post("/", response_model=PostOut, status_code=201)
def create_post(
    data: PostCreate,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    post = Post(slug=unique_slug(db, slugify(data.title)), **data.model_dump())
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


@router.put("/{post_id}", response_model=PostOut)
def update_post(
    post_id: int,
    data: PostCreate,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Mavzu topilmadi")
    for key, value in data.model_dump().items():
        setattr(post, key, value)
    post.slug = unique_slug(db, slugify(data.title), exclude_id=post.id)
    db.commit()
    db.refresh(post)
    return post


@router.delete("/{post_id}", status_code=204)
def delete_post(
    post_id: int,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Mavzu topilmadi")
    db.delete(post)
    db.commit()
