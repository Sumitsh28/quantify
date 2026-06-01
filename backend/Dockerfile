FROM python:3.11-slim

# Prevent Python from writing pyc files to disk and buffering stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Create a non-root user and group
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Install system dependencies if required (e.g., for psycopg2)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY requirements.txt .
# Create a dummy requirements.txt if not exists to avoid copy failure
RUN if [ ! -f requirements.txt ]; then touch requirements.txt; fi
RUN pip install --no-cache-dir -r requirements.txt
# Ensure gunicorn and uvicorn are installed
RUN pip install --no-cache-dir gunicorn uvicorn fastapi

# Copy the application code
COPY . .

# Make start.sh executable and change ownership
RUN chmod +x start.sh && chown -R appuser:appuser /app

# Switch to the non-root user
USER appuser

EXPOSE 8000

# Start script handles migrations and starts gunicorn
CMD ["./start.sh"]
