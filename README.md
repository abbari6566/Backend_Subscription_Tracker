# Subscription Tracker

Full-stack app to track subscriptions: sign up, sign in, add subscriptions (amount, company, date, details), and get reminders when a subscription is due within 5 days.

## Stack

- **Backend**: Node.js, Express, **PostgreSQL** (with Docker), JWT auth
- **Frontend**: Next.js 14, React 18, Tailwind CSS

## Run locally

### 1. PostgreSQL (Docker)

Start the database:

```bash
# From project root
docker compose up -d postgres
```

This starts PostgreSQL 16 with the schema applied (see `backend/database/init.sql`). Credentials:

- User: `subtrack`
- Password: `subtrack_secret`
- Database: `subscription_tracker`
- Port: `5432`

If you see "password authentication failed", the volume may have been created with different credentials. Reset it: `docker compose down -v` then `docker compose up -d postgres` again.

### 2. Backend

```bash
cd backend
npm install
npm run dev
```

API runs at **http://localhost:5000**.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at **http://localhost:3000**.

### 4. Use the app

1. Open http://localhost:3000
2. Create an account (Sign up)
3. Sign in, then add subscriptions from the dashboard
4. Subscriptions due within 5 days appear in the **Due within 5 days** section
5. Edit or delete subscriptions from the dashboard

## API (backend)

- `POST /api/v1/auth/sign-up` – register
- `POST /api/v1/auth/sign-in` – login
- `GET /api/v1/subscriptions` – list my subscriptions (auth)
- `GET /api/v1/subscriptions/reminders` – list subscriptions due within 5 days (auth)
- `POST /api/v1/subscriptions` – create subscription (auth)
- `GET /api/v1/subscriptions/:id` – get one (auth)
- `PUT /api/v1/subscriptions/:id` – update (auth)
- `DELETE /api/v1/subscriptions/:id` – delete (auth)

Subscription fields: `name`, `company`, `price`, `currency`, `details`, `frequency`, `category`, `paymentMethod`, `startDate`, `renewalDate` (optional, auto-calculated from frequency).
