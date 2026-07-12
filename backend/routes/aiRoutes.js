import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { callOpenRouter, extractContent } from "../services/openrouter.js";
import {
  aiChat, aiCoach, aiFoodScanner, aiFridgeScanner,
  aiWorkoutGenerator, aiMealPlanner, aiGroceryPlanner,
  aiCheatMealJudge, aiRecoveryCoach, aiProgressAnalyzer,
  aiSupplementAdvisor, aiGoalPlanner,
  getDailyChallenges, completeChallenge, getAchievements,
  getXPInfo, saveFoodScan, handleAIRequest, getChatSessions
} from "../controllers/aiController.js";

const router = express.Router();

router.post("/test", async (req, res) => {
  console.log("\n========== AI TEST ENDPOINT HIT ==========");
  console.log("Request body:", JSON.stringify(req.body, null, 2));
  try {
    const message = req.body.message || "Say hello in one sentence.";
    console.log("TEST - Sending to OpenRouter:", message);
    const response = await callOpenRouter({
      messages: [
        { role: "system", content: "You are a helpful assistant. Keep responses under 2 sentences." },
        { role: "user", content: message },
      ],
      stream: false,
    });
    const reply = extractContent(response.data);
    console.log("TEST - OpenRouter reply:", reply);
    console.log("TEST - Reply length:", reply?.length);
    res.json({ success: true, reply, message });
  } catch (err) {
    console.error("TEST ENDPOINT ERROR:", err);
    console.error("TEST ENDPOINT ERROR FULL:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/chat", protect, aiChat);
router.post("/coach", protect, aiCoach);
router.post("/food-scanner", protect, aiFoodScanner);
router.post("/fridge-scanner", protect, aiFridgeScanner);
router.post("/workout-generator", protect, aiWorkoutGenerator);
router.post("/meal-planner", protect, aiMealPlanner);
router.post("/grocery-planner", protect, aiGroceryPlanner);
router.post("/cheat-meal", protect, aiCheatMealJudge);
router.post("/recovery-coach", protect, aiRecoveryCoach);
router.post("/progress-analyzer", protect, aiProgressAnalyzer);
router.post("/supplement-advisor", protect, aiSupplementAdvisor);
router.post("/goal-planner", protect, aiGoalPlanner);
router.post("/handle", protect, handleAIRequest);
router.get("/daily-challenges", protect, getDailyChallenges);
router.post("/daily-challenges/complete", protect, completeChallenge);
router.get("/achievements", protect, getAchievements);
router.get("/xp", protect, getXPInfo);
router.post("/save-food-scan", protect, saveFoodScan);
router.get("/sessions", protect, getChatSessions);

export default router;
