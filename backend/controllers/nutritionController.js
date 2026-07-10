import asyncHandler from "express-async-handler";
import Nutrition from "../models/Nutrition.js";
import { callOpenRouter, getModel, extractContent, NUTRITION_SYSTEM_PROMPT } from "../services/openrouter.js";

function normalizeImage(imageInput) {
  if (!imageInput) return null;
  if (typeof imageInput === "string") {
    const trimmed = imageInput.trim();
    if (trimmed.length === 0) return null;
    if (trimmed.startsWith("data:")) return trimmed;
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
    if (trimmed.includes(",")) return `data:image/jpeg;base64,${trimmed.split(",")[1]}`;
    return `data:image/jpeg;base64,${trimmed}`;
  }
  if (typeof imageInput === "object" && imageInput !== null) {
    const url = imageInput.url || imageInput.data || imageInput.base64 || imageInput.image;
    if (url && typeof url === "string") {
      return normalizeImage(url);
    }
  }
  return null;
}

function extractJSON(text) {
  const trimmed = text.trim();

  // Strip everything before the first { and after the last }
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    const candidate = trimmed.slice(start, end + 1);
    try {
      return JSON.parse(candidate);
    } catch (_) {
      try {
        return JSON.parse(candidate.replace(/,(\s*[}\]])/g, "$1"));
      } catch (_) {}
    }
  }

  return null;
}

function safeParseAIResponse(rawContent) {
  if (typeof rawContent !== "string" || rawContent.trim().length === 0) {
    return { error: "AI returned empty response" };
  }

  const parsed = extractJSON(rawContent);
  if (!parsed) {
    console.error("❌ Nutrition JSON parse failed. Full raw response:");
    console.error(rawContent);
    return { error: "AI returned invalid response. Please try again." };
  }

  const foods = Array.isArray(parsed.foods) ? parsed.foods : [];
  const totals = parsed.totals || {};
  const healthScore = typeof parsed.healthScore === "number" ? Math.round(parsed.healthScore) : 0;
  const confidence = typeof parsed.confidence === "number" ? Math.round(parsed.confidence) : 0;
  const suggestions = Array.isArray(parsed.suggestions) ? parsed.suggestions : [];

  const calories = Math.round(totals.calories) || 0;
  const protein = Math.round(totals.protein) || 0;
  const carbs = Math.round(totals.carbs) || 0;
  const fats = Math.round(totals.fat) || 0;
  const fiber = Math.round(totals.fiber) || 0;
  const sugar = Math.round(totals.sugar) || 0;
  const sodium = Math.round(totals.sodium) || 0;

  const foodNames = foods.map(f => f.name).filter(Boolean).join(", ") || "Meal";
  const suggestionText = suggestions.length > 0 ? suggestions[0] : "";
  const mealType = foods.length > 1 ? "multi-item meal" : (foods.length === 1 ? "single item" : "meal");

  const aiFeedback = `${foodNames} — ${calories} kcal, ${protein}g protein, ${carbs}g carbs, ${fats}g fat.`;

  console.log("Parsed nutrition:", { calories, protein, carbs, fats, fiber, sugar, sodium, healthScore, confidence, foods: foodNames });

  return {
    analysis: aiFeedback,
    aiFeedback,
    suggestions: suggestionText,
    mealType,
    calories, protein, carbs, fats, fiber, sugar, sodium,
    healthScore, confidence,
    foods: JSON.stringify(foods),
  };
}

function buildNutritionMessages(foodQuery, imageUrl) {
  const messages = [{ role: "system", content: NUTRITION_SYSTEM_PROMPT }];
  if (imageUrl) {
    messages.push({
      role: "user",
      content: [
        { type: "text", text: foodQuery },
        { type: "image_url", image_url: { url: imageUrl } },
      ],
    });
  } else {
    messages.push({ role: "user", content: foodQuery });
  }
  return messages;
}

const analyzeAndLog = asyncHandler(async (req, res) => {
  const startTime = Date.now();

  try {
    const { foodQuery, image, conversationContext, userId: bodyUserId } = req.body || {};
    const imagePayload = normalizeImage(image);
    const userId = bodyUserId || req.user?._id?.toString();
    const model = getModel();

    console.log("Nutrition analyzeAndLog:", { hasFoodQuery: !!foodQuery, hasImage: !!imagePayload, hasUserId: !!userId });

    if (!userId) {
      return res.status(400).json({ success: false, error: "userId is required" });
    }
    if (!foodQuery && !imagePayload) {
      return res.status(400).json({ success: false, error: "Describe your meal or upload an image" });
    }

    const userMessage = conversationContext
      ? `Previous meal context:\n${conversationContext}\n\nUser's new message: "${foodQuery || "See image"}"`
      : (foodQuery || "Analyze this meal.");

    const messages = buildNutritionMessages(userMessage, imagePayload);
    const timeoutMs = imagePayload ? 120000 : 30000;

    let response;
    try {
      response = await callOpenRouter({
        messages,
        stream: false,
        timeout: timeoutMs,
        max_tokens: 2000,
      });
      console.log("Nutrition OpenRouter responded in", Date.now() - startTime + "ms", "| status:", response.status);
    } catch (axiosError) {
      console.error("Nutrition OpenRouter Error:", axiosError.message, "| status:", axiosError.response?.status);
      if (axiosError.code === "ECONNABORTED") {
        return res.status(504).json({ success: false, error: `Request timed out after ${timeoutMs / 1000}s. Try text-only.` });
      }
      const status = axiosError.response?.status || 502;
      const msg = axiosError.response?.data?.error?.message || axiosError.message || "OpenRouter request failed";
      return res.status(status).json({ success: false, error: msg });
    }

    if (!response || !response.data) {
      return res.status(502).json({ success: false, error: "OpenRouter returned no data" });
    }

    const rawContent = extractContent(response.data);
    if (!rawContent) {
      return res.status(200).json({
        success: true,
        nutrition: {
          calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, sugar: 0, sodium: 0,
          healthScore: 0, confidence: 0,
          analysis: "AI returned an empty response.",
          aiFeedback: "AI returned an empty response.",
          suggestions: "Please try again with a clearer description or image.",
          mealType: "meal", foods: [],
        }
      });
    }

    const parsed = safeParseAIResponse(rawContent);
    if (parsed.error) {
      console.error("Parse failed:", parsed.error);
      return res.status(422).json({
        success: false,
        error: parsed.error,
        detail: "The AI returned an unexpected format. Please try again with a different description.",
      });
    }

    let nutrition;
    try {
      nutrition = await Nutrition.create({
        userId,
        foodQuery: foodQuery || "Image analysis",
        prompt: userMessage,
        image: imagePayload || null,
        calories: parsed.calories,
        protein: parsed.protein,
        carbs: parsed.carbs,
        fats: parsed.fats,
        fiber: parsed.fiber,
        sugar: parsed.sugar,
        sodium: parsed.sodium,
        healthScore: parsed.healthScore,
        confidence: parsed.confidence,
        analysis: parsed.analysis,
        aiFeedback: parsed.aiFeedback,
        suggestions: parsed.suggestions,
        mealType: parsed.mealType,
        foods: parsed.foods,
      });
    } catch (mongoError) {
      console.error("MongoDB save error:", mongoError.message);
      return res.status(500).json({ success: false, error: "Failed to save nutrition log" });
    }

    const responsePayload = nutrition.toObject();
    console.log("Nutrition saved, ID:", nutrition._id, "| cals:", responsePayload.calories, "| protein:", responsePayload.protein);

    return res.status(201).json({ success: true, nutrition: responsePayload });

  } catch (catastrophicError) {
    console.error("Nutrition catastrophic error:", catastrophicError?.message);
    return res.status(500).json({ success: false, error: "AI processing failed", details: catastrophicError?.message || "Internal error" });
  }
});

const getDailyStats = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params || {};
    if (!userId) return res.status(400).json({ success: false, error: "userId is required" });

    const today = new Date().toISOString().split("T")[0];
    let logs;
    try {
      logs = await Nutrition.find({ userId, date: today }).sort({ createdAt: -1 });
    } catch (mongoError) {
      return res.status(500).json({ success: false, error: "Database query failed" });
    }

    const logsArray = Array.isArray(logs) ? logs : [];
    const totals = logsArray.reduce(
      (acc, log) => ({
        calories: acc.calories + (log.calories || 0),
        protein: acc.protein + (log.protein || 0),
        carbs: acc.carbs + (log.carbs || 0),
        fats: acc.fats + (log.fats || 0),
        meals: acc.meals + 1,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0, meals: 0 }
    );
    const avgHealthScore = logsArray.length > 0
      ? Math.round(logsArray.reduce((sum, l) => sum + (l.healthScore || 0), 0) / logsArray.length)
      : 0;

    return res.json({ success: true, date: today, totals, avgHealthScore, recentLogs: logsArray.slice(0, 20) });
  } catch (e) {
    return res.status(500).json({ success: false, error: "Failed to fetch daily stats" });
  }
});

const deleteNutritionEntry = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params || {};
    if (!id) return res.status(400).json({ success: false, error: "Entry ID is required" });

    let entry;
    try { entry = await Nutrition.findById(id); } catch (_) {
      return res.status(500).json({ success: false, error: "Failed to find entry" });
    }
    if (!entry) return res.status(404).json({ success: false, error: "Entry not found" });

    const uid = req.user?._id?.toString?.() || "";
    const euid = entry.userId?.toString?.() || "";
    if (uid !== euid) return res.status(403).json({ success: false, error: "Not authorized" });

    await Nutrition.findByIdAndDelete(id);
    return res.json({ success: true, message: "Entry deleted" });
  } catch (_) {
    return res.status(500).json({ success: false, error: "Delete failed" });
  }
});

export { analyzeAndLog, getDailyStats, deleteNutritionEntry };
