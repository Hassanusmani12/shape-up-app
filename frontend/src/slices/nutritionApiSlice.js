import { apiSlice } from "./apiSlice";

const NUTRITION_URL = "/api/nutrition";

export const nutritionApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    analyzeAndLog: builder.mutation({
      query: (data) => ({
        url: `${NUTRITION_URL}/analyze-and-log`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["DailyLog"],
    }),
    getDailyStats: builder.query({
      query: () => ({
        url: `${NUTRITION_URL}/daily-stats`,
      }),
      providesTags: ["DailyLog"],
    }),
    deleteNutritionEntry: builder.mutation({
      query: ({ id, userId }) => ({
        url: `${NUTRITION_URL}/entry/${id}`,
        method: "DELETE",
        body: { userId },
      }),
      invalidatesTags: ["DailyLog"],
    }),
  }),
});

export const {
  useAnalyzeAndLogMutation,
  useGetDailyStatsQuery,
  useDeleteNutritionEntryMutation,
} = nutritionApiSlice;
