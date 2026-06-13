# Portfolio Frontend — Kiberpank

React + Vite + React Three Fiber bilan qurilgan shaxsiy portfolio.
FastAPI backend bilan ishlaydi.

## Ishga tushirish

1. Backend'ni ishga tushiring (portfolio-backend papkasida):
   ```bash
   uvicorn app.main:app --reload
   ```

2. Frontend (shu papkada):
   ```bash
   npm install
   npm run dev
   ```
   Brauzerda: http://localhost:5173

## Sozlash

- `.env` faylida backend manzili: `VITE_API_URL`
- Production'da bu manzilni Render.com backend URL'iga o'zgartiring.

## Tuzilma

```
src/
├── components/      # Har bir bo'lim alohida (Hero, About, Skills...)
│   ├── Scene3D.jsx  # 3D neon sahna (R3F)
│   └── ...
├── lib/api.js       # Backend bilan aloqa
├── index.css        # Kiberpank dizayn tizimi (ranglar shu yerda)
├── App.jsx          # Bo'limlarni yig'adi
└── main.jsx         # Kirish nuqtasi
```

## Tahrirlash

- Ranglar: `src/index.css` ichidagi `:root` o'zgaruvchilari
- CV matni: `src/components/About.jsx`
- Ko'nikmalar ro'yxati: `src/components/Skills.jsx`
- Loyihalar: backend API'dan keladi (admin panel orqali qo'shasiz)
