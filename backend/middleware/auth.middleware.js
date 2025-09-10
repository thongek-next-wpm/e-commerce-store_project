import jwt from "jsonwebtoken";
import User from "../models/user.models.js";

export const productsRoute = async (req, res, next) => {
  // Middleware logic here (e.g., authentication, logging, etc.)
  try {
    const accsseeToken = req.cookies.accessToken;
    if (!accsseeToken) {
      return res.status(401).json("Unauthorized - No access token provided");
    }
    try {
      const decdoded = jwt.verify(
        accsseeToken,
        process.env.ACCESS_TOKEN_SECRET
      );
      const user = await User.findById(decdoded.userId).select("-password");
      if (!user) {
        return res
          .status(401)
          .json({ message: "Unauthorized - User not found" });
      }
      req.user = user; // Attach user information to the request object
      next(); // Proceed to the next middleware or route handler
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ message: "Unauthorized - Token expired" });
      }
      throw error; // Rethrow other errors to be caught by the outer catch block
    }
  } catch (error) {
    console.error("Error in productsRoute middleware:", error.message);
    return res.status(401).json({ message: "Unauthorized - Invalid token" });
  }
};

export const adminRoute = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next(); // User is admin, proceed to the next middleware or route handler
  } else {
    return res.status(403).json({ message: "Forbidden - Admins only" });
  }
};
