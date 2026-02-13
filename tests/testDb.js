// Test database utilities
import { getPrismaClient } from '../src/config/db.js';

let testPrisma;

export const getTestPrismaClient = async () => {
  if (!testPrisma) {
    testPrisma = await getPrismaClient();
  }
  return testPrisma;
};

export const clearTestDatabase = async () => {
  const prisma = await getTestPrismaClient();
  
  try {
    // Clear all tables in correct order (respect foreign keys)
    await prisma.watchlistItem.deleteMany();
  } catch (error) {
    // Ignore if table doesn't exist or other errors
    console.log('Warning: Could not clear watchlistItem table:', error.message);
  }
  
  try {
    await prisma.user.deleteMany();
  } catch (error) {
    console.log('Warning: Could not clear user table:', error.message);
  }
  
  try {
    await prisma.movie.deleteMany();
  } catch (error) {
    console.log('Warning: Could not clear movie table:', error.message);
  }
};

export const seedTestUser = async (userData = {}) => {
  const prisma = await getTestPrismaClient();
  
  const defaultUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedpassword123',
    ...userData
  };
  
  return await prisma.user.create({
    data: defaultUser
  });
};

export const seedTestMovie = async (movieData = {}) => {
  const prisma = await getTestPrismaClient();
  
  const defaultMovie = {
    title: 'Test Movie',
    overview: 'A test movie for testing',
    releaseYear: 2023,
    genres: ['Action', 'Test'],
    runtime: 120,
    posteUrl: 'https://example.com/test.jpg',
    createdBy: 'test-user-id',
    ...movieData
  };
  
  return await prisma.movie.create({
    data: defaultMovie
  });
};

export const seedTestWatchlistItem = async (userId, movieId, itemData = {}) => {
  const prisma = await getTestPrismaClient();
  
  const defaultItem = {
    status: 'PLANNED',
    rating: 8,
    notes: 'Test watchlist item',
    ...itemData
  };
  
  return await prisma.watchlistItem.create({
    data: {
      userId,
      movieId,
      ...defaultItem
    }
  });
};
