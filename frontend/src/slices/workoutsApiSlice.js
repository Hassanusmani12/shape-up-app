import { apiSlice } from "./apiSlice";

const WORKOUTS_URL = "/api/workouts";

const matchDate = (workout, dateStr) => {
  const ws = workout.date?.split?.('T')[0] || '';
  return ws === dateStr;
};

export const workoutsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createWorkout: builder.mutation({
      query: (data) => ({
        url: `${WORKOUTS_URL}`,
        method: "POST",
        body: data,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        const patchDaily = dispatch(
          apiSlice.util.updateQueryData('getWorkoutByDate', arg.date, (draft) => {
            if (!draft) {
              return { exercises: arg.exercises };
            }
            if (arg.exercises.length === 1) {
              draft.exercises = [...(draft.exercises || []), ...arg.exercises];
            } else {
              draft.exercises = arg.exercises;
            }
          })
        );

        const patchAll = dispatch(
          apiSlice.util.updateQueryData('getWorkouts', undefined, (draft) => {
            if (!Array.isArray(draft)) return;
            const idx = draft.findIndex((w) => matchDate(w, arg.date));
            if (idx !== -1) {
              if (arg.exercises.length === 1) {
                draft[idx].exercises = [...(draft[idx].exercises || []), ...arg.exercises];
              } else {
                draft[idx].exercises = arg.exercises;
              }
            } else {
              draft.unshift({
                date: arg.date,
                exercises: [...arg.exercises],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchDaily.undo();
          patchAll.undo();
        }
      },
    }),

    getWorkouts: builder.query({
      query: () => ({
        url: `${WORKOUTS_URL}`,
        method: "GET",
      }),
      providesTags: ["Workout"],
    }),

    getWorkoutByDate: builder.query({
      query: (date) => ({
        url: `${WORKOUTS_URL}/${date}`,
        method: "GET",
      }),
      providesTags: (result, error, date) => [{ type: "Workout", id: date }],
    }),

    deleteExercise: builder.mutation({
      query: (data) => ({
        url: `${WORKOUTS_URL}/${data.date}`,
        method: "DELETE",
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        const patchDaily = dispatch(
          apiSlice.util.updateQueryData('getWorkoutByDate', arg.date, (draft) => {
            if (draft) {
              draft.exercises = [];
            }
          })
        );

        const patchAll = dispatch(
          apiSlice.util.updateQueryData('getWorkouts', undefined, (draft) => {
            if (!Array.isArray(draft)) return;
            const idx = draft.findIndex((w) => matchDate(w, arg.date));
            if (idx !== -1) {
              draft.splice(idx, 1);
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchDaily.undo();
          patchAll.undo();
        }
      },
    }),
  }),
});

export const {
  useCreateWorkoutMutation,
  useGetWorkoutsQuery,
  useGetWorkoutByDateQuery,
  useDeleteExerciseMutation,
} = workoutsApiSlice;