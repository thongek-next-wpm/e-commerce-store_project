import User from "../models/user.models.js";
import jwt from "jsonwebtoken";
import { redis } from "../lib/redis.js";

// Function to generate access and refresh tokens
// userId: user's id
// returns: { accessToken, refreshToken }
// accessToken: JWT access token
// refreshToken: JWT refresh token
// expiresIn: access token expires in 15 minutes
// expiresIn: refresh token expires in 7 days
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

// Store refresh token in Redis with an expiration time of 7 days
// await redis.set(`refresh_token:${userId}`, refreshToken, "EX", 7 * 24 * 60 * 60);
// 7 days
// EX: sets the expiration time in seconds
// 7 * 24 * 60 * 60 = 604800 seconds
// userId: user's id
// refreshToken: the refresh token to be stored
// function to store refresh token
const storeRefreshToken = async (userId, refreshToken) => {
  await redis.set(
    `refresh_token:${userId}`,
    refreshToken,
    "EX",
    7 * 24 * 60 * 60
  ); // 7days
};

// Set cookies for access and refresh tokens
// setCookies(res, accessToken, refreshToken);
// httpOnly: true, // prevent XSS attacks, cross site scripting attack
// secure: process.env.NODE_ENV === "production",
// sameSite: "strict", // prevents CSRF attack, cross-site request forgery attack
// maxAge: 15 * 60 * 1000, // 15 minutes
// maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
const setCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true, // prevent XSS attacks, cross site scripting attack
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", // prevents CSRF attack, cross-site request forgery attack
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, // prevent XSS attacks, cross site scripting attack
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", // prevents CSRF attack, cross-site request forgery attack
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// User signup
// POST /api/auth/signup
// Request body: { name: String, email: String, password: String }
// Response: { _id, name, email, role }
// Example request body: { "name": "John Doe", "email": "
export const signup = async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }
    const user = await User.create({ name, email, password });

    // authenticate
    const { accessToken, refreshToken } = generateTokens(user._id);
    await storeRefreshToken(user._id, refreshToken);

    setCookies(res, accessToken, refreshToken);

    res.status(201).json(
      {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      res.status(201).json({ user, message: "User created successfully" })
    );
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: error.message });
  }
};

// User login
// POST /api/auth/login
// Request body: { email: String, password: String }
// Response: { _id, name, email, role }
// Example request body: { "email": "L2yKk@example.com", "password": "password123" }
// Example response: { "_id": "userId", "name": "John Doe", "email": "L2yKk@example.com", "role": "user" }
// If login fails, respond with status 400 and message "Invalid email or password"
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    console.log("Here runs the login:", email);

    if (user && (await user.comparePassword(password))) {
      const { accessToken, refreshToken } = generateTokens(user._id);
      await storeRefreshToken(user._id, refreshToken);
      setCookies(res, accessToken, refreshToken);

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(400).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: error.message });
  }
};

// User logout
// POST /api/auth/logout
// Requires authentication
// Response: { message: "Logged out successfully" }
// Example response: { "message": "Logged out successfully" }
// On logout, clear the accessToken and refreshToken cookies
// and remove the refresh token from Redis
export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      await redis.del(`refresh_token:${decoded.userId}`);
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Refresh access token
// POST /api/auth/refresh-token
// Request: No body required, but requires refreshToken cookie
// Response: { message: "Token refreshed successfully" }
// Example response: { "message": "Token refreshed successfully" }
// If no refresh token is provided, respond with status 401 and message "No refresh token provided"
// If the refresh token is invalid, respond with status 401 and message "Invalid refresh token"
export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const storedToken = await redis.get(`refresh_token:${decoded.userId}`);

    if (storedToken !== refreshToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const accessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.json({ message: "Token refreshed successfully" });
  } catch (error) {
    console.log("Error in refreshToken controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get user profile
// GET /api/auth/profile
// Requires authentication
// Response: { _id, name, email, role }
// Example response: { "_id": "userId", "name": "John Doe", "email": "  "
// If not authenticated, respond with status 401 and message "Not authenticated"
export const getProfile = async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
