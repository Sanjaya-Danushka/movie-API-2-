import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createOrUpdateReview,
  getMovieReviews,
  getUserReviews,
  deleteReview,
  getUserMovieRating
} from "../controllers/reviewController.js";

const router = express.Router();

// Create or update a review (protected)
router.post("/", authMiddleware, createOrUpdateReview);

// Get reviews for a movie
router.get("/movie/:movieId", getMovieReviews);

// Get user's rating for a specific movie (protected)
router.get("/user/movie/:movieId", authMiddleware, getUserMovieRating);

// Get user's reviews (protected)
router.get("/user", authMiddleware, getUserReviews);

// Delete a review (protected)
router.delete("/:id", authMiddleware, deleteReview);

export default router;
