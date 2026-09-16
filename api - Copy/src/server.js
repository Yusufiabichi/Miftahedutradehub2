import dotenv from "dotenv";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import app from "./app.js";
import { testDbConnection } from "./config/db.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5000;

// Serve static files (your built frontend)
app.use(express.static(path.join(__dirname, "client/out")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/out", "index.html"));
});

const startServer = async () => {
  const isDbConnected = await testDbConnection();

  if (!isDbConnected) {
    console.error("[Server] MySQL unavailable.");
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`[Server] Listening on port ${PORT}`);
  });
};

startServer();