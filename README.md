# Personalized Medicine Recommending System

A production-oriented medicine recommendation app with a Flask JSON API, JWT auth, SQLite/PostgreSQL storage, TF-IDF similarity search, and a React + Vite frontend.

## Features

- TF-IDF medicine matching with Porter stemming and cached cosine similarity
- Fuzzy fallback for partial medicine-name matches
- JWT auth with refresh-cookie support, logout blocklist, and role-based admin checks
- Search history, bookmarks, and medicine request submissions persisted in the database
- Admin moderation for medicine requests plus usage stats
- React UI with protected routes, live autocomplete, GSAP animations, and Lenis smooth scrolling

## Project Layout

- `app.py` - production entrypoint for Gunicorn
- `backend/` - Flask app factory, models, routes, and recommender service
- `frontend/` - React + Vite app
- `medicine.csv` - medicine dataset used by the recommender

## Backend API

All application routes are served under `/api/...`.

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/refresh`
- `GET /api/auth/me`
- `GET /api/medicines/`
- `POST /api/medicines/search`
- `GET /api/medicines/<name>`
- `GET /api/medicines/conditions`
- `GET /api/medicines/conditions/<condition>`
- `GET /api/user/history`
- `DELETE /api/user/history`
- `GET /api/user/bookmarks`
- `POST /api/user/bookmarks`
- `DELETE /api/user/bookmarks/<name>`
- `POST /api/requests/`
- `GET /api/admin/requests`
- `PATCH /api/admin/requests/<id>`
- `GET /api/admin/stats`

## Environment

Copy `.env.example` to `.env` and set:

- `SECRET_KEY`
- `JWT_SECRET_KEY`
- `DATABASE_URL`
- `ADMIN_USERNAME`
- `CORS_ORIGINS`
- `MEDICINE_CSV_PATH`

For the frontend, copy `frontend/.env.example` to `frontend/.env` if you need a custom API base URL.

## Local Development

### 1. Backend
```bash
pip install -r requirements.txt
python app.py
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

The React app runs on `http://localhost:5173` and proxies API calls to the Flask backend.

### 3. Windows one-command dev launch
```powershell
.\dev.ps1
```

This opens the Flask API and the Vite frontend in separate PowerShell windows.

## Production

Build the frontend:
```bash
cd frontend
npm run build
```

Run the backend with Gunicorn:
```bash
gunicorn app:app --workers 4
```

In production, Flask serves the built React app from `frontend/dist`.

## Notes

- Passwords are hashed with `werkzeug.security`.
- CSRF protection is enabled on state-changing requests.
- Search results include a `match_score` percentage.
- Autocomplete uses the full medicine list from the dataset.
