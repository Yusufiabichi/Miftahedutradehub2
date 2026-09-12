import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import pool from "../config/db.js";

dotenv.config();

const [, , rawEmail, password] = process.argv;
const email = rawEmail?.trim().toLowerCase();

if (!email || !password) {
  console.error("Usage: npm run create-admin -- <email> <password>");
  process.exitCode = 1;
} else {
  try {
    const passwordHash = await bcrypt.hash(password, 12);
    await pool.execute(
      `INSERT INTO admin_users (email, password_hash)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), is_active = 1`,
      [email, passwordHash],
    );
    console.log(`Admin user ready: ${email}`);
  } catch (error) {
    console.error(`Unable to create admin user: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}