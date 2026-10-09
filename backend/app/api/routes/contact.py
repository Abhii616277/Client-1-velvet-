from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.routes.admin import get_current_admin_user
from app.core.database import get_db
from app.models.contact import ContactMessage
from app.models.user import User
from app.schemas.contact import ContactCreate, ContactOut

router = APIRouter()


@router.post('', response_model=ContactOut)
def submit_contact(payload: ContactCreate, db: Session = Depends(get_db)):
    message = ContactMessage(**payload.model_dump())
    db.add(message)
    db.commit()
    db.refresh(message)
    return message


@router.get('/admin', response_model=list[ContactOut])
def list_contact_messages(
    db: Session = Depends(get_db),
    _admin: User = Depends(get_current_admin_user),
):
    return db.query(ContactMessage).order_by(ContactMessage.created_at.desc()).all()
