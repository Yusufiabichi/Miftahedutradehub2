import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct
} from "../controllers/product.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import multer from "multer";
import path from "path";
import crypto from "crypto";
import fs from "fs";

const uploadDirectory = path.resolve("uploads/products");
fs.mkdirSync(uploadDirectory, { recursive: true });
const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDirectory,
    filename: (_req, file, callback) => {
      const extension = path.extname(file.originalname).toLowerCase();
      callback(null, `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${extension}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    callback(null, file.mimetype.startsWith("image/"));
  },
});

const router = Router();

router.get("/", getProducts);
router.post("/upload", requireAuth, upload.single("image"), (req, res) => {
  if (!req.file) {
    res.status(400).json({ message: "An image file is required" });
    return;
  }

  res.status(201).json({ url: `/uploads/products/${req.file.filename}` });
});
router.get("/:id", getProductById);
router.post("/", requireAuth, createProduct);
router.delete("/:id", requireAuth, deleteProduct);
router.put("/:id", requireAuth, updateProduct);

export default router;
