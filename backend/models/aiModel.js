import mongoose from "mongoose";

const chatSessionSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tool: { type: String, enum: ["coach", "food-scanner", "fridge-scanner", "workout-generator", "meal-planner", "grocery-planner", "cheat-meal", "recovery-coach", "progress-analyzer", "supplement-advisor", "goal-planner", "general"], default: "general" },
  messages: [{
    role: { type: String, enum: ["user", "assistant", "system"], required: true },
    content: { type: String, required: true },
    imageData: { type: String },
    timestamp: { type: Date, default: Date.now }
  }],
  // Stores the last food/fridge analysis so follow-up questions don't require a new image
  lastFoodAnalysis: { type: mongoose.Schema.Types.Mixed, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

chatSessionSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});

const xpSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  totalXP: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  levelTitle: { type: String, default: "Beginner" },
  xpHistory: [{
    amount: { type: Number, required: true },
    source: { type: String, required: true },
    description: { type: String },
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

const dailyChallengeSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true },
  challenges: [{
    title: { type: String, required: true },
    description: { type: String },
    target: { type: String },
    xpReward: { type: Number, default: 100 },
    completed: { type: Boolean, default: false },
    progress: { type: Number, default: 0 }
  }],
  createdAt: { type: Date, default: Date.now }
});

dailyChallengeSchema.index({ user: 1, date: 1 }, { unique: true });

const achievementSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  achievements: [{
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    icon: { type: String },
    unlockedAt: { type: Date, default: Date.now },
    xpReward: { type: Number, default: 0 }
  }],
  createdAt: { type: Date, default: Date.now }
});

const LEVEL_TITLES = [
  { level: 1, title: "Beginner", xpRequired: 0 },
  { level: 2, title: "Rookie", xpRequired: 500 },
  { level: 3, title: "Warrior", xpRequired: 1500 },
  { level: 4, title: "Beast", xpRequired: 3500 },
  { level: 5, title: "Elite", xpRequired: 7000 },
  { level: 6, title: "Legend", xpRequired: 12000 },
];

function getLevelInfo(totalXP) {
  let currentLevel = LEVEL_TITLES[0];
  for (let i = LEVEL_TITLES.length - 1; i >= 0; i--) {
    if (totalXP >= LEVEL_TITLES[i].xpRequired) {
      currentLevel = LEVEL_TITLES[i];
      break;
    }
  }
  const nextLevel = LEVEL_TITLES.find(l => l.xpRequired > totalXP) || LEVEL_TITLES[LEVEL_TITLES.length - 1];
  const xpForNext = nextLevel.xpRequired - currentLevel.xpRequired;
  const xpProgress = totalXP - currentLevel.xpRequired;
  const progressPercent = xpForNext > 0 ? Math.min((xpProgress / xpForNext) * 100, 100) : 100;
  const xpRemaining = Math.max(nextLevel.xpRequired - totalXP, 0);

  return {
    level: currentLevel.level,
    title: currentLevel.title,
    totalXP,
    progressPercent: Math.round(progressPercent),
    xpRemaining,
    xpForNextLevel: xpForNext,
    nextLevelTitle: nextLevel.title
  };
}

const ALL_ACHIEVEMENTS = [
  { id: "first-workout", title: "First Workout", description: "Complete your first workout", icon: "🏋️", xpReward: 50 },
  { id: "7-day-streak", title: "7 Day Streak", description: "Log in for 7 consecutive days", icon: "🔥", xpReward: 200 },
  { id: "30-day-streak", title: "30 Day Streak", description: "Log in for 30 consecutive days", icon: "💪", xpReward: 500 },
  { id: "protein-master", title: "Protein Master", description: "Hit protein goal for 7 days", icon: "🥩", xpReward: 150 },
  { id: "hydration-king", title: "Hydration King", description: "Hit water goal for 7 days", icon: "💧", xpReward: 150 },
  { id: "calorie-crusher", title: "Calorie Crusher", description: "Stay within calorie goal for 7 days", icon: "⚡", xpReward: 200 },
  { id: "workout-10", title: "Dedicated", description: "Complete 10 workouts", icon: "🎯", xpReward: 300 },
  { id: "workout-50", title: "Beast Mode", description: "Complete 50 workouts", icon: "🦁", xpReward: 1000 },
  { id: "workout-100", title: "Fitness Legend", description: "Complete 100 workouts", icon: "🏆", xpReward: 2500 },
  { id: "ai-pioneer", title: "AI Pioneer", description: "Use any AI tool for the first time", icon: "🤖", xpReward: 100 },
  { id: "food-scanner", title: "Food Detective", description: "Scan your first food", icon: "🔍", xpReward: 50 },
  { id: "meal-planner", title: "Meal Master", description: "Generate your first meal plan", icon: "🍽️", xpReward: 100 },
];

export const ChatSession = mongoose.model("ChatSession", chatSessionSchema);
export const XP = mongoose.model("XP", xpSchema);
export const DailyChallenge = mongoose.model("DailyChallenge", dailyChallengeSchema);
export const Achievement = mongoose.model("Achievement", achievementSchema);
export { getLevelInfo, LEVEL_TITLES, ALL_ACHIEVEMENTS };
