from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, String, Text, Time
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Booking(Base):
    __tablename__ = 'bookings'

    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String(200), nullable=False)
    phone = Column(String(30), nullable=False)
    email = Column(String(255), nullable=False)
    service_id = Column(Integer, ForeignKey('services.id'), nullable=False, index=True)
    booking_date = Column(Date, nullable=False)
    booking_time = Column(Time, nullable=False)
    address = Column(String(500), nullable=False)
    notes = Column(Text, nullable=True)
    status = Column(String(30), default='pending', nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    service = relationship('Service')
