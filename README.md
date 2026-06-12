# Portfolio Backend

FastAPI + SQLAlchemy backend — shaxsiy portfolio sayt uchun.
Single-admin (ro'yxatdan o'tish yo'q), kuchli himoyali: argon2 parol, JWT httpOnly cookie, CSRF, rate-limit.

## Lokal ishga tushirish

```powershell
pip install -r requirements.txt

# .env yaratish (.env.example dan nusxa oling)
#   SECRET_KEY: py -c "import secrets; print(secrets.token_hex(32))"
#   ADMIN_PASSWORD: kamida 12 belgi

py -m app.seed_admin          # adminni yaratish
py -m uvicorn app.main:app --reload
# http://127.0.0.1:8000/docs
```

## Muhit o'zgaruvchilari (env)

| O'zgaruvchi | Tavsif |
|-------------|--------|
| `SECRET_KEY` | JWT kaliti (majburiy) |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Admin login (kamida 12 belgili parol) |
| `ENVIRONMENT` | `development` yoki `production` |
| `COOKIE_SECURE` | Production'da `true` (HTTPS majburiy) |
| `COOKIE_SAMESITE` | `lax` / `strict` / `none` |
| `FRONTEND_ORIGINS` | CORS uchun frontend manzillari (vergul bilan) |
| `DATABASE_URL` | Bo'sh = SQLite. Postgres: `postgresql://...` |
| `AUTO_SEED_ADMIN` | `true` = startup'da adminni avtomatik yaratish (Cloud Run uchun) |

## Cloud Run'ga deploy (avtomatik)

1. Kod GitHub'ga push qilinadi.
2. Cloud Run → **Continuously deploy from a repository** → GitHub repo ulanadi.
3. Cloud Build har push'da Dockerfile orqali yangi versiyani quradi va deploy qiladi.

Cloud Run'da **environment variables** (yoki Secret Manager) sifatida `SECRET_KEY`,
`ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ENVIRONMENT=production`, `COOKIE_SECURE=true`,
`AUTO_SEED_ADMIN=true`, `DATABASE_URL`, `FRONTEND_ORIGINS` o'rnatiladi.

> ⚠️ SQLite Cloud Run'da saqlanmaydi (har deploy'da nolga tushadi).
> Doimiy ma'lumot uchun tashqi PostgreSQL (`DATABASE_URL`) ishlating.
