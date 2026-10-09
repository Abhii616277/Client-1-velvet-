from sqlalchemy import CheckConstraint, Column, DateTime, Integer, String, Text
from sqlalchemy.sql import func

from app.core.database import Base


class Testimonial(Base):
    __tablename__ = 'testimonials'
    __table_args__ = (
        CheckConstraint('rating >= 1 AND rating <= 5', name='check_testimonial_rating_range'),
    )

    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String(150), nullable=False)
    email = Column(String(255), nullable=True)
    phone = Column(String(30), nullable=True)
    rating = Column(Integer, nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String(30), default='pending', index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    approved_at = Column(DateTime(timezone=True), nullable=True)
