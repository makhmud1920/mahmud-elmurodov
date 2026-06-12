# Portfolio backend — Cloud Run uchun konteyner
FROM python:3.12-slim

# Python sozlamalari (toza loglar, .pyc fayllarsiz)
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# Avval faqat requirements — Docker cache'dan unumli foydalanish uchun
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Qolgan kod
COPY . .

# Cloud Run PORT muhit o'zgaruvchisini beradi (standart 8080)
ENV PORT=8080
EXPOSE 8080

# 0.0.0.0 — konteyner tashqaridan ko'rinishi uchun majburiy
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}"]
