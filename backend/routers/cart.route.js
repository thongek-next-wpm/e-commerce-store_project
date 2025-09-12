import express from "express";
import {
  getCartProducts,
  removeAllFromCart,
  updateQuantity,
  addToCart,
} from "../controllers/cart.controller.js";
import { productsRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

//controllers
router.get("/", productsRoute, getCartProducts);
router.post("/", productsRoute, addToCart);
router.delete("/", productsRoute, removeAllFromCart);
router.put("/:id", productsRoute, updateQuantity);

export default router;
