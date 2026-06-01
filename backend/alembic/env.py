import os
import sys
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy import create_engine
from alembic import context


# add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from database import Base
import models

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)
target_metadata = Base.metadata

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = os.environ.get("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/inventory_db")
    
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)

    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    
    # 1. Force fetch from the environment directly
    db_url = os.environ.get("DATABASE_URL")
    
    # 2. Crash LOUDLY if Railway didn't inject the variable
    if not db_url:
        raise ValueError("🚨 CRITICAL: DATABASE_URL is missing! Railway did not inject the environment variable.")
    
    if "localhost" in db_url:
        print("⚠️ WARNING: DATABASE_URL is evaluating to localhost. Did you commit your .env file?")

    # 3. Handle SQLAlchemy 1.4+ dialect rule
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)

    # 4. Create the engine directly, bypassing alembic.ini completely
    connectable = create_engine(db_url, poolclass=pool.NullPool)

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()