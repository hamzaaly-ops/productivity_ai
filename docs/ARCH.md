# Architecture Decision Record: Remote Work Tracker

## 1. System Overview
A full-stack monorepo for tracking remote work sessions, active/idle time, and productivity metrics.

## 2. Database Schema (PostgreSQL)

### Users Table
- `id`: UUID (Primary Key)
- `email`: String (Unique)
- `hashed_password`: String
- `full_name`: String
- `is_active`: Boolean
- `created_at`: DateTime (TZ)

### WorkSessions Table
- `id`: UUID (PK)
- `user_id`: UUID (FK -> Users)
- `start_time`: DateTime (TZ)
- `end_time`: DateTime (TZ, Nullable)
- `status`: Enum (ACTIVE, PAUSED, COMPLETED)
- `project_name`: String (Optional)

### Heartbeats Table (Time-Series)
- `id`: BigInt (PK)
- `session_id`: UUID (FK -> WorkSessions)
- `timestamp`: DateTime (TZ)
- `is_idle`: Boolean
- `meta_data`: JSONB (Stores window title, process name, etc.)

## 3. API Design (FastAPI)
- **Auth:** `/api/v1/auth/login`, `/api/v1/auth/register`
- **Sessions:** - `POST /api/v1/sessions/start`
  - `PATCH /api/v1/sessions/{id}/stop`
  - `GET /api/v1/sessions/history`
- **Tracking:** `POST /api/v1/heartbeat` (Called every 60s by the client)

## 4. Frontend Structure (Next.js 15)
- `/app/(auth)`: Login/Register pages.
- `/app/(dashboard)`: Real-time tracking view, historical charts.
- `/components/ui`: Shadcn primitives.
- `/hooks`: `useWorkSession` for timer logic.
- `/services`: API wrapper using Fetch/Axios.

## 5. Scaling Strategy
- **Database:** Partition the `Heartbeats` table by month as the app grows.
- **Caching:** Use Redis for the "Currently Online" status to avoid heavy DB hits.