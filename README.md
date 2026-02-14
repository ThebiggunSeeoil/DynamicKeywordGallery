# Gallery SPA (Node.js + MongoDB + React)

Single-page gallery with infinite scroll and hashtag filtering. Backend is Node.js + Express + MongoDB, frontend is Vite + React.

## Quick start

### 1) Backend

```bash
cd backend
npm install
cp .env.example .env
# update MONGODB_URI if needed
# set JWT_SECRET in .env
npm run seed
npm run dev
```

API will be at `http://localhost:8000/api/images`.
Swagger UI: `http://localhost:8000/api/docs`

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL (usually `http://localhost:5173`).

## API

`GET /api/images?limit=20&cursor=ID&keyword=tag`

`POST /api/auth/register`

```json
{ "username": "demo", "password": "password123" }
```

`POST /api/auth/login`

```json
{ "username": "demo", "password": "your-password" }
```

Response:

```json
{
  "items": [
    {
      "id": "...",
      "url": "https://placehold.co/400x520",
      "width": 400,
      "height": 520,
      "keywords": ["travel", "city"]
    }
  ],
  "next_cursor": "..."
}
```

## Notes

- Infinite scroll uses a cursor (`_id > cursor`) for pagination.
- Clicking a hashtag filters the gallery by keyword.
- Seed script replaces existing images with placeholder items.
- JWT protects `/api/images`. Register/login from the UI to get a token.
- Swagger UI is available at `/api/docs`.
