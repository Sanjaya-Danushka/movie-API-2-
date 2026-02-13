// API integration tests
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import 'dotenv/config';
import { connectDB, disconnectDB } from '../src/config/db.js';
import authRoutes from '../src/routes/authRouts.js';
import watchlistRoutes from '../src/routes/watchlistRoute.js';
import movieRoutes from '../src/routes/movieRoutes.js';
import { clearTestDatabase, seedTestUser, seedTestMovie, seedTestWatchlistItem, getTestPrismaClient } from './testDb.js';

// Mock JWT generation for testing
jest.mock('../src/utils/generateToken.js', () => ({
  generateToken: jest.fn((userId, res) => {
    res.cookie('jwt', `mock-token-${userId}`, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict'
    });
    return `mock-token-${userId}`;
  })
}));

describe('API Integration Tests', () => {
  let app, prisma, testUser, testMovie, authToken;

  beforeAll(async () => {
    // Connect to test database
    await connectDB();
    prisma = await getTestPrismaClient();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    await clearTestDatabase();
    
    // Create test app
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    
    // Routes
    app.use('/auth', authRoutes);
    app.use('/watchlist', watchlistRoutes);
    app.use('/movies', movieRoutes);
    
    // Seed test data
    testUser = await seedTestUser();
    testMovie = await seedTestMovie({ createdBy: testUser.id });
    authToken = `mock-token-${testUser.id}`;
    
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await clearTestDatabase();
  });

  describe('Auth Endpoints', () => {
    describe('POST /auth/register', () => {
      it('should register a new user', async () => {
        const userData = {
          name: 'New User',
          email: 'newuser@example.com',
          password: 'password123'
        };

        const response = await request(app)
          .post('/auth/register')
          .send(userData)
          .expect(201);

        expect(response.body.status).toBe('success');
        expect(response.body.data.user.email).toBe(userData.email);
        expect(response.body.data.user.name).toBe(userData.name);
        expect(response.headers['set-cookie']).toBeDefined();
      });

      it('should not register user with existing email', async () => {
        const userData = {
          name: 'Duplicate User',
          email: testUser.email,
          password: 'password123'
        };

        const response = await request(app)
          .post('/auth/register')
          .send(userData)
          .expect(400);

        expect(response.body.error).toBe('User already exists');
      });

      it('should validate required fields', async () => {
        const response = await request(app)
          .post('/auth/register')
          .send({ name: 'Test' })
          .expect(400);

        expect(response.body.error).toBeDefined();
      });
    });

    describe('POST /auth/login', () => {
      beforeEach(async () => {
        // Create user with known password for login tests
        const bcrypt = await import('bcryptjs');
        const hashedPassword = await bcrypt.hash('password123', 10);
        testUser = await seedTestUser({ 
          email: 'login@example.com',
          password: hashedPassword 
        });
      });

      it('should login user with correct credentials', async () => {
        const loginData = {
          email: 'login@example.com',
          password: 'password123'
        };

        const response = await request(app)
          .post('/auth/login')
          .send(loginData)
          .expect(201);

        expect(response.body.status).toBe('success');
        expect(response.body.data.user.email).toBe(loginData.email);
        expect(response.headers['set-cookie']).toBeDefined();
      });

      it('should not login with wrong password', async () => {
        const loginData = {
          email: 'login@example.com',
          password: 'wrongpassword'
        };

        const response = await request(app)
          .post('/auth/login')
          .send(loginData)
          .expect(400);

        expect(response.body.error).toBe('Password is incorrect');
      });

      it('should not login with non-existent email', async () => {
        const loginData = {
          email: 'nonexistent@example.com',
          password: 'password123'
        };

        const response = await request(app)
          .post('/auth/login')
          .send(loginData)
          .expect(400);

        expect(response.body.error).toBe('User does not exist');
      });
    });
  });

  describe('Movie Endpoints', () => {
    describe('GET /movies', () => {
      it('should get all movies', async () => {
        const response = await request(app)
          .get('/movies')
          .expect(200);

        expect(response.body.status).toBe('success');
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);
      });
    });

    describe('GET /movies/:id', () => {
      it('should get a specific movie', async () => {
        const response = await request(app)
          .get(`/movies/${testMovie.id}`)
          .expect(200);

        expect(response.body.status).toBe('success');
        expect(response.body.data.id).toBe(testMovie.id);
        expect(response.body.data.title).toBe(testMovie.title);
      });

      it('should return 404 for non-existent movie', async () => {
        const response = await request(app)
          .get('/movies/non-existent-id')
          .expect(404);

        expect(response.body.error).toBeDefined();
      });
    });
  });

  describe('Watchlist Endpoints', () => {
    describe('POST /watchlist', () => {
      it('should add movie to watchlist', async () => {
        // Create a separate app with mocked auth for watchlist tests
        const watchlistApp = express();
        watchlistApp.use(express.json());
        
        // Mock auth middleware
        watchlistApp.use('/watchlist', (req, res, next) => {
          req.user = { id: testUser.id };
          next();
        }, watchlistRoutes);

        const watchlistData = {
          movieId: testMovie.id,
          status: 'PLANNED',
          rating: 8,
          notes: 'Great movie!'
        };

        const response = await request(watchlistApp)
          .post('/watchlist')
          .send(watchlistData)
          .expect(201);

        expect(response.body.status).toBe('success');
        expect(response.body.data.movieId).toBe(testMovie.id);
        expect(response.body.data.status).toBe('PLANNED');
      });

      it('should not add duplicate watchlist item', async () => {
        await seedTestWatchlistItem(testUser.id, testMovie.id);

        const watchlistApp = express();
        watchlistApp.use(express.json());
        
        watchlistApp.use('/watchlist', (req, res, next) => {
          req.user = { id: testUser.id };
          next();
        }, watchlistRoutes);

        const watchlistData = {
          movieId: testMovie.id,
          status: 'PLANNED'
        };

        const response = await request(watchlistApp)
          .post('/watchlist')
          .send(watchlistData)
          .expect(400);

        expect(response.body.error).toBe('Movie already in watchlist');
      });
    });

    describe('PUT /watchlist/:id', () => {
      let watchlistItem;

      beforeEach(async () => {
        watchlistItem = await seedTestWatchlistItem(testUser.id, testMovie.id);
      });

      it('should update watchlist item', async () => {
        const watchlistApp = express();
        watchlistApp.use(express.json());
        
        watchlistApp.use('/watchlist', (req, res, next) => {
          req.user = { id: testUser.id };
          next();
        }, watchlistRoutes);

        const updateData = {
          status: 'COMPLETED',
          rating: 9
        };

        const response = await request(watchlistApp)
          .put(`/watchlist/${watchlistItem.id}`)
          .send(updateData)
          .expect(200);

        expect(response.body.status).toBe('success');
        expect(response.body.data.status).toBe('COMPLETED');
        expect(response.body.data.rating).toBe(9);
      });
    });

    describe('DELETE /watchlist/:id', () => {
      let watchlistItem;

      beforeEach(async () => {
        watchlistItem = await seedTestWatchlistItem(testUser.id, testMovie.id);
      });

      it('should delete watchlist item', async () => {
        const watchlistApp = express();
        watchlistApp.use(express.json());
        
        watchlistApp.use('/watchlist', (req, res, next) => {
          req.user = { id: testUser.id };
          next();
        }, watchlistRoutes);

        const response = await request(watchlistApp)
          .delete(`/watchlist/${watchlistItem.id}`)
          .expect(200);

        expect(response.body.status).toBe('success');
        expect(response.body.message).toBe('Item removed from watchlist');
      });
    });
  });

  describe('Authentication Middleware', () => {
    it('should protect watchlist endpoints without auth', async () => {
      // Test without auth middleware override
      const protectedApp = express();
      protectedApp.use(express.json());
      protectedApp.use('/watchlist', watchlistRoutes);

      const response = await request(protectedApp)
        .post('/watchlist')
        .send({ movieId: testMovie.id })
        .expect(401);

      expect(response.body.error).toBeDefined();
    });
  });
});
