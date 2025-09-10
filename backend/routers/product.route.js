import express from "express";
import { getAllProducts } from "../controllers/product.controller.js";
import { productsRoute, adminRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", productsRoute, adminRoute, getAllProducts);

export default router;
