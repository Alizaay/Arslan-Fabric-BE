# Arsalan Fabrics API (Backend)

Standalone **Node.js + Express + MongoDB** API for the storefront and Atelier Portal.

The user website and admin UI live in the **frontend repository** (`../frontend`).

## Setup

```bash
npm install
cp .env.example .env
npm run seed
npm run dev
```

API base URL: `http://localhost:5000/api`

## Environment

| Variable | Purpose |
|----------|---------|
| `PORT` | API port (default 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Auth token secret |
| `CORS_ORIGIN` | Comma-separated frontend URLs (e.g. `http://localhost:3000`) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Seeded admin login |
| `CUSTOMER_DEMO_*` | Seeded demo customer |

## Scripts

- `npm run dev` — watch mode
- `npm start` — production
- `npm run seed` — reset demo data

## Deploy

Deploy this repo alone (Railway, Render, VPS). Set `CORS_ORIGIN` to your live storefront URL(s).
