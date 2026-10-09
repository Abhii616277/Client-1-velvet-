from pydantic import BaseModel


class ServiceBase(BaseModel):
    name: str
    slug: str
    short_description: str
    description: str
    image_url: str | None = None
    price: float
    duration_minutes: int
    is_active: bool = True


class ServiceCreate(ServiceBase):
    pass


class ServiceUpdate(BaseModel):
    """All fields optional — only sent fields are applied to the service."""
    name: str | None = None
    slug: str | None = None
    short_description: str | None = None
    description: str | None = None
    image_url: str | None = None
    price: float | None = None
    duration_minutes: int | None = None
    is_active: bool | None = None


class ServiceOut(ServiceBase):
    id: int

    model_config = {'from_attributes': True}
