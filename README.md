# Movie API - Enhanced

A comprehensive RESTful API for movie management with advanced features including TMDB integration, personalized recommendations, ratings & reviews, and image uploads.

## Features

- **User Authentication** - JWT-based registration, login, and logout
- **Advanced Movie Search & Filtering** - By title, genre, year, rating with pagination
- **TMDB Integration** - Real movie data, search, popular movies, and import functionality
- **Ratings & Reviews System** - 1-10 star ratings with text reviews and average calculations
- **Image Upload System** - Poster and backdrop uploads with validation
- **Personalized Recommendations** - AI-powered movie suggestions based on user preferences
- **Watchlist Management** - Add, update, and organize movies to watch
- **Comprehensive API Documentation** - Detailed endpoint specifications

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (hosted on [Neon](https://console.neon.tech/))
- **ORM:** Prisma
- **Authentication:** JWT with HTTP-only cookies
- **File Uploads:** Multer with image validation
- **External APIs:** Axios for TMDB integration
- **Testing:** Jest, Supertest
- **Development:** Nodemon, Babel

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v14 or later)
- [npm](https://www.npmjs.com/)
- PostgreSQL database ([Neon](https://console.neon.tech/) recommended)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

### Environment Variables

Create a `.env` file using `.env.example` as template:

```bash
# Database
DATABASE_URL="your-postgresql-connection-string"

# Server
PORT=5001
NODE_ENV=development

# Authentication
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="7d"
JWT_COOKIE_EXPIRES_IN="7"

# TMDB API (required for TMDB features)
TMDB_API_KEY="your-tmdb-api-key-here"
```

**Important:** Get your TMDB API key from [TMDB Settings](https://www.themoviedb.org/settings/api) after creating an account.

### Database Setup

1. **Run migrations:**
   ```bash
   npx prisma migrate dev
   ```

2. **Seed the database:**
   ```bash
   npx prisma db seed
   ```

### Running the Application

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server runs on `http://localhost:5001`

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user (returns JWT token)
- `POST /auth/logout` - Logout user

### Movies
- `GET /movies` - Advanced filtering with search, genre, year, rating
- `GET /movies/:id` - Get movie by ID
- `GET /movies/search/tmdb` - Search TMDB movies
- `GET /movies/popular/tmdb` - Get popular movies from TMDB
- `GET /movies/genres/tmdb` - Get movie genres from TMDB
- `POST /movies/import/tmdb` - Import movie from TMDB
- `POST /movies` - Create movie with image uploads
- `PUT /movies/:id` - Update movie with image uploads

### Reviews
- `POST /reviews` - Create/update review and rating
- `GET /reviews/movie/:id` - Get all reviews for a movie
- `GET /reviews/user` - Get user's review history
- `GET /reviews/user/movie/:id` - Check user's rating for movie
- `DELETE /reviews/:id` - Delete user's review

### Watchlist
- `POST /watchlist` - Add movie to watchlist
- `PUT /watchlist/:id` - Update watchlist item
- `DELETE /watchlist/:id` - Remove from watchlist

### Recommendations
- `GET /recommendations/personalized` - Personalized movie suggestions
- `GET /recommendations/similar/:id` - Similar movies to given movie
- `GET /recommendations/trending` - Currently trending movies
- `GET /recommendations/preferences` - Get user preferences
- `POST /recommendations/preferences` - Set user preferences
- `POST /recommendations/preferences/update` - Auto-update preferences

## Testing

**Run all tests:**
```bash
npm test
```

**Run with coverage:**
```bash
npm run test:coverage
```

**API integration tests:**
```bash
npm run test:api
```

## Documentation

- **Detailed API Documentation:** See `API_DOCUMENTATION.md`
- **Postman Collection:** Import `movieApi-2.postman_collection.json`

## Project Structure

```
backend/
├── src/
│   ├── controllers/     # Route handlers
│   ├── routes/         # API route definitions
│   ├── services/       # Business logic & external APIs
│   ├── middleware/     # Authentication & validation
│   ├── config/         # Database configuration
│   └── utils/          # Helper functions
├── prisma/
│   ├── schema.prisma   # Database schema
│   └── seed.js         # Database seeding
├── tests/              # Unit & integration tests
├── uploads/            # Uploaded images directory
└── API_DOCUMENTATION.md
```

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with hot reload
- `npm test` - Run all tests
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:api` - Run API integration tests
- `npm run prisma:studio` - Open Prisma Studio

## Deployment

The API is ready for deployment to platforms like:
- **Vercel** - For serverless deployment
- **Heroku** - Traditional hosting
- **Railway** - Modern app hosting
- **AWS/GCP/Azure** - Cloud platforms

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.
