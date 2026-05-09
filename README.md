# SubTrack - Subscription Tracker

SubTrack is a full-stack subscription management application that helps users track recurring payments, renewal dates, payment methods, subscription status, and upcoming renewals from one authenticated dashboard. The app is built with a Next.js frontend, an Express REST API, and a PostgreSQL database running through Docker.

The main goal of the project is simple: give users one place to see what they are paying for, when each subscription renews, and which renewals need attention soon.

## What The Project Does

SubTrack supports the complete subscription tracking workflow:

- Users can create an account and sign in securely.
- Authenticated users can add subscriptions with name, company, price, currency, category, frequency, payment method, start date, and notes.
- The backend automatically calculates renewal dates when a renewal date is not manually supplied.
- The dashboard lists all subscriptions sorted by renewal date.
- Subscriptions due within the next 5 days are highlighted in a dedicated reminder section.
- Users can edit, update, cancel, expire, or delete subscriptions.
- The API protects user subscription records so users can only access records they own.

## Tech Stack

### Frontend

- Next.js 14 with the App Router
- React 18
- TypeScript
- Tailwind CSS
- Local storage based auth session persistence
- Centralized API helper for authenticated requests

### Backend

- Node.js
- Express.js
- PostgreSQL
- `pg` connection pooling
- JWT authentication
- bcrypt password hashing
- Arcjet shield, bot detection, and token-bucket rate limiting
- Centralized error middleware

### Infrastructure

- Docker Compose for PostgreSQL 16
- SQL initialization script for repeatable local database setup
- Environment-based configuration for backend secrets and database connection

## Project Structure

```text
subscription-tracker/
|-- backend/
|   |-- app.js
|   |-- config/
|   |   |-- arcjet.js
|   |   `-- env.js
|   |-- controllers/
|   |   |-- auth.controller.js
|   |   |-- subscription.controller.js
|   |   `-- user.controller.js
|   |-- database/
|   |   |-- init.sql
|   |   `-- postgres.js
|   |-- middlewares/
|   |   |-- arcjet.middleware.js
|   |   |-- auth.middleware.js
|   |   `-- error.middleware.js
|   |-- models/
|   |   |-- subscription.model.js
|   |   `-- user.model.js
|   `-- routes/
|       |-- auth.routes.js
|       |-- subscription.routes.js
|       `-- user.routes.js
|-- frontend/
|   |-- src/
|   |   |-- app/
|   |   |   |-- dashboard/
|   |   |   |   |-- edit/[id]/page.tsx
|   |   |   |   |-- new/page.tsx
|   |   |   |   `-- page.tsx
|   |   |   |-- login/page.tsx
|   |   |   |-- signup/page.tsx
|   |   |   |-- layout.tsx
|   |   |   `-- page.tsx
|   |   |-- context/AuthContext.tsx
|   |   `-- lib/api.ts
|   |-- package.json
|   `-- tailwind.config.ts
|-- docker-compose.yml
`-- README.md
```

## How It Is Built

### 1. Database Layer

The database is PostgreSQL 16, started through Docker Compose. The schema is defined in `backend/database/init.sql` and is automatically applied when the database container is created.

The database has two main tables:

- `users`: stores account identity, email, hashed password, and timestamps.
- `subscriptions`: stores each subscription and links it to a user with a foreign key.

Important database constraints are handled at the SQL level:

- Unique emails prevent duplicate accounts.
- Subscription prices must be greater than or equal to `0`.
- Currency is restricted to `USD`, `EUR`, and `BDT`.
- Frequency is restricted to `daily`, `weekly`, `monthly`, and `yearly`.
- Status is restricted to `active`, `cancelled`, and `expired`.
- Categories are restricted to 8 supported values.
- Deleting a user cascades and deletes that user's subscriptions.

The database also includes indexes for high-value lookup paths:

- `idx_users_email`
- `idx_subscriptions_user_id`
- `idx_subscriptions_renewal_date`
- `idx_subscriptions_status`

These indexes align with the app's most common operations: signing in by email, loading a user's dashboard, finding upcoming renewals, and filtering active subscriptions.

### 2. Backend API Layer

The backend is an Express application mounted under `/api/v1`.

Request flow:

1. CORS allows the configured frontend origin.
2. JSON and URL-encoded request bodies are parsed.
3. Arcjet checks requests for shielding, bot detection, and rate limiting.
4. Routes pass requests into controllers.
5. Controllers call model functions.
6. Model functions query PostgreSQL through the shared connection pool.
7. Centralized error middleware returns consistent JSON errors.

The PostgreSQL pool is configured with:

- Maximum connections: `20`
- Idle timeout: `30` seconds
- Connection timeout: `2` seconds

### 3. Authentication Layer

Authentication uses JWTs and bcrypt:

1. During sign up, the backend checks whether the email already exists.
2. The password is hashed with bcrypt using a salt round value of `10`.
3. The user is inserted into PostgreSQL.
4. A JWT is signed with the user's id.
5. The frontend stores the token and user profile in local storage.
6. Authenticated API calls attach the token as a `Bearer` token.
7. Protected routes verify the token and load the current user before continuing.

### 4. Subscription Logic

Subscription creation accepts user input from the dashboard form. If the frontend does not provide a manual renewal date, the backend computes one from the start date and frequency:

- Daily: `+1 day`
- Weekly: `+7 days`
- Monthly: `+30 days`
- Yearly: `+365 days`

The reminder endpoint finds active subscriptions where:

- The subscription belongs to the authenticated user.
- The subscription has a renewal date.
- The renewal date is today or within the next 5 days.
- The subscription status is `active`.

This creates a practical renewal-alert workflow without needing a background job or external notification service.

### 5. Frontend Layer

The frontend is built with Next.js App Router pages:

- `/`: landing page with auth-aware call to action.
- `/signup`: create account form.
- `/login`: sign in form.
- `/dashboard`: authenticated subscription dashboard.
- `/dashboard/new`: create subscription form.
- `/dashboard/edit/[id]`: edit subscription form.

The frontend uses a shared API client in `frontend/src/lib/api.ts`. This keeps auth headers, JSON parsing, and error handling in one place. The `AuthContext` stores the current user and token, hydrates from local storage after mount, and provides logout behavior across the app.

## Main Features

### Account Management

- Register new user accounts.
- Sign in with email and password.
- Persist auth state across page refreshes.
- Sign out from the home page or dashboard.

### Subscription Dashboard

- View all subscriptions in one place.
- See subscription name, company, price, billing frequency, renewal date, notes, and status.
- Highlight subscriptions due within 5 days.
- Edit subscription details.
- Delete subscriptions directly from the dashboard.

### Renewal Tracking

- Automatic renewal-date calculation based on billing frequency.
- Upcoming renewal endpoint designed specifically for reminders.
- Renewal list sorted by soonest due date.

### Data Validation

- Frontend validates required fields and valid prices before submission.
- Database constraints enforce valid currencies, categories, statuses, prices, and user relationships.
- Backend error middleware handles duplicate records, missing values, invalid relationships, and generic server errors.

### Security And Abuse Protection

- Passwords are never stored as plain text.
- JWTs protect subscription routes.
- Subscription ownership checks prevent users from reading, editing, or deleting another user's records.
- Arcjet adds request shielding, bot detection, and token-bucket rate limiting.
- Rate limit configuration uses a bucket capacity of `10` tokens, refilling `5` tokens every `10` seconds per IP.

## API Documentation

Base URL:

```text
http://localhost:<BACKEND_PORT>/api/v1
```

The frontend currently defaults to:

```text
http://localhost:5500/api/v1
```

You can override this with `NEXT_PUBLIC_API_URL`.

### Auth Routes

| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| POST | `/auth/sign-up` | Create a new account | No |
| POST | `/auth/sign-in` | Sign in and receive a JWT | No |
| POST | `/auth/sign-out` | Return a sign-out response | No |

### User Routes

| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| GET | `/users` | List users without passwords | No |
| GET | `/users/:id` | Get one user without password | Yes |

### Subscription Routes

| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| GET | `/subscriptions` | List current user's subscriptions | Yes |
| GET | `/subscriptions/reminders` | List active subscriptions due within 5 days | Yes |
| POST | `/subscriptions` | Create a subscription | Yes |
| GET | `/subscriptions/:id` | Get one owned subscription | Yes |
| PUT | `/subscriptions/:id` | Update one owned subscription | Yes |
| DELETE | `/subscriptions/:id` | Delete one owned subscription | Yes |

### Subscription Fields

| Field | Type | Notes |
| --- | --- | --- |
| `name` | string | Subscription display name |
| `company` | string | Company being paid |
| `price` | number | Must be `0` or greater |
| `currency` | string | `USD`, `EUR`, or `BDT` |
| `details` | string | Optional notes, up to 500 characters |
| `frequency` | string | `daily`, `weekly`, `monthly`, or `yearly` |
| `category` | string | One of 8 supported categories |
| `paymentMethod` | string | Card, bank, wallet, or payment note |
| `status` | string | `active`, `cancelled`, or `expired` |
| `startDate` | date | Required |
| `renewalDate` | date | Optional; auto-calculated if omitted |

## Local Setup

### Prerequisites

- Node.js
- npm
- Docker Desktop

### 1. Start PostgreSQL

From the project root:

```bash
docker compose up -d postgres
```

Docker Compose starts PostgreSQL with:

```text
Container: subscription-tracker-db
Database:  subscription_tracker
User:      subtrack
Password:  subtrack_secret
Host port: 5433
DB port:   5432
```

Use this local connection string in the backend environment file:

```text
DATABASE_URL=postgresql://subtrack:subtrack_secret@localhost:5433/subscription_tracker
```

If the database volume was created with older credentials, reset it:

```bash
docker compose down -v
docker compose up -d postgres
```

### 2. Configure Backend Environment

Create or update `backend/.env.development.local`:

```text
NODE_ENV=development
PORT=5500
DATABASE_URL=postgresql://subtrack:subtrack_secret@localhost:5433/subscription_tracker
JWT_SECRET=replace_with_a_strong_secret
JWT_EXPIRES_IN=7d
ARCJET_KEY=replace_with_arcjet_key
ARCJET_ENV=development
FRONTEND_URL=http://localhost:3000
```

The backend reads environment variables from:

```text
backend/.env.<NODE_ENV>.local
```

### 3. Install And Run Backend

```bash
cd backend
npm install
npm run dev
```

The API runs on the `PORT` configured in the backend environment file.

### 4. Configure Frontend Environment

Create or update `frontend/.env.local`:

```text
NEXT_PUBLIC_API_URL=http://localhost:5500
```

### 5. Install And Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

## How To Use The App

1. Open the frontend in the browser.
2. Create a new account from the signup page.
3. After signup, the app stores the JWT and redirects to the dashboard.
4. Click `Add subscription`.
5. Enter subscription details such as price, frequency, category, start date, and payment method.
6. Submit the form.
7. View the subscription on the dashboard.
8. If the renewal date is within the next 5 days, it appears in the reminder section.
9. Use `Edit` to update the subscription or `Delete` to remove it.

## Realistic Project Metrics

These metrics are grounded in the current implementation and are suitable for portfolio or resume wording:

- Built a full-stack subscription tracker with `11` API routes across auth, user, and subscription resources.
- Implemented `6` protected subscription endpoints covering create, read, update, delete, and renewal reminders.
- Designed a PostgreSQL schema with `2` relational tables, UUID primary keys, foreign-key ownership, cascade deletes, and `4` targeted indexes.
- Added a renewal reminder query that filters active subscriptions due within a rolling `5-day` window.
- Supported `4` billing frequencies, `3` currencies, `3` subscription statuses, and `8` subscription categories.
- Secured authentication with JWT authorization and bcrypt password hashing using `10` salt rounds.
- Added API abuse protection with Arcjet shield, bot detection, and token-bucket rate limiting.
- Configured PostgreSQL pooling with up to `20` concurrent database connections.
- Built `6` main frontend routes for landing, signup, login, dashboard, create subscription, and edit subscription flows.
- Centralized API communication through a typed frontend helper to keep authenticated requests consistent.

## Resume-Ready Summary

Use this version when you want a concise resume bullet:

```text
Built SubTrack, a full-stack subscription management app using Next.js, Express, PostgreSQL, JWT auth, and Docker; implemented 11 REST API routes, 6 protected subscription CRUD/reminder endpoints, PostgreSQL indexing for user and renewal-date lookups, bcrypt password hashing, Arcjet rate limiting, and a 5-day renewal reminder workflow.
```

Alternative shorter version:

```text
Developed a Next.js, Express, and PostgreSQL subscription tracker with JWT auth, Dockerized database setup, protected CRUD APIs, 5-day renewal reminders, indexed SQL queries, and Arcjet rate limiting for request protection.
```

## Why This Project Stands Out

SubTrack is stronger than a simple CRUD demo because it includes real product concerns:

- Authentication and protected ownership checks.
- SQL constraints that preserve data quality.
- Renewal calculations tied to billing frequency.
- Reminder logic based on date windows.
- Abuse protection and rate limiting.
- Dockerized local database setup.
- Clean separation between frontend, API controllers, models, middleware, and database schema.

The result is a practical finance/productivity application that demonstrates full-stack engineering fundamentals: data modeling, authentication, API design, UI flows, validation, security, and local infrastructure.

## Future Improvements

Good next steps for the project:

- Add automated backend tests for auth, ownership checks, and reminder queries.
- Add email or push notifications for upcoming renewals.
- Add monthly and yearly spending summaries.
- Add filters by category, status, currency, and payment method.
- Add charts for recurring spend trends.
- Move token storage to an HTTP-only cookie based session flow for stronger browser security.
- Add pagination for large subscription lists.
- Add deployment documentation for production hosting.
