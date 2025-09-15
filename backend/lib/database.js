import mongoose from "mongoose";
// import dotenv from "dotenv";
// dotenv.config();
export const connectDB = async () => {
  // Connect to MongoDB
  // Use the connection string from environment variables
  // Make sure to set MONGO_URI in your .env file
  // Example: MONGO_URI=mongodb://localhost:27017/yourdbname
  // Connect to MongoDB
  // Use the connection string from environment variables
  // Make sure to set MONGO_URI in your .env file
  // Example: MONGO_URI=mongodb://localhost:27017/yourdbname
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.log("Error connetion to MongoDB", error.message);
    process.exit(1);
  }
};
