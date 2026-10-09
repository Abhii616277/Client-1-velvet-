from typing import Literal

from pydantic import BaseModel


class DashboardStats(BaseModel):
    total_bookings: int
    pending: int
    confirmed: int
    completed: int
    cancelled: int
    contact_enquiries: int


class StatusUpdate(BaseModel):
    status: Literal['pending', 'confirmed', 'completed', 'cancelled']
