
import dotenv from "dotenv";
import app from "./app.js";
import { testDbConnection } from "./config/db.js";
const path = require('path');

dotenv.config();

const PORT = process.env.PORT || 5000;

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


// Serve static files
app.use(express.static(path.join(__dirname, 'client/out')));

// React route fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/out', 'index.html'));
});

startServer();
