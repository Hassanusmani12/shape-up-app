import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";

const protect = asyncHandler(async (req, res, next) => {
  let token;

  token = req.cookies.jwt;

  console.log("protect middleware | cookies present:", !!req.cookies, "| jwt cookie:", token ? "exists (" + token.substring(0, 20) + "...)" : "MISSING");

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.userId).select("-password");

      next();
    } catch (error) {
      console.error("protect middleware | invalid token:", error.message);
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
  } else {
    console.warn("protect middleware | no token found in cookies");
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
});

const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  token = req.cookies.jwt;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.userId).select("-password");
      console.log("optionalAuth: user attached:", req.user?._id?.toString());
    } catch (error) {
      console.log("optionalAuth: invalid token, continuing as guest");
      req.user = undefined;
    }
  } else {
    console.log("optionalAuth: no token, continuing as guest");
    req.user = undefined;
  }

  next();
});

export { protect, optionalAuth };
