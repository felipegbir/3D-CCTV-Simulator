FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    NOMAD_DATA_ROOT=/data \
    CAMERA_DATABASE=/data/camera_database/camera_database.csv

WORKDIR /app

RUN groupadd --system --gid 10001 vista \
    && useradd --system --uid 10001 --gid vista --home-dir /app vista

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

COPY app.py .
COPY templates ./templates
COPY static ./static

RUN chown -R vista:vista /app

USER vista

EXPOSE 5010

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:5010/api/health', timeout=3)"

CMD ["gunicorn", "--bind", "0.0.0.0:5010", "--workers", "2", "--threads", "4", "--timeout", "120", "--access-logfile", "-", "--error-logfile", "-", "app:app"]
