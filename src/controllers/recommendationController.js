import recommendationService from "../services/recommendationService.js";
import { getPrismaClient } from "../config/db.js";

// Get personalized recommendations for user
const getPersonalizedRecommendations = async (req, res) => {
  const userId = req.user.id;
  const { limit = 10 } = req.query;
  
  try {
    const recommendations = await recommendationService.getPersonalizedRecommendations(
      userId, 
      parseInt(limit)
    );
    
    res.status(200).json({
      status: 'success',
      data: recommendations
    });
  } catch (error) {
    console.error('Get personalized recommendations error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get similar movies to a specific movie
const getSimilarMovies = async (req, res) => {
  const { movieId } = req.params;
  const { limit = 10 } = req.query;
  
  try {
    const similarMovies = await recommendationService.getSimilarMovies(
      movieId, 
      parseInt(limit)
    );
    
    res.status(200).json({
      status: 'success',
      data: similarMovies
    });
  } catch (error) {
    console.error('Get similar movies error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get trending movies
const getTrendingMovies = async (req, res) => {
  const { limit = 10 } = req.query;
  
  try {
    const trendingMovies = await recommendationService.getTrendingMovies(
      parseInt(limit)
    );
    
    res.status(200).json({
      status: 'success',
      data: trendingMovies
    });
  } catch (error) {
    console.error('Get trending movies error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update user preferences based on activity
const updateUserPreferences = async (req, res) => {
  const userId = req.user.id;
  
  try {
    const preferences = await recommendationService.updateUserPreferences(userId);
    
    res.status(200).json({
      status: 'success',
      data: preferences,
      message: 'User preferences updated successfully'
    });
  } catch (error) {
    console.error('Update user preferences error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get user preferences
const getUserPreferences = async (req, res) => {
  const userId = req.user.id;
  
  try {
    const prisma = await getPrismaClient();
    
    const preferences = await prisma.userPreferences.findUnique({
      where: { userId }
    });
    
    res.status(200).json({
      status: 'success',
      data: preferences || null
    });
  } catch (error) {
    console.error('Get user preferences error:', error);
    res.status(500).json({ error: 'Failed to get user preferences' });
  }
};

// Set user preferences manually
const setUserPreferences = async (req, res) => {
  const userId = req.user.id;
  const { favoriteGenres, preferredYears, minRating, maxRuntime } = req.body;
  
  try {
    const prisma = await getPrismaClient();
    
    const preferences = await prisma.userPreferences.upsert({
      where: { userId },
      update: {
        favoriteGenres: favoriteGenres || [],
        preferredYears: preferredYears || [],
        minRating: minRating || 1,
        maxRuntime: maxRuntime || null
      },
      create: {
        userId,
        favoriteGenres: favoriteGenres || [],
        preferredYears: preferredYears || [],
        minRating: minRating || 1,
        maxRuntime: maxRuntime || null
      }
    });
    
    res.status(200).json({
      status: 'success',
      data: preferences,
      message: 'User preferences set successfully'
    });
  } catch (error) {
    console.error('Set user preferences error:', error);
    res.status(500).json({ error: 'Failed to set user preferences' });
  }
};

export {
  getPersonalizedRecommendations,
  getSimilarMovies,
  getTrendingMovies,
  updateUserPreferences,
  getUserPreferences,
  setUserPreferences
};
