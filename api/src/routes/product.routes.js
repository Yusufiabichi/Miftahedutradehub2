import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
} from "../controllers/product.controller.js";

const router = Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", createProduct);
router.delete("/:id", deleteProduct);

export default router;
