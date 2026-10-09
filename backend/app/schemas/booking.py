import re
from datetime import date, datetime, time
from typing import Annotated

from pydantic import BaseModel, EmailStr, StringConstraints, field_validator


class BookingCreate(BaseModel):
    customer_name: Annotated[str, StringConstraints(strip_whitespace=True, min_length=2, max_length=200)]
    phone: Annotated[str, StringConstraints(strip_whitespace=True, min_length=8, max_length=30)]
    email: EmailStr
    service_id: int
    booking_date: date
    booking_time: time
    address: Annotated[str, StringConstraints(strip_whitespace=True, min_length=5, max_length=500)]
    notes: Annotated[str, StringConstraints(strip_whitespace=True, max_length=2000)] | None = None

    @field_validator('phone')
    @classmethod
    def validate_phone(cls, value: str) -> str:
        if not re.fullmatch(r'\+?[0-9][0-9 ()-]{7,28}', value):
            raise ValueError('Enter a valid phone number')
        return value

    @field_validator('booking_date')
    @classmethod
    def validate_booking_date(cls, value: date) -> date:
        if value < date.today():
            raise ValueError('Preferred date cannot be in the past')
        return value


class BookingOut(BaseModel):
    id: int
    customer_name: str
    phone: str
    email: str
    service_id: int
    booking_date: date
    booking_time: time
    address: str
    notes: str | None = None
    status: str
    created_at: datetime

    model_config = {'from_attributes': True}
