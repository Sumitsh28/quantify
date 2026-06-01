#!/bin/sh

# Wait for postgres to be ready
echo "Waiting for PostgreSQL..."
until pg_isready -h db -U postgres -d inventory_db; do
  sleep 1
done
echo "PostgreSQL is ready."

# Run Alembic migrations
echo "Running database migrations..."
alembic upgrade head

# Start Uvicorn
echo "Starting Uvicorn server..."
exec uvicorn main:app --host 0.0.0.0 --port 8000
