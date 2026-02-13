import { getPrismaClient } from "../config/db.js";
import tmdbService from "../services/tmdbService.js";
import { uploadMultiple, getFileUrl, validateUploadedFile } from "../services/uploadService.js";

// Get all movies with filtering and search
const getAllMovies = async (req, res) => {
  const { 
    search, 
    genre, 
    year, 
    minRating, 
    maxRating, 
    page = 1, 
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const prisma = await getPrismaClient();
  
  try {
    // Build where clause
    const where = {};
    
    // Search functionality
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { overview: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Genre filtering
    if (genre) {
      const genres = Array.isArray(genre) ? genre : [genre];
      where.genres = { hasEvery: genres };
    }
    
    // Year filtering
    if (year) {
      where.releaseYear = parseInt(year);
    }
    
    // Rating filtering
    if (minRating || maxRating) {
      where.averageRating = {};
      if (minRating) where.averageRating.gte = parseFloat(minRating);
      if (maxRating) where.averageRating.lte = parseFloat(maxRating);
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Sorting
    const orderBy = {};
    orderBy[sortBy] = sortOrder;
    
    // Get movies
    const [movies, totalCount] = await Promise.all([
      prisma.movie.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy,
        include: {
          reviews: {
            select: {
              rating: true
            }
          }
        }
      }),
      prisma.movie.count({ where })
    ]);
    
    // Calculate average rating for each movie
    const moviesWithRatings = movies.map(movie => ({
      ...movie,
      averageRating: movie.averageRating || 0,
      ratingCount: movie.ratingCount || 0
    }));
    
    res.status(200).json({
      status: 'success',
      data: moviesWithRatings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get movies error:', error);
    res.status(500).json({ error: 'Failed to get movies' });
  }
};

// Get movie by ID
const getMovieById = async (req, res) => {
  const { id } = req.params;
  
  const prisma = await getPrismaClient();
  
  try {
    const movie = await prisma.movie.findUnique({
      where: { id },
      include: {
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });
    
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    
    res.status(200).json({
      status: 'success',
      data: movie
    });
  } catch (error) {
    console.error('Get movie by ID error:', error);
    res.status(500).json({ error: 'Failed to get movie' });
  }
};

// Search movies from TMDB
const searchMovies = async (req, res) => {
  const { query, page = 1 } = req.query;
  
  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }
  
  try {
    const results = await tmdbService.searchMovies(query, page);
    
    res.status(200).json({
      status: 'success',
      data: results
    });
  } catch (error) {
    console.error('Search movies error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get popular movies from TMDB
const getPopularMovies = async (req, res) => {
  const { page = 1 } = req.query;
  
  try {
    const results = await tmdbService.getPopularMovies(page);
    
    res.status(200).json({
      status: 'success',
      data: results
    });
  } catch (error) {
    console.error('Get popular movies error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get movies by genre from TMDB
const getMoviesByGenre = async (req, res) => {
  const { genreId, page = 1 } = req.query;
  
  if (!genreId) {
    return res.status(400).json({ error: 'Genre ID is required' });
  }
  
  try {
    const results = await tmdbService.getMoviesByGenre(genreId, page);
    
    res.status(200).json({
      status: 'success',
      data: results
    });
  } catch (error) {
    console.error('Get movies by genre error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get genres from TMDB
const getGenres = async (req, res) => {
  try {
    const genres = await tmdbService.getGenres();
    
    res.status(200).json({
      status: 'success',
      data: genres
    });
  } catch (error) {
    console.error('Get genres error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Import movie from TMDB
const importMovieFromTMDB = async (req, res) => {
  const { tmdbId } = req.body;
  const userId = req.user?.id;
  
  if (!tmdbId) {
    return res.status(400).json({ error: 'TMDB ID is required' });
  }
  
  const prisma = await getPrismaClient();
  
  try {
    // Check if movie already exists
    const existingMovie = await prisma.movie.findUnique({
      where: { tmdbId: parseInt(tmdbId) }
    });
    
    if (existingMovie) {
      return res.status(400).json({ error: 'Movie already exists' });
    }
    
    // Get movie details from TMDB
    const tmdbMovie = await tmdbService.getMovieDetails(tmdbId);
    
    // Create movie in database
    const movie = await prisma.movie.create({
      data: {
        title: tmdbMovie.title,
        overview: tmdbMovie.overview,
        releaseYear: tmdbMovie.releaseYear,
        genres: tmdbMovie.genres,
        runtime: tmdbMovie.runtime,
        posterUrl: tmdbMovie.posterUrl,
        backdropUrl: tmdbMovie.backdropUrl,
        tmdbId: tmdbMovie.tmdbId,
        imdbId: tmdbMovie.imdbId,
        averageRating: tmdbMovie.averageRating,
        ratingCount: tmdbMovie.ratingCount,
        popularity: tmdbMovie.popularity,
        createdBy: userId
      }
    });
    
    res.status(201).json({
      status: 'success',
      data: movie
    });
  } catch (error) {
    console.error('Import movie error:', error);
    res.status(500).json({ error: 'Failed to import movie' });
  }
};

// Create movie with image uploads
const createMovie = async (req, res) => {
  const { title, overview, releaseYear, genres, runtime } = req.body;
  const userId = req.user?.id;
  
  if (!title || !releaseYear) {
    return res.status(400).json({ error: 'Title and release year are required' });
  }
  
  const prisma = await getPrismaClient();
  
  try {
    // Handle uploaded files
    let posterUrl = null;
    let backdropUrl = null;
    
    if (req.files && req.files.length > 0) {
      const posterFile = req.files.find(file => file.fieldname === 'poster');
      const backdropFile = req.files.find(file => file.fieldname === 'backdrop');
      
      if (posterFile) {
        validateUploadedFile(posterFile);
        posterUrl = getFileUrl(posterFile.filename);
      }
      
      if (backdropFile) {
        validateUploadedFile(backdropFile);
        backdropUrl = getFileUrl(backdropFile.filename);
      }
    }
    
    // Create movie
    const movie = await prisma.movie.create({
      data: {
        title,
        overview: overview || null,
        releaseYear: parseInt(releaseYear),
        genres: genres ? JSON.parse(genres) : [],
        runtime: runtime ? parseInt(runtime) : null,
        posterUrl,
        backdropUrl,
        createdBy: userId
      }
    });
    
    res.status(201).json({
      status: 'success',
      data: movie
    });
  } catch (error) {
    console.error('Create movie error:', error);
    res.status(500).json({ error: 'Failed to create movie' });
  }
};

// Update movie with image uploads
const updateMovie = async (req, res) => {
  const { id } = req.params;
  const { title, overview, releaseYear, genres, runtime } = req.body;
  const userId = req.user?.id;
  
  const prisma = await getPrismaClient();
  
  try {
    // Check if movie exists
    const movie = await prisma.movie.findUnique({
      where: { id }
    });
    
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    
    // Handle uploaded files
    let posterUrl = movie.posterUrl;
    let backdropUrl = movie.backdropUrl;
    
    if (req.files && req.files.length > 0) {
      const posterFile = req.files.find(file => file.fieldname === 'poster');
      const backdropFile = req.files.find(file => file.fieldname === 'backdrop');
      
      if (posterFile) {
        validateUploadedFile(posterFile);
        posterUrl = getFileUrl(posterFile.filename);
      }
      
      if (backdropFile) {
        validateUploadedFile(backdropFile);
        backdropUrl = getFileUrl(backdropFile.filename);
      }
    }
    
    // Update movie
    const updatedMovie = await prisma.movie.update({
      where: { id },
      data: {
        title: title || movie.title,
        overview: overview !== undefined ? overview : movie.overview,
        releaseYear: releaseYear ? parseInt(releaseYear) : movie.releaseYear,
        genres: genres ? JSON.parse(genres) : movie.genres,
        runtime: runtime ? parseInt(runtime) : movie.runtime,
        posterUrl,
        backdropUrl
      }
    });
    
    res.status(200).json({
      status: 'success',
      data: updatedMovie
    });
  } catch (error) {
    console.error('Update movie error:', error);
    res.status(500).json({ error: 'Failed to update movie' });
  }
};

export {
  getAllMovies,
  getMovieById,
  searchMovies,
  getPopularMovies,
  getMoviesByGenre,
  getGenres,
  importMovieFromTMDB,
  createMovie,
  updateMovie
};
