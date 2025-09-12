import express from "express";
import {
  getAllProducts,
  getFeaturedProducts,
  createProduct,
  deleteProduct,
  getRecommendedProducts,
  getproductesByCategory,
  toggleFeaturedProduct,
} from "../controllers/product.controller.js";
import { productsRoute, adminRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", productsRoute, adminRoute, getAllProducts);
router.get("/feature", getFeaturedProducts);
router.get("/category/:category", getproductesByCategory);
router.get("/recommendations", getRecommendedProducts);
router.post("/", productsRoute, adminRoute, createProduct);
router.patch("/:id", productsRoute, adminRoute, toggleFeaturedProduct);
router.delete("/:id", productsRoute, adminRoute, deleteProduct);

export default router;
