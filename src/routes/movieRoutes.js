import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { uploadMultiple } from "../services/uploadService.js";
import {
  getAllMovies,
  getMovieById,
  searchMovies,
  getPopularMovies,
  getMoviesByGenre,
  getGenres,
  importMovieFromTMDB,
  createMovie,
  updateMovie
} from "../controllers/movieController.js";

const router = express.Router();

// Get all movies with filtering and search
router.get("/", getAllMovies);

// Get movie by ID
router.get("/:id", getMovieById);

// Search movies from TMDB
router.get("/search/tmdb", searchMovies);

// Get popular movies from TMDB
router.get("/popular/tmdb", getPopularMovies);

// Get movies by genre from TMDB
router.get("/genre/:genreId/tmdb", getMoviesByGenre);

// Get genres from TMDB
router.get("/genres/tmdb", getGenres);

// Import movie from TMDB (protected)
router.post("/import/tmdb", authMiddleware, importMovieFromTMDB);

// Create movie with image uploads (protected)
router.post("/", authMiddleware, uploadMultiple('images', 2), createMovie);

// Update movie with image uploads (protected)
router.put("/:id", authMiddleware, uploadMultiple('images', 2), updateMovie);

export default router;
