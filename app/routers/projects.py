"""
Loyihalar API'si — to'liq CRUD.

O'qish (GET) — hammaga ochiq (portfolio ko'rinishi uchun).
Yozish (POST/PUT/DELETE) — faqat admin (get_current_admin dependency himoyalaydi).
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import AdminUser, Project
from app.schemas import ProjectCreate, ProjectOut
from app.security import get_current_admin

router = APIRouter(prefix="/api/projects", tags=["Loyihalar"])


@router.get("/", response_model=list[ProjectOut])
def get_projects(db: Session = Depends(get_db)):
    """Barcha loyihalar (eng yangisi birinchi) — ochiq."""
    return db.query(Project).order_by(Project.created_at.desc()).all()


@router.get("/{project_id}", response_model=ProjectOut)
def get_project(project_id: int, db: Session = Depends(get_db)):
    """Bitta loyiha — ochiq."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Loyiha topilmadi")
    return project


@router.post("/", response_model=ProjectOut, status_code=201)
def create_project(
    data: ProjectCreate,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    """Yangi loyiha qo'shish — faqat admin."""
    project = Project(**data.model_dump())
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.put("/{project_id}", response_model=ProjectOut)
def update_project(
    project_id: int,
    data: ProjectCreate,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    """Loyihani tahrirlash — faqat admin."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Loyiha topilmadi")
    for key, value in data.model_dump().items():
        setattr(project, key, value)
    db.commit()
    db.refresh(project)
    return project


@router.delete("/{project_id}", status_code=204)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    """Loyihani o'chirish — faqat admin."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Loyiha topilmadi")
    db.delete(project)
    db.commit()
