import { pool } from "../database/postgres.js";

const RENEWAL_DAYS = { daily: 1, weekly: 7, monthly: 30, yearly: 365 };

/** Map DB row to app shape (snake_case -> camelCase, id -> _id) */
function toSubscription(row) {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    user: row.user_id,
    userId: row.user_id,
    name: row.name,
    company: row.company,
    price: parseFloat(row.price),
    currency: row.currency,
    details: row.details,
    frequency: row.frequency,
    category: row.category,
    paymentMethod: row.payment_method,
    status: row.status,
    startDate: row.start_date,
    renewalDate: row.renewal_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function computeRenewalDate(startDate, frequency) {
  if (!frequency || !RENEWAL_DAYS[frequency]) return null;
  const d = new Date(startDate);
  d.setDate(d.getDate() + RENEWAL_DAYS[frequency]);
  return d.toISOString().slice(0, 10);
}

export async function create(data) {
  const userId = data.user || data.userId;
  const startDate = data.startDate ? new Date(data.startDate).toISOString().slice(0, 10) : null;
  let renewalDate = data.renewalDate
    ? new Date(data.renewalDate).toISOString().slice(0, 10)
    : computeRenewalDate(startDate, data.frequency);
  let status = data.status || "active";
  if (renewalDate && new Date(renewalDate) < new Date()) status = "expired";

  const { rows } = await pool.query(
    `INSERT INTO subscriptions (
      user_id, name, company, price, currency, details, frequency, category, payment_method, status, start_date, renewal_date
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING id, user_id, name, company, price, currency, details, frequency, category, payment_method, status, start_date, renewal_date, created_at, updated_at`,
    [
      userId,
      data.name,
      data.company,
      data.price,
      data.currency || "USD",
      data.details || null,
      data.frequency || null,
      data.category,
      data.paymentMethod,
      status,
      startDate,
      renewalDate,
    ]
  );
  return toSubscription(rows[0]);
}

export async function findById(id) {
  const { rows } = await pool.query(
    `SELECT id, user_id, name, company, price, currency, details, frequency, category, payment_method, status, start_date, renewal_date, created_at, updated_at
     FROM subscriptions WHERE id = $1`,
    [id]
  );
  return toSubscription(rows[0] || null);
}

export async function findByUserId(userId) {
  const { rows } = await pool.query(
    `SELECT id, user_id, name, company, price, currency, details, frequency, category, payment_method, status, start_date, renewal_date, created_at, updated_at
     FROM subscriptions WHERE user_id = $1 ORDER BY renewal_date ASC NULLS LAST`,
    [userId]
  );
  return rows.map(toSubscription);
}

export async function findReminders(userId) {
  const now = new Date().toISOString().slice(0, 10);
  const inFiveDays = new Date();
  inFiveDays.setDate(inFiveDays.getDate() + 5);
  const end = inFiveDays.toISOString().slice(0, 10);
  const { rows } = await pool.query(
    `SELECT id, user_id, name, company, price, currency, details, frequency, category, payment_method, status, start_date, renewal_date, created_at, updated_at
     FROM subscriptions
     WHERE user_id = $1 AND status = 'active' AND renewal_date IS NOT NULL AND renewal_date >= $2 AND renewal_date <= $3
     ORDER BY renewal_date ASC`,
    [userId, now, end]
  );
  return rows.map(toSubscription);
}

const CAMEL_TO_SNAKE = {
  paymentMethod: "payment_method",
  startDate: "start_date",
  renewalDate: "renewal_date",
};

export async function update(id, data) {
  const allowed = [
    "name", "company", "price", "currency", "details", "frequency", "category",
    "paymentMethod", "status", "startDate", "renewalDate",
  ];
  const updates = [];
  const values = [];
  let i = 1;
  for (const key of allowed) {
    const dbKey = CAMEL_TO_SNAKE[key] || key;
    let val = data[key];
    if (val === undefined) continue;
    if (dbKey === "start_date" || dbKey === "renewal_date") {
      val = val instanceof Date ? val.toISOString().slice(0, 10) : String(val).slice(0, 10);
    }
    updates.push(`${dbKey} = $${i}`);
    values.push(val);
    i++;
  }
  if (updates.length === 0) return findById(id);
  updates.push("updated_at = NOW()");
  values.push(id);
  const { rows } = await pool.query(
    `UPDATE subscriptions SET ${updates.join(", ")} WHERE id = $${i} RETURNING id, user_id, name, company, price, currency, details, frequency, category, payment_method, status, start_date, renewal_date, created_at, updated_at`,
    values
  );
  return toSubscription(rows[0] || null);
}

export async function remove(id) {
  const { rowCount } = await pool.query("DELETE FROM subscriptions WHERE id = $1", [id]);
  return rowCount > 0;
}

export default { create, findById, findByUserId, findReminders, update, remove };
