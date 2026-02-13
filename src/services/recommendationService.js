import { getPrismaClient } from "../config/db.js";

class RecommendationService {
  constructor() {
    this.prisma = null;
  }

  async getPrisma() {
    if (!this.prisma) {
      this.prisma = await getPrismaClient();
    }
    return this.prisma;
  }

  // Get personalized recommendations for a user
  async getPersonalizedRecommendations(userId, limit = 10) {
    const prisma = await this.getPrisma();
    
    try {
      // Get user's watchlist and reviews
      const [watchlist, reviews, preferences] = await Promise.all([
        prisma.watchlistItem.findMany({
          where: { userId },
          include: { movie: true }
        }),
        prisma.review.findMany({
          where: { userId },
          include: { movie: true }
        }),
        prisma.userPreferences.findUnique({
          where: { userId }
        })
      ]);

      // Extract user's favorite genres and preferred years
      const genreScores = {};
      const yearScores = {};
      const ratedMovies = new Set();

      // Process watchlist
      watchlist.forEach(item => {
        const movie = item.movie;
        if (item.status === 'COMPLETED' && item.rating) {
          ratedMovies.add(movie.id);
          movie.genres.forEach(genre => {
            genreScores[genre] = (genreScores[genre] || 0) + item.rating;
          });
          yearScores[movie.releaseYear] = (yearScores[movie.releaseYear] || 0) + item.rating;
        }
      });

      // Process reviews
      reviews.forEach(review => {
        const movie = review.movie;
        ratedMovies.add(movie.id);
        movie.genres.forEach(genre => {
          genreScores[genre] = (genreScores[genre] || 0) + review.rating;
        });
        yearScores[movie.releaseYear] = (yearScores[movie.releaseYear] || 0) + review.rating;
      });

      // Apply user preferences if available
      if (preferences) {
        preferences.favoriteGenres.forEach(genre => {
          genreScores[genre] = (genreScores[genre] || 0) + 2; // Boost preferred genres
        });
        preferences.preferredYears.forEach(year => {
          yearScores[year] = (yearScores[year] || 0) + 1; // Boost preferred years
        });
      }

      // Get candidate movies (exclude already rated/watched)
      const candidateMovies = await prisma.movie.findMany({
        where: {
          AND: [
            { id: { notIn: Array.from(ratedMovies) } },
            { averageRating: { gte: preferences?.minRating || 6.0 } }
          ]
        },
        take: 100 // Get more candidates for better recommendations
      });

      // Score each candidate movie
      const scoredMovies = candidateMovies.map(movie => {
        let score = 0;

        // Genre matching
        movie.genres.forEach(genre => {
          if (genreScores[genre]) {
            score += genreScores[genre] * 0.4;
          }
        });

        // Year matching
        if (yearScores[movie.releaseYear]) {
          score += yearScores[movie.releaseYear] * 0.2;
        }

        // Average rating bonus
        score += (movie.averageRating || 0) * 0.3;

        // Popularity bonus
        score += (movie.popularity || 0) * 0.1;

        return { ...movie, score };
      });

      // Sort by score and return top recommendations
      const recommendations = scoredMovies
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(({ score, ...movie }) => movie);

      return recommendations;
    } catch (error) {
      console.error('Get personalized recommendations error:', error);
      throw new Error('Failed to get recommendations');
    }
  }

  // Get similar movies based on genre and rating
  async getSimilarMovies(movieId, limit = 10) {
    const prisma = await this.getPrisma();
    
    try {
      // Get the reference movie
      const referenceMovie = await prisma.movie.findUnique({
        where: { id: movieId }
      });

      if (!referenceMovie) {
        throw new Error('Movie not found');
      }

      // Get movies with similar genres
      const similarMovies = await prisma.movie.findMany({
        where: {
          AND: [
            { id: { not: movieId } },
            { genres: { hasSome: referenceMovie.genres } },
            { averageRating: { gte: referenceMovie.averageRating * 0.8 } }
          ]
        },
        take: limit * 2 // Get more candidates for better filtering
      });

      // Calculate similarity scores
      const scoredMovies = similarMovies.map(movie => {
        let score = 0;

        // Genre overlap
        const commonGenres = movie.genres.filter(genre => 
          referenceMovie.genres.includes(genre)
        );
        score += (commonGenres.length / referenceMovie.genres.length) * 0.5;

        // Rating similarity
        const ratingDiff = Math.abs((movie.averageRating || 0) - (referenceMovie.averageRating || 0));
        score += (1 - ratingDiff / 10) * 0.3;

        // Year proximity
        const yearDiff = Math.abs(movie.releaseYear - referenceMovie.releaseYear);
        score += (1 - Math.min(yearDiff / 20, 1)) * 0.2;

        return { ...movie, score };
      });

      // Sort by similarity score
      const recommendations = scoredMovies
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(({ score, ...movie }) => movie);

      return recommendations;
    } catch (error) {
      console.error('Get similar movies error:', error);
      throw new Error('Failed to get similar movies');
    }
  }

  // Get trending movies (high rating + recent activity)
  async getTrendingMovies(limit = 10) {
    const prisma = await this.getPrisma();
    
    try {
      const trendingMovies = await prisma.movie.findMany({
        where: {
          AND: [
            { averageRating: { gte: 7.0 } },
            { ratingCount: { gte: 5 } }
          ]
        },
        orderBy: [
          { averageRating: 'desc' },
          { ratingCount: 'desc' },
          { popularity: 'desc' }
        ],
        take: limit
      });

      return trendingMovies;
    } catch (error) {
      console.error('Get trending movies error:', error);
      throw new Error('Failed to get trending movies');
    }
  }

  // Update user preferences based on their activity
  async updateUserPreferences(userId) {
    const prisma = await this.getPrisma();
    
    try {
      // Get user's recent activity
      const [watchlist, reviews] = await Promise.all([
        prisma.watchlistItem.findMany({
          where: { userId },
          include: { movie: true },
          orderBy: { updatedAt: 'desc' },
          take: 50
        }),
        prisma.review.findMany({
          where: { userId },
          include: { movie: true },
          orderBy: { updatedAt: 'desc' },
          take: 50
        })
      ]);

      // Analyze preferences
      const genreCounts = {};
      const yearCounts = {};
      const ratings = [];

      // Process watchlist
      watchlist.forEach(item => {
        if (item.status === 'COMPLETED' && item.rating) {
          ratings.push(item.rating);
          item.movie.genres.forEach(genre => {
            genreCounts[genre] = (genreCounts[genre] || 0) + 1;
          });
          yearCounts[item.movie.releaseYear] = (yearCounts[item.movie.releaseYear] || 0) + 1;
        }
      });

      // Process reviews
      reviews.forEach(review => {
        ratings.push(review.rating);
        review.movie.genres.forEach(genre => {
          genreCounts[genre] = (genreCounts[genre] || 0) + 1;
        });
        yearCounts[review.movie.releaseYear] = (yearCounts[review.movie.releaseYear] || 0) + 1;
      });

      // Extract top genres and years
      const topGenres = Object.entries(genreCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([genre]) => genre);

      const topYears = Object.entries(yearCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([year]) => parseInt(year));

      const avgRating = ratings.length > 0 
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
        : 5;

      // Update or create user preferences
      const preferences = await prisma.userPreferences.upsert({
        where: { userId },
        update: {
          favoriteGenres: topGenres,
          preferredYears: topYears,
          minRating: Math.round(avgRating)
        },
        create: {
          userId,
          favoriteGenres: topGenres,
          preferredYears: topYears,
          minRating: Math.round(avgRating)
        }
      });

      return preferences;
    } catch (error) {
      console.error('Update user preferences error:', error);
      throw new Error('Failed to update user preferences');
    }
  }
}

export default new RecommendationService();
