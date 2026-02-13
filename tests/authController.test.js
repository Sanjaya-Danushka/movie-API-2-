// Auth controller tests
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import bcrypt from 'bcryptjs';
import { register, login } from '../src/controllers/authController.js';
import { clearTestDatabase, seedTestUser, getTestPrismaClient } from './testDb.js';

// Mock the generateToken function
jest.mock('../src/utils/generateToken.js', () => ({
  generateToken: jest.fn((userId, res) => `mock-token-${userId}`)
}));

describe('Auth Controller', () => {
  let prisma;

  beforeEach(async () => {
    prisma = await getTestPrismaClient();
    await clearTestDatabase();
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await clearTestDatabase();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const mockReq = {
        body: {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123'
        }
      };

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        cookie: jest.fn()
      };

      await register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
            user: expect.objectContaining({
              name: 'John Doe',
              email: 'john@example.com'
            })
          })
        })
      );
    });

    it('should not register user if email already exists', async () => {
      // Seed existing user
      await seedTestUser({ email: 'existing@example.com' });

      const mockReq = {
        body: {
          name: 'Jane Doe',
          email: 'existing@example.com',
          password: 'password123'
        }
      };

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        cookie: jest.fn()
      };

      await register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'User already exists'
      });
    });

    it('should hash the password before saving', async () => {
      const mockReq = {
        body: {
          name: 'Test User',
          email: 'test@example.com',
          password: 'plainpassword'
        }
      };

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        cookie: jest.fn()
      };

      await register(mockReq, mockRes);

      // Get the created user
      const user = await prisma.user.findUnique({
        where: { email: 'test@example.com' }
      });

      expect(user.password).not.toBe('plainpassword');
      expect(bcrypt.compareSync('plainpassword', user.password)).toBe(true);
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      // Create a test user with hashed password
      const hashedPassword = await bcrypt.hash('password123', 10);
      await seedTestUser({
        email: 'test@example.com',
        password: hashedPassword
      });
    });

    it('should login user with correct credentials', async () => {
      const mockReq = {
        body: {
          email: 'test@example.com',
          password: 'password123'
        }
      };

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        cookie: jest.fn()
      };

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
            user: expect.objectContaining({
              email: 'test@example.com'
            })
          })
        })
      );
    });

    it('should not login user with wrong email', async () => {
      const mockReq = {
        body: {
          email: 'wrong@example.com',
          password: 'password123'
        }
      };

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        cookie: jest.fn()
      };

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'User does not exist'
      });
    });

    it('should not login user with wrong password', async () => {
      const mockReq = {
        body: {
          email: 'test@example.com',
          password: 'wrongpassword'
        }
      };

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        cookie: jest.fn()
      };

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Password is incorrect'
      });
    });
  });
});
