// TMDB API Service
import axios from 'axios';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

class TMDBService {
  constructor() {
    this.apiKey = process.env.TMDB_API_KEY;
    this.baseURL = TMDB_BASE_URL;
    this.imageBaseURL = TMDB_IMAGE_BASE_URL;
    
    if (!this.apiKey) {
      console.warn('TMDB_API_KEY not found in environment variables');
    }
  }

  // Search movies
  async searchMovies(query, page = 1) {
    if (!this.apiKey) {
      throw new Error('TMDB API key is required');
    }

    try {
      const response = await axios.get(`${this.baseURL}/search/movie`, {
        params: {
          api_key: this.apiKey,
          query: query,
          page: page,
          include_adult: false
        }
      });

      return {
        results: response.data.results.map(movie => this.transformMovieData(movie)),
        totalResults: response.data.total_results,
        totalPages: response.data.total_pages,
        currentPage: response.data.page
      };
    } catch (error) {
      console.error('TMDB search error:', error.message);
      throw new Error('Failed to search movies');
    }
  }

  // Get movie details
  async getMovieDetails(tmdbId) {
    if (!this.apiKey) {
      throw new Error('TMDB API key is required');
    }

    try {
      const response = await axios.get(`${this.baseURL}/movie/${tmdbId}`, {
        params: {
          api_key: this.apiKey,
          append_to_response: 'credits,videos'
        }
      });

      return this.transformMovieData(response.data);
    } catch (error) {
      console.error('TMDB movie details error:', error.message);
      throw new Error('Failed to get movie details');
    }
  }

  // Get popular movies
  async getPopularMovies(page = 1) {
    if (!this.apiKey) {
      throw new Error('TMDB API key is required');
    }

    try {
      const response = await axios.get(`${this.baseURL}/movie/popular`, {
        params: {
          api_key: this.apiKey,
          page: page,
          include_adult: false
        }
      });

      return {
        results: response.data.results.map(movie => this.transformMovieData(movie)),
        totalResults: response.data.total_results,
        totalPages: response.data.total_pages,
        currentPage: response.data.page
      };
    } catch (error) {
      console.error('TMDB popular movies error:', error.message);
      throw new Error('Failed to get popular movies');
    }
  }

  // Get movies by genre
  async getMoviesByGenre(genreId, page = 1) {
    if (!this.apiKey) {
      throw new Error('TMDB API key is required');
    }

    try {
      const response = await axios.get(`${this.baseURL}/discover/movie`, {
        params: {
          api_key: this.apiKey,
          with_genres: genreId,
          page: page,
          include_adult: false
        }
      });

      return {
        results: response.data.results.map(movie => this.transformMovieData(movie)),
        totalResults: response.data.total_results,
        totalPages: response.data.total_pages,
        currentPage: response.data.page
      };
    } catch (error) {
      console.error('TMDB genre movies error:', error.message);
      throw new Error('Failed to get movies by genre');
    }
  }

  // Get genres list
  async getGenres() {
    if (!this.apiKey) {
      throw new Error('TMDB API key is required');
    }

    try {
      const response = await axios.get(`${this.baseURL}/genre/movie/list`, {
        params: {
          api_key: this.apiKey
        }
      });

      return response.data.genres;
    } catch (error) {
      console.error('TMDB genres error:', error.message);
      throw new Error('Failed to get genres');
    }
  }

  // Transform TMDB movie data to our format
  transformMovieData(movie) {
    return {
      tmdbId: movie.id,
      title: movie.title,
      overview: movie.overview,
      releaseYear: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
      genres: movie.genre_ids || [],
      posterUrl: movie.poster_path ? `${this.imageBaseURL}${movie.poster_path}` : null,
      backdropUrl: movie.backdrop_path ? `${this.imageBaseURL}${movie.backdrop_path}` : null,
      averageRating: movie.vote_average ? movie.vote_average / 2 : 0, // Convert from 10 to 5 scale
      ratingCount: movie.vote_count || 0,
      popularity: movie.popularity || 0,
      runtime: movie.runtime,
      imdbId: movie.imdb_id
    };
  }

  // Get full image URL
  getImageUrl(path, size = 'w500') {
    if (!path) return null;
    return `https://image.tmdb.org/t/p/${size}${path}`;
  }
}

export default new TMDBService();
