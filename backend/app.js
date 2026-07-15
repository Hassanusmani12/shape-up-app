import express from "express";
import path from "path";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import session from "express-session";
import passport from "./config/passportConfig.js";

import { fileURLToPath } from "url";

import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import connectDB from "./config/db.js";

// Routes
import userRoutes from "./routes/userRoutes.js";
import userStatusRoutes from "./routes/userStatusRoutes.js";
import UserMealPlanRoutes from "./routes/UserMealPlanRoutes.js";
import workoutRoutes from "./routes/workoutRoutes.js";
import dailyLogRoutes from "./routes/dailyLogRoutes.js";
import reminderRoutes from "./routes/reminderRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import emailRoutes from "./routes/emailRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import nutritionRoutes from "./routes/nutritionRoutes.js";
import authRoutes from "./routes/authRoutes.js";

// ── Diagnostics: verify nutritionRoutes loaded ──
console.log("\n=== NUTRITION IMPORT DIAGNOSTIC ===");
console.log("  nutritionRoutes type:", typeof nutritionRoutes);
console.log("  nutritionRoutes is function (Router):", typeof nutritionRoutes === "function");
console.log("  nutritionRoutes.stack length:", nutritionRoutes?.stack?.length);
if (nutritionRoutes?.stack) {
  nutritionRoutes.stack.forEach((layer) => {
    if (layer.route) {
      console.log(`  Route: ${Object.keys(layer.route.methods).join(",").toUpperCase()} ${layer.route.path}`);
    }
  });
}
console.log("==================================\n");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.join(__dirname, ".env"),
});

const port = process.env.PORT || 5000;

// ── Env diagnostics ──
const apiKey = process.env.OPENROUTER_API_KEY || "";
const apiKeyMasked = apiKey.length >= 12 ? apiKey.slice(0, 12) + "..." : "(short)";
console.log("\n=== ENV DIAGNOSTIC ===");
console.log("  OPENROUTER_API_KEY exists:", !!apiKey);
console.log("  OPENROUTER_API_KEY (first 12):", apiKeyMasked);
console.log("  TEXT_MODEL:", process.env.TEXT_MODEL || "(not set)");
console.log("  IMAGE_MODEL:", process.env.IMAGE_MODEL || "(not set)");
console.log("  PORT:", port);
console.log("  NODE_ENV:", process.env.NODE_ENV || "(not set)");
console.log("=====================\n");

// ── Initialize Express ──
const app = express();

const CORS_ORIGIN = process.env.NODE_ENV === 'production'
  ? 'https://shape-up-app-henna.vercel.app'
  : ['http://localhost:3000', 'https://shape-up-app-henna.vercel.app'];

app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

app.set("trust proxy", 1);

app.use(
  session({
    secret: process.env.SESSION_SECRET || process.env.JWT_SECRET || "fallback-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// ── API Routes ──
app.use("/api/users", userRoutes);
app.use("/api/user", userStatusRoutes);
app.use("/api/user", UserMealPlanRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/daily-logs", dailyLogRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/support", emailRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/nutrition", nutritionRoutes);
app.use("/auth", authRoutes);

// ── Root health check ──
app.get("/", (req, res) => {
  res.send("ShapeUp API is running...");
});

// ── Error handlers ──
app.use(notFound);
app.use(errorHandler);

// ── Start Server (DB failure does NOT crash the server) ──
const startServer = async () => {
  console.log("=============================================");
  console.log("  ShapeUp Backend — Starting up...");
  console.log(`  Port: ${port}`);
  console.log(`  Node Env: ${process.env.NODE_ENV || "development"}`);
  console.log("=============================================");

  await connectDB();

  app.listen(port, () => {
    console.log("\n=============================================");
    console.log(`  ✅ Server is RUNNING on port ${port}`);
    console.log(`  🌐 http://localhost:${port}`);
    console.log(`  🥗 Nutrition API: http://localhost:${port}/api/nutrition`);
    console.log("=============================================\n");
  });
};

const isVercel = process.env.VERCEL === "1";
if (!isVercel) {
  startServer();
}

export default app;
