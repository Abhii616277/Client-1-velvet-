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


class ServiceUpdate(ServiceBase):
    pass


class ServiceOut(ServiceBase):
    id: int

    model_config = {'from_attributes': True}
