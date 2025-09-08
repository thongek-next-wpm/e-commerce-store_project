import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

//router
import authRouters from "./routers/auth.route.js";
import { connectDB } from "./lib/database.js";
import productRouters from "./routers/product.route.js";

//environment variables

dotenv.config();
const app = express();
const PORT = process.env.PORT || 6379;

//allows you to parse the body of the reqest
app.use(express.json());
app.use(cookieParser());

//authentication
app.use("/api/auth", authRouters);
app.use("/api/products", productRouters);

app.listen(PORT, () => {
  console.log("Server is running on http://localhost:" + PORT);
  connectDB();
});
