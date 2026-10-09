from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import settings
from app.core.security import hash_password, verify_password

engine_options = {'pool_pre_ping': True}
if settings.database_url.startswith('sqlite'):
    engine_options['connect_args'] = {'check_same_thread': False}
else:
    engine_options['pool_recycle'] = 1800

engine = create_engine(settings.database_url, **engine_options)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

DEFAULT_SERVICES = [
    {
        'name': 'Men Massage In Bengaluru',
        'slug': 'men-massage-in-bengaluru',
        'short_description': 'A calming and restorative service designed for stress relief and deep relaxation.',
        'description': 'Our men massage service is a gateway to serenity and relaxation, designed to help you unwind and rejuvenate after a busy day.',
        'image_url': '/assets/img/menu/swedish.jpg',
        'price': 1999.0,
        'duration_minutes': 60,
    },
    {
        'name': 'Hotel Massage In Bengaluru',
        'slug': 'hotel-massage-in-bengaluru',
        'short_description': 'Luxury in-room care for guests seeking convenience, comfort, and recovery.',
        'description': 'Our hotel massage service is designed to reach the very core of muscle tension and stress, offering a pathway to deep comfort.',
        'image_url': '/assets/img/menu/deep.jpg',
        'price': 2499.0,
        'duration_minutes': 75,
    },
    {
        'name': 'Home Massage In Bengaluru',
        'slug': 'home-massage-in-bengaluru',
        'short_description': 'Private, soothing, and tailored bodywork in the comfort of your own home.',
        'description': 'Our home massage service combines smooth, therapeutic techniques with a stress-free environment for your complete relaxation.',
        'image_url': '/assets/img/menu/sss2.jpg',
        'price': 2299.0,
        'duration_minutes': 60,
    },
    {
        'name': 'Body Massage In Bengaluru',
        'slug': 'body-massage-in-bengaluru',
        'short_description': 'A classic full-body treatment that eases tension and restores freshness.',
        'description': 'Our body massage service is a sensory delight and comfortable treatment that combines the power of essential oils and soothing strokes.',
        'image_url': '/assets/img/menu/aroma.jpg',
        'price': 2199.0,
        'duration_minutes': 50,
    },
    {
        'name': 'Door Step Massage In Bengaluru',
        'slug': 'door-step-massage-in-bengaluru',
        'short_description': 'Premium massage treatment delivered at your door for convenience and calm.',
        'description': 'Our door step massage service is designed for athletes and active individuals seeking flexibility, tension relief, and recovery.',
        'image_url': '/assets/img/menu/sss1.jpg',
        'price': 2799.0,
        'duration_minutes': 90,
    },
    {
        'name': 'Indian Massage In Bengaluru',
        'slug': 'indian-massage-in-bengaluru',
        'short_description': 'Traditional deep-healing techniques inspired by time-tested Indian wellness practice.',
        'description': 'Our Indian massage service is deeply rooted in the ancient healing system of Indian massage and is excellent for stress relief and balance.',
        'image_url': '/assets/img/menu/aurvedic.jpg',
        'price': 2699.0,
        'duration_minutes': 75,
    },
]


def init_db_schema():
    """Initializes database schema when auto_create_tables is enabled (e.g. for local dev/testing).
    In production, Alembic handles migrations.
    """
    if settings.auto_create_tables:
        from app.models import (  # noqa: F401
            BlogPost,
            Booking,
            ContactMessage,
            Service,
            Testimonial,
            User,
        )
        Base.metadata.create_all(bind=engine)


def seed_default_data():
    """Idempotently seeds the 6 required services and default admin user."""
    from app.models.service import Service
    from app.models.user import User

    db = SessionLocal()
    try:
        service_catalog_changed = False
        for service_data in DEFAULT_SERVICES:
            service = db.query(Service).filter(Service.slug == service_data['slug']).first()
            if service:
                for field, value in service_data.items():
                    if getattr(service, field) != value:
                        setattr(service, field, value)
                        service_catalog_changed = True
            else:
                db.add(Service(**service_data))
                service_catalog_changed = True
        if service_catalog_changed:
            db.commit()

        user = db.query(User).filter(User.email == settings.admin_email).first()
        if user:
            if not verify_password(settings.admin_password, user.password_hash):
                user.password_hash = hash_password(settings.admin_password)
                user.name = user.name or 'Admin User'
                user.role = 'admin'
                db.commit()
        else:
            db.add(
                User(
                    name='Admin User',
                    email=settings.admin_email,
                    password_hash=hash_password(settings.admin_password),
                    role='admin',
                )
            )
            db.commit()
    finally:
        db.close()


def create_db_and_tables():
    init_db_schema()
    seed_default_data()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
