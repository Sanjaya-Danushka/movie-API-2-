# Movie API Documentation

## Overview
A comprehensive movie management API with search, filtering, ratings, reviews, and personalized recommendations.

## Base URL
```
http://localhost:5001
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication (`/auth`)

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Movies (`/movies`)

#### Get All Movies (with filtering)
```http
GET /movies?search=inception&genre=Action&year=2010&minRating=7&page=1&limit=20&sortBy=averageRating&sortOrder=desc
```

**Query Parameters:**
- `search`: Search in title and overview
- `genre`: Filter by genre (can be multiple)
- `year`: Filter by release year
- `minRating`/`maxRating`: Filter by rating range
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `sortBy`: Sort field (default: createdAt)
- `sortOrder`: Sort order (asc/desc, default: desc)

#### Get Movie by ID
```http
GET /movies/:id
```

#### Search Movies (TMDB)
```http
GET /movies/search/tmdb?query=inception&page=1
```

#### Get Popular Movies (TMDB)
```http
GET /movies/popular/tmdb?page=1
```

#### Get Movies by Genre (TMDB)
```http
GET /movies/genre/:genreId/tmdb?page=1
```

#### Get Genres (TMDB)
```http
GET /movies/genres/tmdb
```

#### Import Movie from TMDB
```http
POST /movies/import/tmdb
Authorization: Bearer <token>
Content-Type: application/json

{
  "tmdbId": 27205
}
```

#### Create Movie (with images)
```http
POST /movies
Authorization: Bearer <token>
Content-Type: multipart/form-data

title: "My Movie"
overview: "Movie description"
releaseYear: 2023
genres: ["Action", "Drama"]
runtime: 120
poster: [file]
backdrop: [file]
```

#### Update Movie (with images)
```http
PUT /movies/:id
Authorization: Bearer <token>
Content-Type: multipart/form-data

title: "Updated Title"
overview: "Updated description"
poster: [file]
backdrop: [file]
```

### Reviews (`/reviews`)

#### Create/Update Review
```http
POST /reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "movieId": "movie-uuid",
  "rating": 8,
  "content": "Great movie!"
}
```

#### Get Movie Reviews
```http
GET /reviews/movie/:movieId?page=1&limit=10&sortBy=createdAt&sortOrder=desc
```

#### Get User's Rating for Movie
```http
GET /reviews/user/movie/:movieId
Authorization: Bearer <token>
```

#### Get User's Reviews
```http
GET /reviews/user?page=1&limit=10
Authorization: Bearer <token>
```

#### Delete Review
```http
DELETE /reviews/:id
Authorization: Bearer <token>
```

### Watchlist (`/watchlist`)

#### Add to Watchlist
```http
POST /watchlist
Authorization: Bearer <token>
Content-Type: application/json

{
  "movieId": "movie-uuid",
  "status": "PLANNED",
  "rating": 8,
  "notes": "Looking forward to this!"
}
```

#### Update Watchlist Item
```http
PUT /watchlist/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "COMPLETED",
  "rating": 9,
  "notes": "Amazing movie!"
}
```

#### Delete from Watchlist
```http
DELETE /watchlist/:id
Authorization: Bearer <token>
```

### Recommendations (`/recommendations`)

#### Get Personalized Recommendations
```http
GET /recommendations/personalized?limit=10
Authorization: Bearer <token>
```

#### Get Similar Movies
```http
GET /recommendations/similar/:movieId?limit=10
```

#### Get Trending Movies
```http
GET /recommendations/trending?limit=10
```

#### Get User Preferences
```http
GET /recommendations/preferences
Authorization: Bearer <token>
```

#### Set User Preferences
```http
POST /recommendations/preferences
Authorization: Bearer <token>
Content-Type: application/json

{
  "favoriteGenres": ["Action", "Sci-Fi"],
  "preferredYears": [2010, 2015, 2020],
  "minRating": 7,
  "maxRuntime": 180
}
```

#### Update User Preferences (Auto)
```http
POST /recommendations/preferences/update
Authorization: Bearer <token>
```

## Data Models

### Movie
```json
{
  "id": "uuid",
  "title": "string",
  "overview": "string",
  "releaseYear": "number",
  "genres": ["string"],
  "runtime": "number",
  "posterUrl": "string",
  "backdropUrl": "string",
  "tmdbId": "number",
  "imdbId": "string",
  "averageRating": "number",
  "ratingCount": "number",
  "popularity": "number",
  "createdBy": "uuid",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Review
```json
{
  "id": "uuid",
  "userId": "uuid",
  "movieId": "uuid",
  "rating": "number",
  "content": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Watchlist Item
```json
{
  "id": "uuid",
  "userId": "uuid",
  "movieId": "uuid",
  "status": "PLANNED|WATCHING|COMPLETED|DROPPED",
  "rating": "number",
  "notes": "string",
  "createdAt": "datetime"
}
```

### User Preferences
```json
{
  "id": "uuid",
  "userId": "uuid",
  "favoriteGenres": ["string"],
  "preferredYears": ["number"],
  "minRating": "number",
  "maxRuntime": "number",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

## Rate Limiting
- API requests are limited to 100 requests per minute per IP
- Image uploads are limited to 5MB per file
- Maximum 2 images per upload (poster + backdrop)

## TMDB Integration
The API integrates with The Movie Database (TMDB) for:
- Movie search
- Popular movies
- Genre information
- Movie details and metadata

**Note:** You need to set up a `TMDB_API_KEY` in your `.env` file to use TMDB features.

## File Uploads
- Supported formats: JPG, PNG, GIF, WebP
- Maximum file size: 5MB per image
- Images are stored in `/uploads` directory
- Accessible via `/uploads/filename.jpg`
