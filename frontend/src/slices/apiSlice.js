import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.REACT_APP_API_URL || "http://localhost:5000",
  credentials: "include",
});

export const apiSlice = createApi({
  baseQuery,
  // We include 'DailyLog' here to ensure caching works for all features
  tagTypes: ["User", "Workout", "DailyLog", "Reminder"], 
  endpoints: (builder) => ({}),
});