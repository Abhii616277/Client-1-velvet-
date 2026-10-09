from logging.config import fileConfig

from alembic import context
from sqlalchemy import create_engine, pool

from app.core.config import settings
from app.core.database import Base
from app.models import (  # noqa: F401
    BlogPost,
    Booking,
    ContactMessage,
    Service,
    Testimonial,
    User,
)

config = context.config

# NOTE: Do NOT call config.set_main_option('sqlalchemy.url', ...) here.
# configparser treats '%' as an interpolation character, which breaks
# percent-encoded passwords (e.g. %40 for '@'). Instead, the URL is
# passed directly to create_engine() / context.configure() below,
# bypassing configparser entirely.

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations without a live DB connection (SQL script output)."""
    context.configure(
        url=settings.database_url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={'paramstyle': 'named'},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations against a live database connection."""
    # Build the engine directly from settings — never via config.get_section()
    # so that percent-encoded characters in the password are preserved correctly.
    connectable = create_engine(
        settings.database_url,
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
