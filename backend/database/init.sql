-- Subscription Tracker PostgreSQL schema
-- Run automatically when the Postgres container is first created (docker-entrypoint-initdb.d)

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  company VARCHAR(150) NOT NULL,
  price DECIMAL(12, 2) NOT NULL CHECK (price >= 0),
  currency VARCHAR(3) NOT NULL DEFAULT 'USD' CHECK (currency IN ('USD', 'EUR', 'BDT')),
  details VARCHAR(500),
  frequency VARCHAR(20) CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
  category VARCHAR(50) NOT NULL CHECK (category IN (
    'sports', 'news', 'entertainment', 'lifestyle', 'health', 'technology', 'finance', 'other'
  )),
  payment_method VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  start_date DATE NOT NULL,
  renewal_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions (user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_renewal_date ON subscriptions (renewal_date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions (status);
