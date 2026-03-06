import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const testDbConnection = async () => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();

    console.log("[MySQL] Connected successfully");
    return true;
  } catch (error) {
    console.error("[MySQL] Connection failed:", error.message);
    return false;
  }
};

export default pool;
