import express from "express";
import {
  getAllProducts,
  getFeaturedProducts,
  createProduct,
  deleteProduct,
  getRecommendedProducts,
} from "../controllers/product.controller.js";
import { productsRoute, adminRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", productsRoute, adminRoute, getAllProducts);
router.get("/feature", getFeaturedProducts);
router.get("/recommendations", getRecommendedProducts);
router.post("/", productsRoute, adminRoute, createProduct);
router.delete("/:id", productsRoute, adminRoute, deleteProduct);

export default router;
