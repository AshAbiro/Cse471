# Niche City Tour Guiding System

Full-stack semester project for CSE471. This repo contains:

- `server/` Express + MongoDB backend
- `client/` Next.js + Tailwind frontend

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
