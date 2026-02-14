# Niche City Tour Guiding System

Full-stack semester project for CSE471. This repo contains:

- `server/` Express + MongoDB backend
- `client/` Next.js + Tailwind frontend
- `flask_api/` Flask + MongoDB backend for Vercel deployment

## Quick start

### 1) Backend

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

Optional seed data:

```bash
npm run seed
```

### 2) Frontend (Next.js)

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

Frontend default URL: `http://localhost:3000`  
Backend default URL: `http://localhost:5000`

## Default seed accounts

- Admin: `admin@nichecity.com` / `Admin123!`
- Guide: `guide@nichecity.com` / `Guide123!`
- Tourist: `tourist@nichecity.com` / `User123!`

## Key API routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/tours`
- `POST /api/tours`
- `PATCH /api/tours/:id/status` (admin)
- `POST /api/bookings`
- `GET /api/bookings/my`
- `GET /api/bookings/guide`
- `POST /api/reviews`
- `GET /api/admin/guides/pending`

## Notes

- Guides need admin approval before logging in.
- Tours created by guides are marked `pending` until admin approval.
- Bookings are capacity-checked per slot.

## Deploy Flask backend on Vercel

The `flask_api/` folder is deployment-ready for Vercel.

1. Create a new Vercel project and set root directory to `flask_api`.
2. Add environment variables in Vercel project settings:
   - `MONGO_URI`
   - `MONGO_DB`
   - `JWT_SECRET`
3. Deploy the project.

Your API base URL will be:

`https://<your-backend-project>.vercel.app/api`

## Connect frontend to Flask backend

In `client/.env` set:

`NEXT_PUBLIC_API_URL=https://<your-backend-project>.vercel.app/api`

Then redeploy frontend (or run locally with `npm run dev`).
