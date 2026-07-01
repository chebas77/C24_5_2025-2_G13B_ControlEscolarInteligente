FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

# Dependencias de sistema para opencv-headless y psycopg
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY src/requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt daphne

COPY src/ .

# Colectar archivos estáticos (se sirven desde S3/CloudFront en prod)
RUN python manage.py collectstatic --noinput || true

EXPOSE 8000

# Daphne = servidor ASGI oficial de Django Channels (soporta WebSockets)
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "config.asgi:application"]
