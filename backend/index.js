import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

//router
import authRouters from "./routers/auth.route.js";
import { connectDB } from "./lib/database.js";
import productRoutes from "./routers/product.route.js";
import cartRoutes from "./routers/cart.route.js";

//environment variables

// const MONGO_URI = process.env.MONGO_URI;
//database connection string
// const PORT = process.env.PORT || 6379;
//server port
//middleware to parse cookies
//middleware to parse json data/body of the request
//routes for authentication
//routes for products
//routes for cart
//start the server and listen on the specified port
//connect to the database

dotenv.config();
const app = express();
const PORT = process.env.PORT || 6379;

//allows you to parse the body of the reqest
app.use(express.json());
app.use(cookieParser());

//authentication
app.use("/api/auth", authRouters);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);


app.listen(PORT, () => {
  console.log("Server is running on http://localhost:" + PORT);
  connectDB();
});
