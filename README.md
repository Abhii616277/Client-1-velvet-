# Velvet Touch Spa

## Local Development

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs locally at http://localhost:5173 and reads the API base URL from the Vite env file.

### Backend

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

The backend API runs locally at http://localhost:8000.

### Local database

For local development, SQLite is supported through the `DATABASE_URL` environment variable. The app keeps SQLite for easy local setup while allowing PostgreSQL for production without changing application code.

## Environment Variables

Create local environment files without committing secrets:

- `backend/.env`
- `frontend/.env`
- optionally a root `.env.example` template for reference

Example values:

```env
# backend/.env
DATABASE_URL=sqlite:///./velvet_touch_spa.db
JWT_SECRET_KEY=changeme
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
FRONTEND_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173
API_BASE_URL=http://localhost:8000
ADMIN_EMAIL=admin@velvettouchspa.in
ADMIN_PASSWORD=change-me
```

```env
# frontend/.env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## Production Deployment

### Architecture

- Frontend: Netlify static site
- Backend: FastAPI deployed on a separate production host
- Database: PostgreSQL, using `DATABASE_URL` from the backend environment
- Domain pattern: frontend on `https://example.com` and API on `https://api.example.com`

The frontend and backend may use separate domains or subdomains. The application uses environment-based configuration so the site can move from localhost, to a Netlify URL, to a custom paid domain without requiring application code changes.

### Frontend deployment (Netlify)

Build the frontend as a static Vite app and deploy the generated `dist/` folder to Netlify.

Required env variable:

```env
VITE_API_BASE_URL=https://api.example.com/api/v1
```

Add a Netlify configuration file if required by the deployment flow:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Backend deployment

Deploy the FastAPI service on a standard Python hosting provider such as Render, Railway, Fly.io, or a VPS with Uvicorn.

Required backend env variables:

```env
DATABASE_URL=postgresql+psycopg://USER:PASSWORD@HOST:5432/DB_NAME
JWT_SECRET_KEY=your-long-production-secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
FRONTEND_URL=https://example.com
CORS_ORIGINS=https://example.com
API_BASE_URL=https://api.example.com
ADMIN_EMAIL=admin@velvettouchspa.in
ADMIN_PASSWORD=strong-admin-password
```

Run production startup with:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Do not use development reload settings in production.

### PostgreSQL requirements

Production must use PostgreSQL for persistent data. The app is designed to select the database from `DATABASE_URL`, which means the same application code can work with either SQLite locally or PostgreSQL in production. Keep the database connection string in the runtime environment and never hard-code it in the app.

### Security notes

- Keep all secrets in environment variables.
- Use HTTPS for all production domains.
- Keep admin endpoints protected by JWT bearer authentication.
- Use the existing password hashing flow for the admin account.
- Do not expose backend secrets through frontend variables.
- Do not enable debug mode in production.

### Migrations

The project already includes Alembic support. For production schema changes, use Alembic migrations rather than recreating tables or deleting data.

## Deployment Checklist

- Frontend deployed on Netlify with `VITE_API_BASE_URL` set
- Backend deployed on separate host with `DATABASE_URL` pointing to PostgreSQL
- CORS configured for the real frontend domain
- JWT secret and admin password stored in environment variables
- Health endpoint available at `/health`
- Existing admin auth, booking, service, and contact flows remain intact
