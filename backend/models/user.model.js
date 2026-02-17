import { pool } from "../database/postgres.js";

/** Map DB row to app shape (id -> _id for API compatibility) */
function toUser(row) {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    name: row.name,
    email: row.email,
    password: row.password,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function findById(id) {
  const { rows } = await pool.query(
    "SELECT id, name, email, password, created_at, updated_at FROM users WHERE id = $1",
    [id]
  );
  return toUser(rows[0] || null);
}

export async function findByEmail(email) {
  const normalized = String(email).trim().toLowerCase();
  const { rows } = await pool.query(
    "SELECT id, name, email, password, created_at, updated_at FROM users WHERE email = $1",
    [normalized]
  );
  return toUser(rows[0] || null);
}

export async function create({ name, email, password }) {
  const normalized = String(email).trim().toLowerCase();
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, password, created_at, updated_at`,
    [String(name).trim(), normalized, password]
  );
  return toUser(rows[0]);
}

export async function findAll() {
  const { rows } = await pool.query(
    "SELECT id, name, email, created_at, updated_at FROM users ORDER BY created_at DESC"
  );
  return rows.map((r) => ({
    _id: r.id,
    id: r.id,
    name: r.name,
    email: r.email,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

export default { findById, findByEmail, create, findAll };
