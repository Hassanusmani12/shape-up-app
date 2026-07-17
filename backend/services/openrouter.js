import axios from "axios";

const BASE_URL = "https://openrouter.ai/api/v1";
const CHAT_URL = `${BASE_URL}/chat/completions`;
const TIMEOUT_MS = 180000;

function getApiKey() {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    console.error("❌ FATAL: OPENROUTER_API_KEY is not set in .env");
  }
  return key;
}

function getModel({ hasImage } = {}) {
  if (hasImage) {
    return process.env.IMAGE_MODEL;
  }
  return process.env.TEXT_MODEL;
}

function defaultHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getApiKey()}`,
    "HTTP-Referer": "http://localhost:3000",
    "X-Title": "Shape Up",
  };
}

function buildProfileAwarePrompt(user) {
  if (!user) return AI_HUB_SYSTEM_PROMPT;

  const hasProfile = user.weight || user.height || user.age || user.goal;
  const profileBlock = hasProfile
    ? `Here is the user's current profile data: [Weight: ${user.weight || "N/A"}kg, Height: ${user.height || "N/A"}cm, Activity: ${user.activityLevel || user.activity || "N/A"}, Goal: ${user.goal || "N/A"}]. ALWAYS use this data to tailor your fitness, nutrition, and weight management advice. If the user asks 'should I gain or lose weight' or 'create a plan', use these specific metrics to give a personalized answer.`
    : `The user has not set up their profile yet. Politely encourage them to fill in their weight, height, age, and fitness goals so you can give personalized advice.`;

  return `You are ShapeUp AI, an elite fitness assistant. Your primary expertise is fitness, nutrition, workouts, and health.
${profileBlock}

GREETINGS & CASUAL CONVERSATION:
- Greetings (hello, hi, hey, good morning), pleasantries (how are you, how's it going), thanks, and casual chat are ALLOWED.
- Respond warmly and naturally. Keep it brief.
- You may gently mention you're a fitness assistant, but do NOT refuse to engage.

CORE EXPERTISE (answer freely):
- Workout plans, exercises, form, and training
- Nutrition, diet, calories, macros
- Weight loss, muscle gain, body recomposition
- Protein, supplements, recovery
- Body fat, BMI, health, fitness progress
- Meal plans, food analysis
- Fitness-related image analysis (food, gym equipment, exercise posture, supplements)

OFF-TOPIC RESTRICTION (only block these):
If the user asks you to perform a specific technical task outside fitness (e.g. "write HTML code", "solve this math equation", "write a poem about cars", "debug my JavaScript"), politely refuse and say you're a fitness assistant.

RULES:
- Respond naturally to greetings and casual chat.
- Only refuse clearly and specifically off-topic technical requests.
- Never invent values. Always mention "Values are estimated" when giving nutrition or calorie estimates.
- For food images: estimate calories, protein, carbs, fat, fiber, sugar, sodium, serving size, health score, suggestions, confidence.
- For non-food fitness images (gym equipment, exercise posture, supplements): analyze accordingly.
- For unrelated images (cars, dogs, computers, selfies, houses): reply "I can only analyze food and fitness related images."
- Output in professional, clean Markdown. Use bullet points.
- Keep responses short and focused.
- No chain-of-thought, no internal reasoning.
- Never claim exact nutrition unless a label is visible in the image.`;
}

const AI_HUB_SYSTEM_PROMPT = `You are ShapeUp AI, an elite fitness assistant. Your primary expertise is fitness, nutrition, workouts, and health.

GREETINGS & CASUAL CONVERSATION:
- Greetings (hello, hi, hey, good morning), pleasantries (how are you, how's it going), thanks, and casual chat are ALLOWED.
- Respond warmly and naturally. Keep it brief.
- You may gently mention you're a fitness assistant, but do NOT refuse to engage.

CORE EXPERTISE (answer freely):
- Workout plans, exercises, form, and training
- Nutrition, diet, calories, macros
- Weight loss, muscle gain, body recomposition
- Protein, supplements, recovery
- Body fat, BMI, health, fitness progress
- Meal plans, food analysis
- Fitness-related image analysis (food, gym equipment, exercise posture, supplements)

OFF-TOPIC RESTRICTION (only block these):
If the user asks you to perform a specific technical task outside fitness (e.g. "write HTML code", "solve this math equation", "write a poem about cars", "debug my JavaScript"), politely refuse and say you're a fitness assistant.

RULES:
- Respond naturally to greetings and casual chat.
- Only refuse clearly and specifically off-topic technical requests.
- Never invent values. Always mention "Values are estimated" when giving nutrition or calorie estimates.
- For food images: estimate calories, protein, carbs, fat, fiber, sugar, sodium, serving size, health score, suggestions, confidence.
- For non-food fitness images (gym equipment, exercise posture, supplements): analyze accordingly.
- For unrelated images (cars, dogs, computers, selfies, houses): reply "I can only analyze food and fitness related images."
- Output in professional, clean Markdown. Use bullet points.
- Keep responses short and focused.
- No chain-of-thought, no internal reasoning.
- Never claim exact nutrition unless a label is visible in the image.`;

const NUTRITION_SYSTEM_PROMPT = `You are a nutrition analysis AI. Do not explain your thinking. Do not output reasoning or analysis steps. Respond with ONLY a valid JSON object. Nothing before it, nothing after it. No markdown, no code fences, no explanation text.

JSON format:
{"foods":[{"name":"","serving":"","calories":0,"protein":0,"carbs":0,"fat":0,"fiber":0,"sugar":0,"sodium":0}],"totals":{"calories":0,"protein":0,"carbs":0,"fat":0,"fiber":0,"sugar":0,"sodium":0},"healthScore":0,"confidence":0,"suggestions":[]}

Rules:
- foods array lists each food item individually.
- totals is sum of all foods.
- healthScore 1-10, confidence 0-100.
- suggestions array of 1-3 short strings.
- All numbers are numbers, not strings.
- Estimate reasonably. All values are estimated.
- Never claim exact nutrition unless a label is visible.
- Include the phrase "Values are estimated" in your suggestions.`;

function formatImageUrl(imageData, mimeType) {
  if (!imageData) return null;
  if (imageData.startsWith("data:")) return imageData;
  if (imageData.startsWith("http://") || imageData.startsWith("https://")) return imageData;
  return `data:${mimeType || "image/jpeg"};base64,${imageData}`;
}

function buildMessages(systemPrompt, userText, imageData, mimeType, history = []) {
  const messages = [{ role: "system", content: systemPrompt }];
  for (const msg of history) {
    messages.push({ role: msg.role, content: msg.content || "" });
  }
  if (imageData) {
    messages.push({
      role: "user",
      content: [
        { type: "text", text: userText || "Analyze this image." },
        { type: "image_url", image_url: { url: formatImageUrl(imageData, mimeType) } },
      ],
    });
  } else {
    messages.push({ role: "user", content: userText || "Hello" });
  }
  return messages;
}

function extractContent(responseData) {
  if (!responseData?.choices?.[0]?.message) return null;
  const msg = responseData.choices[0].message;
  if (msg.content && typeof msg.content === "string" && msg.content.trim().length > 0) return msg.content.trim();
  if (msg.reasoning && typeof msg.reasoning === "string" && msg.reasoning.trim().length > 0) return msg.reasoning.trim();
  return null;
}

async function callOpenRouter({ messages, stream = false, signal, timeout = TIMEOUT_MS, max_tokens = 2000, reasoning, hasImage = false }) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured in .env");
  }

  const model = getModel({ hasImage });
  const body = { model, messages, max_tokens };
  if (stream) {
    body.stream = true;
  }
  if (reasoning) {
    body.reasoning = reasoning;
  }

  const startTime = Date.now();
  const maskedKey = apiKey.length >= 12 ? apiKey.slice(0, 12) + "..." : "(short)";
  console.log(`\n🚀 OpenRouter Request — model: ${model} | stream: ${stream} | messages: ${messages.length}`);
  console.log(`   Authorization: Bearer ${maskedKey}`);
  console.log(`   Endpoint: ${CHAT_URL}`);
  console.log(`   Request body model: ${body.model} | stream: ${body.stream} | messages: ${body.messages.length}`);
  console.log(`   System prompt: ${messages[0]?.content?.substring(0, 80)}...`);

  try {
    const response = await axios.post(CHAT_URL, body, {
      headers: defaultHeaders(),
      timeout,
      signal,
      responseType: stream ? "stream" : "json",
    });

    const latency = Date.now() - startTime;
    console.log(`✅ OpenRouter Response — status: ${response.status} | stream: ${stream} | latency: ${latency}ms`);
    console.log(`   Request Payload model: ${model} | messages: ${messages.length} | stream: ${stream} | max_tokens: ${max_tokens}`);
    return response;
  } catch (error) {
    const latency = Date.now() - startTime;
    const resp = error.response;
    const headers = resp?.headers || {};

    console.error(`\n❌❌❌ OPENROUTER API ERROR ❌❌❌`);
    console.error(`  Timestamp:       ${new Date().toISOString()}`);
    console.error(`  Model:           ${model}`);
    console.error(`  Latency:         ${latency}ms`);
    console.error(`  Error Code:      ${error.code || "N/A"}`);
    console.error(`  Error Message:   ${error.message}`);
    console.error(`  HTTP Status:     ${resp?.status || "N/A"}`);
    console.error(`  Status Text:     ${resp?.statusText || "N/A"}`);
    console.error(`  Request ID:      ${headers["x-request-id"] || headers["cf-ray"] || "N/A"}`);
    console.error(`  Provider:        ${headers["x-openrouter-provider"] || headers["x-powered-by"] || "N/A"}`);
    console.error(`  Retry-After:     ${headers["retry-after"] || headers["x-ratelimit-reset"] || "N/A"}`);

    console.error(`\n  --- Response Headers ---`);
    if (headers && Object.keys(headers).length > 0) {
      const relevant = ["x-request-id", "x-openrouter-provider", "retry-after", "x-ratelimit-limit", "x-ratelimit-remaining", "x-ratelimit-reset", "cf-ray", "content-type"];
      for (const key of relevant) {
        if (headers[key]) {
          console.error(`    ${key}: ${headers[key]}`);
        }
      }
    } else {
      console.error(`    (none)`);
    }

    console.error(`\n  --- Full Response Body ---`);
    if (resp?.data) {
      const bodyStr = typeof resp.data === "string" ? resp.data : JSON.stringify(resp.data, null, 2);
      console.error(bodyStr);
    } else if (error.response?.data === "") {
      console.error(`    (empty response body)`);
    } else {
      console.error(`    (no response body)`);
    }

    console.error(`\n  --- Request Payload ---`);
    if (error.config?.data) {
      try {
        const payload = JSON.parse(error.config.data);
        console.error(`    model: ${payload.model}`);
        console.error(`    stream: ${payload.stream}`);
        console.error(`    max_tokens: ${payload.max_tokens}`);
        console.error(`    messages: ${payload.messages?.length || 0}`);
      } catch (_) {
        console.error(`    ${error.config.data?.substring(0, 500)}`);
      }
    }
    console.error(`\n  Stack Trace:`);
    console.error(error.stack || error);
    console.error(`\n❌❌❌ END OPENROUTER ERROR ❌❌❌\n`);
    throw error;
  }
}

export {
  callOpenRouter,
  getModel,
  getApiKey,
  defaultHeaders,
  formatImageUrl,
  buildMessages,
  extractContent,
  buildProfileAwarePrompt,
  AI_HUB_SYSTEM_PROMPT,
  NUTRITION_SYSTEM_PROMPT,
  BASE_URL,
  CHAT_URL,
  TIMEOUT_MS,
};
