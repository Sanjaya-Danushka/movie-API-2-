import { getPrismaClient } from "../config/db.js";

// Create or update a review
const createOrUpdateReview = async (req, res) => {
  const { movieId, rating, content } = req.body;
  const userId = req.user.id;
  
  // Validate rating (1-10)
  if (!rating || rating < 1 || rating > 10) {
    return res.status(400).json({ error: 'Rating must be between 1 and 10' });
  }
  
  const prisma = await getPrismaClient();
  
  try {
    // Check if movie exists
    const movie = await prisma.movie.findUnique({
      where: { id: movieId }
    });
    
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    
    // Check if review already exists
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_movieId: {
          userId,
          movieId
        }
      }
    });
    
    let review;
    
    if (existingReview) {
      // Update existing review
      review = await prisma.review.update({
        where: {
          userId_movieId: {
            userId,
            movieId
          }
        },
        data: {
          rating,
          content: content || null
        }
      });
    } else {
      // Create new review
      review = await prisma.review.create({
        data: {
          userId,
          movieId,
          rating,
          content: content || null
        }
      });
    }
    
    // Update movie's average rating
    await updateMovieRating(movieId);
    
    res.status(201).json({
      status: 'success',
      data: review
    });
  } catch (error) {
    console.error('Create/update review error:', error);
    res.status(500).json({ error: 'Failed to create/update review' });
  }
};

// Get reviews for a movie
const getMovieReviews = async (req, res) => {
  const { movieId } = req.params;
  const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
  
  const prisma = await getPrismaClient();
  
  try {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [reviews, totalCount] = await Promise.all([
      prisma.review.findMany({
        where: { movieId },
        skip,
        take: parseInt(limit),
        orderBy: {
          [sortBy]: sortOrder
        },
        include: {
          user: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }),
      prisma.review.count({ where: { movieId } })
    ]);
    
    res.status(200).json({
      status: 'success',
      data: reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get movie reviews error:', error);
    res.status(500).json({ error: 'Failed to get reviews' });
  }
};

// Get user's reviews
const getUserReviews = async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
  
  const prisma = await getPrismaClient();
  
  try {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [reviews, totalCount] = await Promise.all([
      prisma.review.findMany({
        where: { userId },
        skip,
        take: parseInt(limit),
        orderBy: {
          [sortBy]: sortOrder
        },
        include: {
          movie: {
            select: {
              id: true,
              title: true,
              posterUrl: true,
              releaseYear: true
            }
          }
        }
      }),
      prisma.review.count({ where: { userId } })
    ]);
    
    res.status(200).json({
      status: 'success',
      data: reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ error: 'Failed to get user reviews' });
  }
};

// Delete a review
const deleteReview = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  const prisma = await getPrismaClient();
  
  try {
    // Check if review exists and belongs to user
    const review = await prisma.review.findUnique({
      where: { id },
      include: { movie: true }
    });
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    if (review.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this review' });
    }
    
    // Delete review
    await prisma.review.delete({
      where: { id }
    });
    
    // Update movie's average rating
    await updateMovieRating(review.movieId);
    
    res.status(200).json({
      status: 'success',
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
};

// Helper function to update movie's average rating
const updateMovieRating = async (movieId) => {
  const prisma = await getPrismaClient();
  
  try {
    const reviews = await prisma.review.findMany({
      where: { movieId },
      select: { rating: true }
    });
    
    if (reviews.length === 0) {
      await prisma.movie.update({
        where: { id: movieId },
        data: {
          averageRating: 0,
          ratingCount: 0
        }
      });
      return;
    }
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    
    await prisma.movie.update({
      where: { id: movieId },
      data: {
        averageRating,
        ratingCount: reviews.length
      }
    });
  } catch (error) {
    console.error('Update movie rating error:', error);
  }
};

// Get user's rating for a specific movie
const getUserMovieRating = async (req, res) => {
  const { movieId } = req.params;
  const userId = req.user.id;
  
  const prisma = await getPrismaClient();
  
  try {
    const review = await prisma.review.findUnique({
      where: {
        userId_movieId: {
          userId,
          movieId
        }
      },
      select: {
        id: true,
        rating: true,
        content: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    res.status(200).json({
      status: 'success',
      data: review || null
    });
  } catch (error) {
    console.error('Get user movie rating error:', error);
    res.status(500).json({ error: 'Failed to get user rating' });
  }
};

export {
  createOrUpdateReview,
  getMovieReviews,
  getUserReviews,
  deleteReview,
  getUserMovieRating
};
