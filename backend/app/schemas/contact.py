import re
from typing import Annotated

from pydantic import BaseModel, EmailStr, StringConstraints, field_validator


class ContactCreate(BaseModel):
    name: Annotated[str, StringConstraints(strip_whitespace=True, min_length=2, max_length=200)]
    email: EmailStr
    phone: Annotated[str, StringConstraints(strip_whitespace=True, min_length=6, max_length=30)]
    subject: Annotated[str, StringConstraints(strip_whitespace=True, min_length=3, max_length=300)]
    message: Annotated[str, StringConstraints(strip_whitespace=True, min_length=10, max_length=5000)]

    @field_validator('phone')
    @classmethod
    def validate_phone(cls, value: str) -> str:
        if not re.fullmatch(r'\+?[0-9][0-9 ()-]{5,28}', value):
            raise ValueError('Enter a valid phone number')
        return value


class ContactOut(BaseModel):
    id: int
    name: str
    email: str
    subject: str
    is_read: bool

    model_config = {'from_attributes': True}
