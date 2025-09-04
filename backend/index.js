import express from "express";
import dotenv from "dotenv";

//router
import authRouters from "./routers/auth.route.js";
import { connectDB } from "./lib/database.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 6379;

//allows you to parse the body of the reqest
app.use(express.json());

//authentication
app.use("/api/auth", authRouters);

app.listen(PORT, () => {
  console.log("Server is running on http://localhost:" + PORT);
  connectDB();
});
