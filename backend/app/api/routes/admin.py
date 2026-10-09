from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.booking import Booking
from app.models.contact import ContactMessage
from app.models.user import User
from app.schemas.admin import DashboardStats, StatusUpdate
from app.schemas.booking import BookingOut

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl='/api/v1/auth/login')


def get_current_admin_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    try:
        payload = decode_access_token(token)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid token') from exc

    email = payload.get('sub')
    user = db.query(User).filter(User.email == email).first()
    if not user or user.role != 'admin':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Admin access required')
    return user


@router.get('/dashboard/stats', response_model=DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    _admin: User = Depends(get_current_admin_user),
):
    total_bookings = db.query(func.count(Booking.id)).scalar() or 0
    pending = db.query(func.count(Booking.id)).filter(Booking.status == 'pending').scalar() or 0
    confirmed = db.query(func.count(Booking.id)).filter(Booking.status == 'confirmed').scalar() or 0
    completed = db.query(func.count(Booking.id)).filter(Booking.status == 'completed').scalar() or 0
    cancelled = db.query(func.count(Booking.id)).filter(Booking.status == 'cancelled').scalar() or 0
    contact_enquiries = db.query(func.count(ContactMessage.id)).scalar() or 0

    return {
        'total_bookings': total_bookings,
        'pending': pending,
        'confirmed': confirmed,
        'completed': completed,
        'cancelled': cancelled,
        'contact_enquiries': contact_enquiries,
    }


@router.get('/bookings', response_model=list[BookingOut])
def list_bookings(
    db: Session = Depends(get_db),
    _admin: User = Depends(get_current_admin_user),
):
    return db.query(Booking).order_by(Booking.created_at.desc()).all()


@router.patch('/bookings/{booking_id}/status')
def update_booking_status(
    booking_id: int,
    payload: StatusUpdate,
    db: Session = Depends(get_db),
    _admin: User = Depends(get_current_admin_user),
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail='Booking not found')

    booking.status = payload.status
    db.commit()
    db.refresh(booking)
    return {'message': 'Booking status updated', 'booking_id': booking.id, 'status': booking.status}
