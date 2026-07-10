import mongoose from "mongoose";

const nutritionSchema = mongoose.Schema(
  {
    userId: { type: String, required: true },
    foodQuery: { type: String, default: "" },
    prompt: { type: String, default: "" },
    image: { type: String, default: null },
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fats: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 },
    sugar: { type: Number, default: 0 },
    sodium: { type: Number, default: 0 },
    healthScore: { type: Number, default: 0 },
    confidence: { type: Number, default: 0 },
    analysis: { type: String, default: "" },
    aiFeedback: { type: String, default: "" },
    suggestions: { type: String, default: "" },
    mealType: { type: String, default: "meal" },
    foods: { type: String, default: "[]" },
    date: {
      type: String,
      default: () => new Date().toISOString().split("T")[0],
    },
  },
  { timestamps: true }
);

nutritionSchema.index({ userId: 1, date: -1 });

const Nutrition = mongoose.model("Nutrition", nutritionSchema);
export default Nutrition;
