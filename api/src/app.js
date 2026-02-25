import cors from "cors";
import express from "express";
import blogRoutes from "./routes/blog.routes.js";
import enquiryRoutes from "./routes/enquiry.routes.js";
import productRoutes from "./routes/product.routes.js";
import serviceRoutes from "./routes/service.routes.js";

const app = express();

const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:3000,http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "apikey"],
  }),
);

app.use(express.json());

app.get("/", (_req, res) => {
  res.status(200).json({ message: "API is running" });
});

app.use("/api/blogs", blogRoutes);
app.use("/api/products", productRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/enquiries", enquiryRoutes);

export default app;
