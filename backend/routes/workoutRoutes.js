import express from "express";
import {
  createWorkout,
  getWorkouts,
  getWorkoutByDate,
  deleteWorkout,
} from "../controllers/workoutController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").post(protect, createWorkout).get(protect, getWorkouts);
router.route("/:date").get(protect, getWorkoutByDate).delete(protect, deleteWorkout);

export default router;