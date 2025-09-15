import express from "express";
import { productsRoute } from "../middleware/auth.middleware.js";
import { getCoupon, validateCoupon } from "../controllers/coupon.controller.js";

const router = express.Router();

// Sample in-memory storage for coupons
router.get("/", productsRoute, getCoupon);
router.get("/validate", productsRoute, validateCoupon);

export default router;
