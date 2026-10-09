from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class BlogPostBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    slug: str | None = Field(default=None, max_length=255)
    excerpt: str | None = None
    content: str = Field(..., min_length=1)
    featured_image: str | None = Field(default=None, max_length=500)
    status: str = Field(default='draft', max_length=30)


class BlogPostCreate(BlogPostBase):
    pass


class BlogPostUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    slug: str | None = Field(default=None, max_length=255)
    excerpt: str | None = None
    content: str | None = Field(default=None, min_length=1)
    featured_image: str | None = Field(default=None, max_length=500)
    status: str | None = Field(default=None, max_length=30)


class BlogPostOut(BaseModel):
    id: int
    title: str
    slug: str
    excerpt: str | None = None
    content: str
    featured_image: str | None = None
    author: str
    status: str
    published_at: datetime | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
