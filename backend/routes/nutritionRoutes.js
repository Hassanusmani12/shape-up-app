import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { analyzeAndLog, getDailyStats, deleteNutritionEntry } from "../controllers/nutritionController.js";

const router = express.Router();

router.get("/test", (req, res) => {
  res.json({ success: true, message: "Nutrition routes working." });
});

router.post("/analyze-and-log", protect, analyzeAndLog);
router.get("/daily-stats/:userId", protect, getDailyStats);
router.delete("/entry/:id", protect, deleteNutritionEntry);

export default router;