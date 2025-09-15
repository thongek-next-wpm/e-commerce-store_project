import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// Configure Cloudinary with credentials from environment variables
// cloud_name: your Cloudinary cloud name
// api_key: your Cloudinary API key
// api_secret: your Cloudinary API secret
// These credentials are required to authenticate your application with Cloudinary
// and allow you to upload, manage, and deliver images and videos
// securely.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
