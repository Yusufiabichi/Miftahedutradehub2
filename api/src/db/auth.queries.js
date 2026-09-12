import pool from "../config/db.js";

export const findActiveAdminByEmail = async (email) => {
  const [rows] = await pool.execute(
    `SELECT id, email, password_hash, role
     FROM admin_users
     WHERE email = ? AND is_active = 1
     LIMIT 1`,
    [email],
  );

  return rows[0] || null;
};