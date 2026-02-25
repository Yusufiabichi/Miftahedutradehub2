import dotenv from "dotenv";
import app from "./app.js";
import { testDbConnection } from "./config/db.js";

dotenv.config();

const PORT = 5000;

const startServer = async () => {
  const isDbConnected = await testDbConnection();
  if (!isDbConnected) {
    console.error("[Server] Startup aborted because MySQL is unavailable.");
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`[Server] Listening on http://localhost:${PORT}`);
  });
};

startServer();
