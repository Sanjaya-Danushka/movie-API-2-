import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  getPersonalizedRecommendations,
  getSimilarMovies,
  getTrendingMovies,
  updateUserPreferences,
  getUserPreferences,
  setUserPreferences
} from "../controllers/recommendationController.js";

const router = express.Router();

// Get personalized recommendations (protected)
router.get("/personalized", authMiddleware, getPersonalizedRecommendations);

// Get similar movies to a specific movie
router.get("/similar/:movieId", getSimilarMovies);

// Get trending movies
router.get("/trending", getTrendingMovies);

// Update user preferences based on activity (protected)
router.post("/preferences/update", authMiddleware, updateUserPreferences);

// Get user preferences (protected)
router.get("/preferences", authMiddleware, getUserPreferences);

// Set user preferences manually (protected)
router.post("/preferences", authMiddleware, setUserPreferences);

export default router;
