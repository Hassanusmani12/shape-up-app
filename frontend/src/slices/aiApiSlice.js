import { apiSlice } from "./apiSlice";

const AI_URL = "/api/ai";

export const aiApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    aiChat: builder.mutation({
      query: (data) => ({
        url: `${AI_URL}/chat`,
        method: "POST",
        body: data,
      }),
    }),
    aiCoach: builder.mutation({
      query: (data) => ({
        url: `${AI_URL}/coach`,
        method: "POST",
        body: data,
      }),
    }),
    aiFoodScanner: builder.mutation({
      query: (data) => ({
        url: `${AI_URL}/food-scanner`,
        method: "POST",
        body: data,
      }),
    }),
    aiFridgeScanner: builder.mutation({
      query: (data) => ({
        url: `${AI_URL}/fridge-scanner`,
        method: "POST",
        body: data,
      }),
    }),
    aiWorkoutGenerator: builder.mutation({
      query: (data) => ({
        url: `${AI_URL}/workout-generator`,
        method: "POST",
        body: data,
      }),
    }),
    aiMealPlanner: builder.mutation({
      query: (data) => ({
        url: `${AI_URL}/meal-planner`,
        method: "POST",
        body: data,
      }),
    }),
    aiGroceryPlanner: builder.mutation({
      query: (data) => ({
        url: `${AI_URL}/grocery-planner`,
        method: "POST",
        body: data,
      }),
    }),
    aiCheatMeal: builder.mutation({
      query: (data) => ({
        url: `${AI_URL}/cheat-meal`,
        method: "POST",
        body: data,
      }),
    }),
    aiRecoveryCoach: builder.mutation({
      query: (data) => ({
        url: `${AI_URL}/recovery-coach`,
        method: "POST",
        body: data,
      }),
    }),
    aiProgressAnalyzer: builder.mutation({
      query: (data) => ({
        url: `${AI_URL}/progress-analyzer`,
        method: "POST",
        body: data,
      }),
    }),
    aiSupplementAdvisor: builder.mutation({
      query: (data) => ({
        url: `${AI_URL}/supplement-advisor`,
        method: "POST",
        body: data,
      }),
    }),
    aiGoalPlanner: builder.mutation({
      query: (data) => ({
        url: `${AI_URL}/goal-planner`,
        method: "POST",
        body: data,
      }),
    }),
    getDailyChallenges: builder.query({
      query: () => ({
        url: `${AI_URL}/daily-challenges`,
        method: "GET",
      }),
    }),
    completeChallenge: builder.mutation({
      query: (data) => ({
        url: `${AI_URL}/daily-challenges/complete`,
        method: "POST",
        body: data,
      }),
    }),
    getAchievements: builder.query({
      query: () => ({
        url: `${AI_URL}/achievements`,
        method: "GET",
      }),
    }),
    getXPInfo: builder.query({
      query: () => ({
        url: `${AI_URL}/xp`,
        method: "GET",
      }),
    }),
    saveFoodScan: builder.mutation({
      query: (data) => ({
        url: `${AI_URL}/save-food-scan`,
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useAiChatMutation,
  useAiCoachMutation,
  useAiFoodScannerMutation,
  useAiFridgeScannerMutation,
  useAiWorkoutGeneratorMutation,
  useAiMealPlannerMutation,
  useAiGroceryPlannerMutation,
  useAiCheatMealMutation,
  useAiRecoveryCoachMutation,
  useAiProgressAnalyzerMutation,
  useAiSupplementAdvisorMutation,
  useAiGoalPlannerMutation,
  useGetDailyChallengesQuery,
  useCompleteChallengeMutation,
  useGetAchievementsQuery,
  useGetXPInfoQuery,
  useSaveFoodScanMutation,
} = aiApiSlice;
