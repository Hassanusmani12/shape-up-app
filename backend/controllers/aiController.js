import asyncHandler from "express-async-handler";
import { callOpenRouter, getModel, buildMessages, extractContent, AI_HUB_SYSTEM_PROMPT } from "../services/openrouter.js";
import { ChatSession, XP, DailyChallenge, Achievement, getLevelInfo, ALL_ACHIEVEMENTS } from "../models/aiModel.js";
import User from "../models/userModel.js";
import Status from "../models/userStatusModel.js";
import DailyLog from "../models/dailyLogModel.js";
import Workout from "../models/workoutModel.js";

function logHandler(name, req) {
  console.log(`\n========== AI CONTROLLER: ${name} ==========`);
  console.log("User ID:", req.user?._id?.toString());
  console.log("Request body:", JSON.stringify(req.body, null, 2));
}

function logReply(name, reply) {
  console.log(`\n--- ${name} REPLY ---`);
  console.log("Reply length:", reply?.length || 0);
  console.log("Reply preview:", reply?.substring(0, 300) || "EMPTY REPLY");
}

function logResponse(name, responseObj) {
  console.log(`\n--- ${name} FINAL RESPONSE ---`);
  console.log("Response keys:", Object.keys(responseObj));
  console.log("Reply field:", responseObj.reply?.substring(0, 100) || "EMPTY/MISSING");
  console.log(`========== END ${name} ==========\n`);
}

async function getUserContext(userId) {
  const user = await User.findById(userId);
  const status = await Status.findOne({ user: userId }).sort({ createdAt: -1 });
  const xp = await XP.findOne({ user: userId });
  const recentLogs = await DailyLog.find({ user: userId }).sort({ date: -1 }).limit(7);
  const recentWorkouts = await Workout.find({ user: userId }).sort({ date: -1 }).limit(5);

  return {
    name: user?.name || "Athlete",
    age: user?.age || status?.age || "N/A",
    height: user?.height || status?.height || "N/A",
    weight: user?.weight || status?.weight || "N/A",
    gender: user?.gender || status?.gender || "N/A",
    goal: user?.goal || status?.goal || "Maintain",
    activityLevel: status?.activityLevel || "active",
    goalWeight: status?.goalWeight || "N/A",
    xp: xp ? getLevelInfo(xp.totalXP) : getLevelInfo(0),
    recentCalories: recentLogs.map(l => ({ date: l.date, calories: l.calories })),
    recentWorkouts: recentWorkouts.map(w => ({ name: w.exerciseName, date: w.date })),
  };
}

async function addXP(userId, amount, source, description = "") {
  let xp = await XP.findOne({ user: userId });
  if (!xp) {
    xp = await XP.create({ user: userId, totalXP: 0, level: 1, levelTitle: "Beginner", xpHistory: [] });
  }
  xp.totalXP += amount;
  const levelInfo = getLevelInfo(xp.totalXP);
  xp.level = levelInfo.level;
  xp.levelTitle = levelInfo.title;
  xp.xpHistory.push({ amount, source, description: description || source });
  await xp.save();
  return getLevelInfo(xp.totalXP);
}

async function getChatSession(userId, tool = "general") {
  let session = await ChatSession.findOne({ user: userId, tool });
  if (!session) {
    session = await ChatSession.create({ user: userId, tool, messages: [] });
  }
  return session;
}

async function addMessage(session, role, content, imageData = null) {
  session.messages.push({ role, content, imageData, timestamp: new Date() });
  if (session.messages.length > 50) {
    session.messages = session.messages.slice(-50);
  }
  await session.save();
}

function buildSystemPrompt(context, tool, extra = "") {
  return `You are ShapeUp AI, an elite fitness AI assistant. You are talking to ${context.name}.
USER DATA: Age: ${context.age}, Goal: ${context.goal}. ${extra} Tool: ${tool}`;
}

async function callAI(messages, systemInstruction, stream = false, timeout = 30000) {
  const msgs = [];
  if (systemInstruction) {
    msgs.push({ role: "system", content: systemInstruction });
  }
  msgs.push(...messages);
  const response = await callOpenRouter({ messages: msgs, stream, timeout });
  if (stream) return response;
  const content = extractContent(response.data);
  return content || "";
}

async function callAIWithImage(prompt, imageData, mimeType = "image/jpeg", systemInstruction = "") {
  const messages = [];
  if (systemInstruction) {
    messages.push({ role: "system", content: systemInstruction });
  }
  messages.push({
    role: "user",
    content: [
      { type: "text", text: prompt },
      { type: "image_url", image_url: { url: `data:${mimeType};base64,${imageData}` } },
    ],
  });
  const response = await callOpenRouter({ messages, stream: false, timeout: 60000, hasImage: true });
  return extractContent(response.data) || "";
}

const aiCoach = asyncHandler(async (req, res) => {
  logHandler("AI COACH", req);
  const { message } = req.body;
  const userId = req.user._id;
  try {
    const context = await getUserContext(userId);
    const session = await getChatSession(userId, "coach");
    await addMessage(session, "user", message);
    const coachPrompt = buildSystemPrompt(context, "fitness-coach", "You are a world-class personal trainer. Be encouraging but direct. Hold them accountable.");
    const historyContext = session.messages.slice(-10, -1).map(m => `${m.role}: ${m.content}`).join("\n");
    const fullPrompt = `Coach conversation so far:\n${historyContext}\n\nUser says: ${message}\n\nCoach response:`;
    const reply = await callAI([{ role: "user", content: fullPrompt }], coachPrompt);
    logReply("AI COACH", reply);
    await addMessage(session, "assistant", reply);
    const xpInfo = await addXP(userId, 25, "AI Coach", `Asked AI Coach: ${message.substring(0, 50)}`);
    const responseObj = { reply, sessionId: session._id, xp: xpInfo };
    logResponse("AI COACH", responseObj);
    res.json(responseObj);
  } catch (err) {
    console.error("AI COACH ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
});

const aiFoodScanner = asyncHandler(async (req, res) => {
  logHandler("AI FOOD SCANNER", req);
  const { image, imageData, text, message, mimeType } = req.body;
  const userId = req.user._id;
  const context = await getUserContext(userId);

  const imagePayload = image || imageData;
  const userPrompt = text || message || `Analyze this meal image for ${context.name}.`;

  const session = await getChatSession(userId, "food-scanner");

  if (imagePayload) {
    let imageUrl;
    if (imagePayload.startsWith("data:")) {
      imageUrl = imagePayload;
    } else if (imagePayload.startsWith("http")) {
      imageUrl = imagePayload;
    } else {
      imageUrl = `data:${mimeType || "image/jpeg"};base64,${imagePayload}`;
    }

    const model = getModel({ hasImage: true });
    console.log("\n========== FOOD SCANNER REQUEST ==========");
    console.log("Model:", model);
    console.log("Prompt:", userPrompt);
    console.log("Image URL prefix:", imageUrl.substring(0, 60) + "...");
    console.log("========================================\n");

    try {
      const response = await callOpenRouter({
        messages: [
          { role: "system", content: AI_HUB_SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: userPrompt },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ],
        stream: false,
        max_tokens: 2000,
        hasImage: true,
      });

      console.log("✅ OpenRouter response received");
      console.log("  - Status:", response.status);
      console.log("  - Content length:", response.data?.choices?.[0]?.message?.content?.length || 0);

      const aiAnalysis = extractContent(response.data) || "";

      if (!aiAnalysis) {
        console.error("❌ OpenRouter returned empty content");
        return res.status(200).json({
          success: true,
          reply: "I couldn't analyze this meal. Please try again with a clearer image or more detail.",
          data: "I couldn't analyze this meal. Please try again with a clearer image or more detail.",
          xp: null,
          sessionId: session._id,
        });
      }

      session.lastFoodAnalysis = {
        reply: aiAnalysis,
        userPrompt: userPrompt,
        analyzedAt: new Date(),
      };
      await addMessage(session, "user", userPrompt, imagePayload);
      await addMessage(session, "assistant", aiAnalysis);

      logReply("AI FOOD SCANNER", aiAnalysis);
      const xpInfo = await addXP(userId, 20, "Food Scanner", "Scanned a food item");
      logResponse("AI FOOD SCANNER", { reply: aiAnalysis, xp: xpInfo, sessionId: session._id });

      return res.status(200).json({ success: true, reply: aiAnalysis, data: aiAnalysis, xp: xpInfo, sessionId: session._id });
    } catch (error) {
      console.error("\n=== FOOD SCANNER API ERROR ===");
      console.error("Model:", getModel());
      console.error("Message:", error.message);
      const status = error.response?.status || 500;
      const msg = error.response?.data?.error?.message || error.message;
      return res.status(status).json({ success: false, message: msg, error: error.message });
    }
  }

  if (session.lastFoodAnalysis) {
    const analysis = session.lastFoodAnalysis;
    console.log("\n========== FOOD SCANNER FOLLOW-UP ==========");
    console.log("Previous analysis:", analysis.reply?.substring(0, 200));
    console.log("User follow-up:", userPrompt);
    console.log("===========================================\n");

    const followUpPrompt = `The user previously uploaded a meal and received this analysis:

=== PREVIOUS ANALYSIS ===
${analysis.reply}
=========================

The user is now asking a follow-up question about this same meal.
User's question: "${userPrompt}"

Answer naturally as a nutritionist who remembers the meal they analyzed. Reference the previous analysis data. Give specific advice based on their question. Be specific using the nutrition numbers from the analysis above.`;

    try {
      const reply = await callAI(
        [{ role: "user", content: followUpPrompt }],
        `You are an Elite Sports Nutritionist for Shape Up. You previously analyzed this user's meal and they are now asking a follow-up. Answer conversationally, naturally referencing the meal you already analyzed. Use the nutrition data from the previous analysis. Keep responses concise and helpful.`
      );

      await addMessage(session, "user", userPrompt);
      await addMessage(session, "assistant", reply);

      console.log(`\n--- FOOD SCANNER FOLLOW-UP REPLY ---`);
      console.log("Reply:", reply?.substring(0, 300));

      return res.status(200).json({ success: true, reply, data: reply, sessionId: session._id });
    } catch (error) {
      console.error("FOOD SCANNER FOLLOW-UP ERROR:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  return res.status(400).json({ success: false, message: "Please upload an image of your meal to analyze first." });
});

const aiFridgeScanner = asyncHandler(async (req, res) => {
  logHandler("AI FRIDGE SCANNER", req);
  const { imageData, customPrompt, message, mimeType } = req.body;
  const userId = req.user._id;

  if (imageData) {
    const prompt = customPrompt || (message
      ? `Suggest meals from these fridge/pantry ingredients. User: "${message}". Return ONLY raw JSON with: mealIdeas (array), quickRecipe (string), groceryAdditions (array), healthierAlternatives (array). No markdown, no code blocks.`
      : `I can see the contents of your fridge/pantry. Return ONLY raw JSON with: mealIdeas (array of 3-5 items), quickRecipe (string), groceryAdditions (array), healthierAlternatives (array). No markdown, no code blocks.`);
    try {
      const reply = await callAIWithImage(prompt, imageData, mimeType || "image/jpeg", `You are a creative chef assistant. Suggest meals from ingredients.`);
      logReply("AI FRIDGE SCANNER", reply);
      const xpInfo = await addXP(userId, 20, "Fridge Scanner", "Scanned fridge contents");
      const responseObj = { reply, xp: xpInfo };
      logResponse("AI FRIDGE SCANNER", responseObj);
      return res.json(responseObj);
    } catch (error) {
      console.error("FRIDGE SCANNER ERROR:", error.message);
      return res.status(500).json({ message: error.message });
    }
  }

  if (message || customPrompt) {
    const prompt = customPrompt || `Suggest meals based on: "${message}". Return ONLY raw JSON with: mealIdeas (array of 3-5 items), quickRecipe (string), groceryAdditions (array), healthierAlternatives (array). No markdown, no code blocks.`;
    try {
      const reply = await callAI([{ role: "user", content: prompt }], `You are a creative chef assistant. Suggest meals from ingredients.`);
      logReply("AI FRIDGE SCANNER (text)", reply);
      const xpInfo = await addXP(userId, 20, "Fridge Scanner", "Fridge question answered");
      const responseObj = { reply, xp: xpInfo };
      logResponse("AI FRIDGE SCANNER (text)", responseObj);
      return res.json(responseObj);
    } catch (error) {
      console.error("FRIDGE SCANNER TEXT ERROR:", error.message);
      return res.status(500).json({ message: error.message });
    }
  }

  return res.status(400).json({ message: "Please provide an image or describe what's in your fridge." });
});

const aiWorkoutGenerator = asyncHandler(async (req, res) => {
  const { goal, equipment, experience, duration, focus } = req.body;
  const userId = req.user._id;
  const context = await getUserContext(userId);
  const existingWorkouts = await Workout.find({ user: userId }).select("exerciseName").limit(20);
  const existingNames = existingWorkouts.map(w => w.exerciseName?.toLowerCase());

  const prompt = `Generate a detailed workout plan with EXACTLY these specifications:

User: ${context.name} (${context.gender}, ${context.age}yr, ${context.weight}kg)
Goal: ${goal || context.goal}
Experience: ${experience || "intermediate"}
Equipment available: ${equipment || "bodyweight only"}
Duration: ${duration || "45"} minutes
Focus area: ${focus || "full body"}
User's goal: ${context.goal}

PREVIOUS WORKOUTS (AVOID these exercises for variety): ${existingNames.join(", ") || "None"}

Return in this format:

## 🏋️ Workout: [Name]

**Duration:** ${duration || 45} min | **Difficulty:** ${experience || "intermediate"} | **Focus:** ${focus || "full body"}

### Warm-up (5-7 min)
| Exercise | Duration | Notes |
|----------|----------|-------|
| ... | ... | ... |

### Main Workout
| Exercise | Sets | Reps | Rest | Notes |
|----------|------|------|------|-------|
| ... | ... | ... | ... | ... |

### Cool-down (5 min)
| Exercise | Duration |
|----------|----------|
| ... | ... |

**Pro Tips:** ...
**Calories Burn Estimate:** ~XXX kcal`;

  const reply = await callAI([{ role: "user", content: prompt }], `You are an expert strength and conditioning coach. Generate UNIQUE workouts that don't repeat exercises from user's history.`);
  logReply("AI WORKOUT GENERATOR", reply);
  const xpInfo = await addXP(userId, 30, "Workout Generator", `Generated ${focus || "full body"} workout`);
  const responseObj = { reply, xp: xpInfo };
  logResponse("AI WORKOUT GENERATOR", responseObj);
  res.json(responseObj);
});

const aiMealPlanner = asyncHandler(async (req, res) => {
  const { goal, diet, mealsPerDay } = req.body;
  const userId = req.user._id;
  const context = await getUserContext(userId);

  const prompt = `Create a personalized meal plan for ${context.name}.

User Profile: ${context.age}yr, ${context.weight}kg, ${context.height}cm
Goal: ${goal || context.goal}
Diet preference: ${diet || "balanced"}
Meals per day: ${mealsPerDay || 3}
Activity level: ${context.activityLevel}

Return in this format:

## 🍽️ [Goal] Meal Plan

**Daily Targets:** ~XXXX calories | XXg Protein | XXg Carbs | XXg Fat

### Meal 1: [Name]
- **Ingredients:** ...
- **Calories:** XXX | **Protein:** XXg | **Carbs:** XXg | **Fat:** XXg
- **Prep time:** X min

[Repeat for each meal]

### Snacks (optional)
- ...

### 💡 Tips
- ...

### 🛒 Quick Grocery List
- ...`;

  const reply = await callAI([{ role: "user", content: prompt }], `You are a certified nutritionist. Create realistic, delicious meal plans based on the user's actual calorie needs. Use their BMR data.`);
  logReply("AI MEAL PLANNER", reply);
  const xpInfo = await addXP(userId, 30, "Meal Planner", `Generated ${goal || "balanced"} meal plan`);
  const responseObj = { reply, xp: xpInfo };
  logResponse("AI MEAL PLANNER", responseObj);
  res.json(responseObj);
});

const aiGroceryPlanner = asyncHandler(async (req, res) => {
  const { budget, mealPlan } = req.body;
  const userId = req.user._id;
  const context = await getUserContext(userId);

  const prompt = `Create a smart grocery shopping list for ${context.name}.

Budget: ${budget || "moderate"}
Goal: ${context.goal}
Meal plan context: ${mealPlan || "Based on a balanced diet for one person"}

Return as a categorized markdown list:

## 🛒 Grocery List

### 🥩 Protein (Estimated: $XX)
- [ ] Item - Qty - Estimated price

### 🥦 Vegetables & Fruits
- [ ] ...

### 🍚 Grains & Carbs
- [ ] ...

### 🥛 Dairy & Alternatives
- [ ] ...

### 🧂 Spices & Condiments
- [ ] ...

### 💰 Total Estimated Cost: $XX
### ♻️ Items you may already have: ...

> Budget tip: ...`;

  const reply = await callAI([{ role: "user", content: prompt }], `You are a smart grocery planning assistant. Create realistic, budget-conscious lists.`);
  logReply("AI GROCERY PLANNER", reply);
  const xpInfo = await addXP(userId, 20, "Grocery Planner", "Generated grocery list");
  const responseObj = { reply, xp: xpInfo };
  logResponse("AI GROCERY PLANNER", responseObj);
  res.json(responseObj);
});

const aiCheatMealJudge = asyncHandler(async (req, res) => {
  logHandler("AI CHEAT MEAL JUDGE", req);
  const { mealDescription, message, imageData, mimeType } = req.body;
  const userId = req.user._id;
  const context = await getUserContext(userId);

  const description = mealDescription || message || "";

  const prompt = `Analyze this "cheat meal" and judge it (in a fun way).

User: ${context.name}
Goal: ${context.goal}
Meal: ${description || (imageData ? "See image" : "Unknown")}

Return ONLY raw JSON. Do NOT wrap in markdown or code blocks. No explanations. Use this exact structure:
{
  "mealName": "...",
  "estimatedCalories": 0,
  "protein": 0,
  "carbs": 0,
  "fat": 0,
  "cheatScore": 0,
  "healthScore": 0,
  "commentary": "...",
  "betterAlternatives": ["..."],
  "coachSays": "..."
}`;

  if (imageData) {
    const reply = await callAIWithImage(prompt + `\n\nImage shows a meal. Analyze it visually.`, imageData, mimeType || "image/jpeg", `You are a fun, motivational cheat meal judge. Be humorous but supportive. Reference the user's goals.`);
    logReply("AI CHEAT MEAL (vision)", reply);
    const responseObj = { reply };
    logResponse("AI CHEAT MEAL", responseObj);
    res.json(responseObj);
  } else {
    const reply = await callAI([{ role: "user", content: prompt }], `You are a fun, motivational cheat meal judge. Be humorous but supportive. Reference the user's goals.`);
    logReply("AI CHEAT MEAL (text)", reply);
    const responseObj = { reply };
    logResponse("AI CHEAT MEAL", responseObj);
    res.json(responseObj);
  }
});

const aiRecoveryCoach = asyncHandler(async (req, res) => {
  logHandler("AI RECOVERY COACH", req);
  const { sleep, intensity, soreness, stress } = req.body;
  const userId = req.user._id;
  const context = await getUserContext(userId);

  const prompt = `Analyze ${context.name}'s recovery status and give personalized recommendations.

Recovery Data:
- Sleep: ${sleep || "7"} hours
- Workout intensity (last session): ${intensity || "moderate"}
- Muscle soreness: ${soreness || "3"}/10
- Stress level: ${stress || "5"}/10
- Recent workouts: ${JSON.stringify(context.recentWorkouts)}
- Goal: ${context.goal}

Return:

## 🔋 Recovery Report

**Recovery Score:** XX/100
**Status:** [Ready to Train / Take it Easy / Rest Day Recommended]

### 📊 Analysis
- Sleep: ...
- Muscle Readiness: ...
- CNS Fatigue: ...

### 🧘 Recommended Actions
- Action 1
- Action 2
- Action 3

### 🏋️ Today's Recommended Workout
[Light/Moderate/Intense suggestion]

### 🥤 Nutrition Focus
[Specific nutrition advice for recovery]

### ⏰ Estimated Full Recovery: X days`;

  const reply = await callAI([{ role: "user", content: prompt }], `You are a sports recovery specialist. Give evidence-based recovery advice.`);
  logReply("AI RECOVERY COACH", reply);
  const xpInfo = await addXP(userId, 25, "Recovery Coach", "Checked recovery status");
  const responseObj = { reply, xp: xpInfo };
  logResponse("AI RECOVERY COACH", responseObj);
  res.json(responseObj);
});

const aiProgressAnalyzer = asyncHandler(async (req, res) => {
  const { period } = req.body;
  const userId = req.user._id;
  const context = await getUserContext(userId);
  const logs = await DailyLog.find({ user: userId }).sort({ date: -1 }).limit(30);
  const workouts = await Workout.find({ user: userId }).sort({ date: -1 }).limit(30);

  const prompt = `Generate a detailed progress analysis for ${context.name}.

Period: ${period || "last 30 days"}
User Data: ${JSON.stringify(context)}
Recent Daily Logs (${logs.length} entries): ${JSON.stringify(logs.map(l => ({ date: l.date, calories: l.calories, protein: l.protein })))}
Recent Workouts (${workouts.length} entries): ${JSON.stringify(workouts.map(w => ({ name: w.exerciseName, date: w.date })))}

Return in this detailed markdown format:

## 📈 Progress Report: [Period]

### 🏆 Overall Progress Score: XX/100

### 📊 Key Metrics
| Metric | Start | Current | Change |
|--------|-------|---------|--------|
| Weight | ... | ... | ... |
| Calories (avg) | ... | ... | ... |
| Workouts/week | ... | ... | ... |

### 💪 Strength Analysis
- ...

### 🥗 Nutrition Analysis
- ...

### 📉 Trends & Insights
- Trend 1
- Trend 2
- Trend 3

### 🎯 Personalized Recommendations
1. ...
2. ...
3. ...

### ⚡ Next Milestone
...`;

  const reply = await callAI([{ role: "user", content: prompt }], `You are an elite fitness data analyst. Generate meaningful insights from the user's actual data.`);
  logReply("AI PROGRESS ANALYZER", reply);
  const xpInfo = await addXP(userId, 35, "Progress Analyzer", "Generated progress report");
  const responseObj = { reply, xp: xpInfo };
  logResponse("AI PROGRESS ANALYZER", responseObj);
  res.json(responseObj);
});

const aiSupplementAdvisor = asyncHandler(async (req, res) => {
  const { budget, medicalConditions, diet } = req.body;
  const userId = req.user._id;
  const context = await getUserContext(userId);

  const prompt = `Recommend supplements for ${context.name}.

User Profile:
- Age: ${context.age}, Weight: ${context.weight}kg, Height: ${context.height}cm, Gender: ${context.gender}
- Goal: ${context.goal}, Activity Level: ${context.activityLevel}
- Diet: ${diet || "balanced"}
- Budget: ${budget || "moderate"}
- Medical Conditions: ${medicalConditions || "None reported"}

SUPPLEMENTS TO CONSIDER (only recommend relevant ones):
Whey Protein, Creatine, Fish Oil, Omega-3, Vitamin D, Magnesium, Zinc, Electrolytes, Multivitamins, BCAA, Casein, Pre Workout, Recovery Supplements

For each recommended supplement, include:
- Why recommended (tied to user's specific data)
- Benefits (3 bullet points)
- Dosage recommendation
- Best timing
- How to use
- Side effects & warnings
- Budget option (brand + price range)
- Premium option (brand + price range)

Return in this format:

## 💊 Supplement Advisor Report for ${context.name}

**Based on:** ${context.goal} goal, ${context.weight}kg bodyweight, ${diet || "balanced"} diet

### Recommended Supplements

#### 1. [Supplement Name] ⭐ (Highest Priority)
- **Why:** ...
- **Benefits:** ...
- **Dosage:** ...
- **Timing:** ...
- **Budget:** ...
- **Premium:** ...
- **⚠️ Warnings:** ...
- **Estimated monthly cost:** $XX

[Repeat for each]

### ❌ NOT Recommended for you
- ...

### 📅 Suggested Daily Stack
- Morning: ...
- Pre-workout: ...
- Post-workout: ...
- Evening: ...

> **Medical Disclaimer:** Consult your doctor before starting any supplement regimen.

### 💰 Total Estimated Monthly Cost: $XX-$XX`;

  const reply = await callAI([{ role: "user", content: prompt }], `You are a certified sports nutritionist and supplement expert. Only recommend evidence-based supplements. Always include safety warnings. Be specific about brands and dosages.`);
  logReply("AI SUPPLEMENT ADVISOR", reply);
  const xpInfo = await addXP(userId, 25, "Supplement Advisor", "Got supplement recommendations");
  const responseObj = { reply, xp: xpInfo };
  logResponse("AI SUPPLEMENT ADVISOR", responseObj);
  res.json(responseObj);
});

const aiGoalPlanner = asyncHandler(async (req, res) => {
  const { targetGoal, timeframe, message } = req.body;
  const userId = req.user._id;
  const context = await getUserContext(userId);

  const goalDescription = targetGoal || message || context.goal;

  const prompt = `Create a detailed goal plan for ${context.name}.

Current: ${context.weight}kg, Goal: ${context.goal}
Target they want to achieve: ${goalDescription}
Timeframe: ${timeframe || "12 weeks"}

Return in this format:

## 🎯 Goal Plan

### Primary Goal
[Specific, Measurable goal statement]

### Current Status
- Weight: ${context.weight}kg
- Daily Calories: ~[calculated from their data]
- Workout Frequency: [from their data]

### 📅 Weekly Breakdown
| Week | Focus | Key Actions |
|------|-------|-------------|
| 1-2 | ... | ... |
| 3-4 | ... | ... |
[Continue for all weeks]

### 🏋️ Training Split Recommendation
[Day-by-day breakdown]

### 🥗 Nutrition Strategy
[Specific nutrition guidance]

### 📊 Success Metrics
- Metric 1: target
- Metric 2: target
- Metric 3: target

### 🚧 Potential Obstacles & Solutions
- Obstacle → Solution

### 🎉 Milestone Rewards
- 25%: ...
- 50%: ...
- 75%: ...
- 100%: ...`;

  const reply = await callAI([{ role: "user", content: prompt }], `You are a goal-setting expert and fitness coach. Create SMART goals with actionable weekly plans.`);
  logReply("AI GOAL PLANNER", reply);
  const xpInfo = await addXP(userId, 30, "Goal Planner", "Created personalized goal plan");
  const responseObj = { reply, xp: xpInfo };
  logResponse("AI GOAL PLANNER", responseObj);
  res.json(responseObj);
});

const getDailyChallenges = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const context = await getUserContext(userId);
  const today = new Date().toISOString().split("T")[0];

  let challenge = await DailyChallenge.findOne({ user: userId, date: today });

  if (!challenge) {
    const prompt = `Generate 3 daily fitness challenges for ${context.name} (${context.goal} goal, ${context.weight}kg).
Return ONLY raw JSON array. No markdown, no code blocks. Each object: title (string), description (string), target (string), xpReward (number 50-200).

Generate different challenges than: "Drink 3L Water", "Eat 150g Protein", "Walk 10,000 Steps", "Burn 500 Calories"
Make them personalized to their goal: ${context.goal}`;

    const reply = await callAI([{ role: "user", content: prompt }], `You are a gamification expert for fitness apps. Generate creative, achievable daily challenges in raw JSON array format only.`);

    let challengesData;
    try {
      const cleaned = reply
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```$/i, "")
        .trim();
      challengesData = JSON.parse(cleaned);
    } catch (e) {
      try {
        const jsonMatch = reply.match(/\[[\s\S]*?\]/);
        if (jsonMatch) {
          challengesData = JSON.parse(jsonMatch[0]);
        }
      } catch (e2) {}
    }

    if (!challengesData || !Array.isArray(challengesData)) {
      challengesData = [
        { title: "Complete Your Daily Log", description: "Log all your meals and workouts today", target: "100% completion", xpReward: 100 },
        { title: "Protein Goal", description: "Hit your daily protein target", target: `${context.weight * 2}g protein`, xpReward: 150 },
        { title: "Active Recovery", description: "Do 15 minutes of light stretching", target: "15 minutes", xpReward: 75 },
      ];
    }

    challenge = await DailyChallenge.create({
      user: userId,
      date: today,
      challenges: challengesData.map(c => ({
        title: c.title,
        description: c.description,
        target: c.target,
        xpReward: c.xpReward || 100,
        completed: false,
        progress: 0
      }))
    });
  }

  res.json({ date: today, challenges: challenge.challenges });
});

const completeChallenge = asyncHandler(async (req, res) => {
  const { challengeIndex } = req.body;
  const userId = req.user._id;
  const today = new Date().toISOString().split("T")[0];

  const challenge = await DailyChallenge.findOne({ user: userId, date: today });
  if (!challenge || !challenge.challenges[challengeIndex]) {
    res.status(404);
    throw new Error("Challenge not found");
  }

  const ch = challenge.challenges[challengeIndex];
  if (ch.completed) {
    res.json({ message: "Already completed", xp: null });
    return;
  }

  ch.completed = true;
  await challenge.save();
  const xpInfo = await addXP(userId, ch.xpReward, "Daily Challenge", `Completed: ${ch.title}`);

  res.json({ message: "Challenge completed!", xp: xpInfo });
});

const getAchievements = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  let achievement = await Achievement.findOne({ user: userId });

  if (!achievement) {
    achievement = await Achievement.create({ user: userId, achievements: [] });
  }

  res.json({ allAchievements: ALL_ACHIEVEMENTS, unlocked: achievement.achievements });
});

const getXPInfo = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  let xp = await XP.findOne({ user: userId });
  if (!xp) {
    xp = await XP.create({ user: userId, totalXP: 0, level: 1, levelTitle: "Beginner" });
  }
  const achievements = await Achievement.findOne({ user: userId });
  res.json({
    ...getLevelInfo(xp.totalXP),
    recentActivity: xp.xpHistory.slice(-10).reverse(),
    achievements: achievements?.achievements?.length || 0,
    totalAchievements: ALL_ACHIEVEMENTS.length
  });
});

const saveFoodScan = asyncHandler(async (req, res) => {
  const { foodData } = req.body;
  const userId = req.user._id;
  const today = new Date().toISOString().split("T")[0];

  let log = await DailyLog.findOne({ user: userId, date: today });
  if (!log) {
    log = await DailyLog.create({ user: userId, date: today });
  }

  log.calories = (log.calories || 0) + (foodData.calories || 0);
  log.protein = (log.protein || 0) + (foodData.protein || 0);
  log.carbs = (log.carbs || 0) + (foodData.carbs || 0);
  log.fat = (log.fat || 0) + (foodData.fat || 0);
  await log.save();

  res.json({ message: "Food saved to daily log!", log });
});

export const handleAIRequest = async (req, res) => {
  try {
    const { message, imageData } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: "Prompt (message) is required." });
    }

    const model = getModel({ hasImage: !!imageData });
    const messages = imageData
      ? [
          { role: "system", content: "You are an expert AI assistant. Execute the user's prompt exactly as requested." },
          {
            role: "user",
            content: [
              { type: "text", text: message },
              { type: "image_url", image_url: { url: imageData.startsWith("data:") ? imageData : `data:image/webp;base64,${imageData}` } },
            ],
          },
        ]
      : [
          { role: "system", content: "You are an expert AI assistant. Execute the user's prompt exactly as requested." },
          { role: "user", content: message },
        ];

    console.log(`🚀 Sending to OpenRouter model: ${model}`);
    if (imageData) console.log("📸 Image detected, sending multimodal request...");

    const response = await callOpenRouter({ messages, stream: false, max_tokens: 2000, hasImage: !!imageData });
    const aiResult = extractContent(response.data);

    if (!aiResult) {
      return res.status(500).json({ success: false, message: "AI returned an empty response." });
    }

    return res.status(200).json({ success: true, data: aiResult });
  } catch (error) {
    console.error("\n❌ handleAIRequest Error:");
    console.error("  Model:", getModel());
    console.error("  Message:", error.message);
    const status = error.response?.status || 500;
    const friendly =
      status === 401 ? "OpenRouter rejected the API key." :
      status === 404 ? `OpenRouter model not found.` :
      status === 429 ? "Rate limited. Wait and retry." :
      error.code === "ECONNREFUSED" ? "Cannot connect to OpenRouter." :
      error.message || "AI execution failed.";
    return res.status(status).json({ success: false, message: friendly, error: error.message });
  }
};

const IMAGE_FALLBACK = "Sorry! Sometimes image analysis may not be available due to temporary AI model limitations.\n\nPlease describe the food or fitness item in text and I'll analyze it for you.";

const TEXT_FALLBACK = "Hi! I'm ShapeUp AI, your fitness assistant. I'm here to help with workouts, nutrition, meal plans, and health. Feel free to ask me anything fitness-related!";

const getChatSessions = asyncHandler(async (req, res) => {
  console.log("Fetching chats for User ID:", req.user._id);
  try {
    const sessions = await ChatSession.find({ user: req.user._id })
      .select("tool messages updatedAt createdAt")
      .sort({ updatedAt: -1 });
    res.json({ success: true, sessions });
  } catch (error) {
    console.error("getChatSessions error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

const aiChat = async (req, res) => {
  console.log("AI CHAT ROUTE HIT");
  const startTime = Date.now();

  try {
    const { message, image, mimeType, conversationId } = req.body;
    const userId = req.user?._id;
    const hasImage = !!image;
    const model = getModel({ hasImage });
    console.log("Selected model:", model);

    let session;
    if (conversationId) {
      session = await ChatSession.findOne({ _id: conversationId, user: userId || null });
    }
    if (!session) {
      session = await ChatSession.create({
        user: userId || null,
        tool: "general",
        messages: [],
      });
      console.log("Created new session:", session._id.toString());
    }

    const history = session.messages.slice(-20);
    const openaiMessages = buildMessages(AI_HUB_SYSTEM_PROMPT, message || (image ? "Analyze this image." : "Hello"), image, mimeType, history);

    await addMessage(session, "user", message || (image ? "Analyze this image." : "Hello"), image || null);

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });

    const abortController = new AbortController();
    const onClientDisconnect = () => {
      if (!abortController.signal.aborted) abortController.abort();
    };
    req.on("close", onClientDisconnect);

    let fullContent = "";

    try {
      const response = await callOpenRouter({
        messages: openaiMessages,
        stream: true,
        max_tokens: 2000,
        signal: abortController.signal,
        hasImage,
        timeout: 20000,
      });

      if (response.status !== 200) throw new Error(`Status ${response.status}`);

      const safeWrite = (data) => {
        try {
          if (!res.writableEnded && !res.destroyed) res.write(data);
        } catch (_) {}
      };

      await new Promise((resolve, reject) => {
        let buffer = "";
        let resolved = false;
        let receivedContent = false;

        const cleanup = (err) => {
          if (resolved) return;
          resolved = true;
          response.data.removeListener("data", onData);
          response.data.removeListener("end", onEnd);
          response.data.removeListener("error", onError);
          response.data.destroy();
          if (err) reject(err);
          else resolve();
        };

        const onData = (raw) => {
          try {
            const chunk = raw.toString();
            buffer += chunk;
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || trimmed === "data: [DONE]" || !trimmed.startsWith("data: ")) continue;

              try {
                const parsed = JSON.parse(trimmed.slice(6));
                if (parsed.error) { reject(new Error(parsed.error.message)); return; }
                const delta = parsed?.choices?.[0]?.delta?.content;
                if (delta) {
                  receivedContent = true;
                  fullContent += delta;
                  safeWrite(`data: ${JSON.stringify({ content: delta })}\n\n`);
                }
              } catch {}
            }
          } catch {}
        };

        const onEnd = () => {
          if (!receivedContent) cleanup(new Error("empty"));
          else cleanup();
        };

        const onError = (err) => cleanup(err);

        response.data.on("data", onData);
        response.data.on("end", onEnd);
        response.data.on("error", onError);
      });
    } catch (streamError) {
      console.error("Stream error:", streamError.message);
    }

    req.off("close", onClientDisconnect);

    if (!fullContent) {
      fullContent = hasImage ? IMAGE_FALLBACK : TEXT_FALLBACK;
      res.write(`data: ${JSON.stringify({ content: fullContent })}\n\n`);
    }

    await addMessage(session, "assistant", fullContent);
    console.log("Total chars:", fullContent.length, "| latency:", Date.now() - startTime + "ms");

    res.write(`data: ${JSON.stringify({ done: true, conversationId: session._id.toString() })}\n\n`);
    res.end();
  } catch (error) {
    console.error("AI Hub fatal error:", error.message);
    const fallback = IMAGE_FALLBACK;
    if (res.headersSent) {
      try {
        res.write(`data: ${JSON.stringify({ content: fallback })}\n\n`);
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
      } catch (_) {}
    } else {
      res.status(500).json({ error: fallback, success: false });
    }
  }
};

export {
  aiChat, aiCoach, aiFoodScanner, aiFridgeScanner,
  aiWorkoutGenerator, aiMealPlanner, aiGroceryPlanner,
  aiCheatMealJudge, aiRecoveryCoach, aiProgressAnalyzer,
  aiSupplementAdvisor, aiGoalPlanner,
  getDailyChallenges, completeChallenge, getAchievements,
  getXPInfo, saveFoodScan, getChatSessions
};
