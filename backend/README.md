# AI Productivity Engine (Backend)

FastAPI backend for remote-work activity tracking with:
- exact idle/isolation episode tracking
- productivity score calculation
- burnout signal detection
- anomaly detection using Isolation Forest (with fallback)

## Core Logic

### Isolation
Idle time is computed from exact episode durations:

`total_isolation_minutes = sum(idle_end - idle_start)`

Only episodes `>= 5 minutes` are accepted by default.

### Productivity Score (v1)

All feature values are normalized to `0..1`.

`score = 100 * (0.4*deep_work + 0.3*engagement + 0.3*task_completion - 0.2*context_switch)`

### Burnout Signals

Rolling lookback analysis on:
- late-night activity
- weekend activity
- high engagement with low breaks
- declining deep work trend

### Anomaly Detection

Daily vectors are scored with:
- `IsolationForest` when enough history exists
- z-score fallback when history is small / sklearn unavailable

## API Endpoints

### Auth

### 1) Register
`POST /auth/register`

```json
{
  "username": "kanwar",
  "email": "kanwar@example.com",
  "password": "StrongPass123",
  "full_name": "Kanwar Jahanzaib"
}
```

### 2) Login
`POST /auth/login`

```json
{
  "username": "kanwar",
  "password": "StrongPass123"
}
```

Response contains `access_token`.

In Swagger, click `Authorize` and paste only the token value:
`<access_token>`

### 3) Get current user
`GET /auth/me` with header:

`Authorization: Bearer <access_token>`

This returns:

```json
{
  "user_id": "95f7440f-e0eb-4f45-8e17-9f36ddfcf570",
  "username": "kanwar",
  "email": "kanwar@example.com",
  "full_name": "Kanwar Jahanzaib",
  "is_active": true
}
```

Use this `user_id` as the canonical employee/user id in your system.  
Activity endpoints now read user id from the token automatically.

### Protected activity endpoints

### 4) Create idle episode
`POST /activity/idle-episodes`

```json
{
  "idle_started_at": "2026-02-24T10:00:00Z",
  "idle_ended_at": "2026-02-24T10:08:00Z"
}
```

### 5) Create work log
`POST /activity/work-logs`

```json
{
  "session_started_at": "2026-02-24T09:00:00Z",
  "session_ended_at": "2026-02-24T17:00:00Z",
  "active_minutes": 360,
  "deep_work_minutes": 210,
  "context_switch_count": 42,
  "assigned_tasks": 8,
  "completed_tasks": 6,
  "break_minutes": 35,
  "late_night_minutes": 0,
  "weekend_minutes": 0
}
```

### 6) Daily summary
`GET /activity/me/daily-summary?target_date=2026-02-24`

### 7) Burnout report
`GET /activity/me/burnout?end_date=2026-02-24&lookback_days=14`

### 8) Anomaly report
`GET /activity/me/anomaly?target_date=2026-02-24&lookback_days=30`

## Run

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install fastapi uvicorn sqlalchemy pydantic scikit-learn python-jose passlib
uvicorn app.main:app --reload
```

SQLite is used by default (`productivity.db`).  
Set `DATABASE_URL` for PostgreSQL in production.

Set a secure JWT secret in production:

`JWT_SECRET_KEY=<your-strong-secret>`
