from datetime import date, time

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.routes.admin import get_current_admin_user
from app.core.database import get_db
from app.models.booking import Booking
from app.models.service import Service
from app.models.user import User
from app.schemas.booking import BookingCreate, BookingOut

router = APIRouter()


@router.post('', response_model=BookingOut)
def create_booking(payload: BookingCreate, db: Session = Depends(get_db)):
    service = db.query(Service).filter(
        Service.id == payload.service_id,
        Service.is_active.is_(True),
    ).first()
    if not service:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Invalid service')

    same_day = db.query(Booking).filter(
        Booking.service_id == payload.service_id,
        Booking.booking_date == payload.booking_date,
        Booking.booking_time == payload.booking_time,
        Booking.phone == payload.phone,
    ).first()
    if same_day:
        raise HTTPException(status_code=409, detail='Duplicate booking already exists')

    booking = Booking(**payload.model_dump())
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


@router.get('/admin', response_model=list[BookingOut])
def list_all_bookings(
    db: Session = Depends(get_db),
    _admin: User = Depends(get_current_admin_user),
):
    return db.query(Booking).order_by(Booking.created_at.desc()).all()


@router.get('/{booking_id}', response_model=BookingOut)
def get_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(get_current_admin_user),
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Booking not found')
    return booking
