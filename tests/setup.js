// Test setup file
import { disconnectDB } from '../src/config/db.js';

// Global test teardown
afterAll(async () => {
  await disconnectDB();
});

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.JWT_EXPIRES_IN = '1h';
process.env.JWT_COOKIE_EXPIRES_IN = '1';
