import express from "express";
import dotenv from "dotenv";

//router
import authRouters from "./routers/auth.route.js";
import { connectDB } from "./lib/database.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5002;

//authentication
app.use("/api/auth", authRouters);

app.listen(PORT, () => {
  console.log("Server is running on http://localhost:" + PORT);
  connectDB();
});
