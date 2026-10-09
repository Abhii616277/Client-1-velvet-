from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api.routes.admin import router as admin_router
from app.api.routes.auth import router as auth_router
from app.api.routes.blogs import router as blogs_router
from app.api.routes.bookings import router as bookings_router
from app.api.routes.contact import router as contact_router
from app.api.routes.services import router as services_router
from app.core.config import settings
from app.core.database import create_db_and_tables, engine


@asynccontextmanager
async def lifespan(_app: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(title='Velvet Touch Spa API', lifespan=lifespan)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.cors_origins.split(',') if origin.strip()],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(auth_router, prefix='/api/v1/auth')
app.include_router(services_router, prefix='/api/v1/services')
app.include_router(bookings_router, prefix='/api/v1/bookings')
app.include_router(contact_router, prefix='/api/v1/contact')
app.include_router(blogs_router, prefix='/api/v1/blogs')
app.include_router(admin_router, prefix='/api/v1/admin')


@app.get('/health')
def health_check():
    try:
        with engine.connect() as connection:
            connection.execute(text('SELECT 1'))
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail='Database unavailable',
        ) from exc
    return {'status': 'ok'}


# Alias so both `uvicorn app.main:app` and `uvicorn app.main:run` work
run = app

