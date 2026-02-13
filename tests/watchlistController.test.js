// Watchlist controller tests
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { addToWatchlist, deleteFromWatchlist, updateWatchlist } from '../src/controllers/watchlistController.js';
import { clearTestDatabase, seedTestUser, seedTestMovie, seedTestWatchlistItem, getTestPrismaClient } from './testDb.js';

describe('Watchlist Controller', () => {
  let prisma, testUser, testMovie;

  beforeEach(async () => {
    prisma = await getTestPrismaClient();
    await clearTestDatabase();
    
    // Seed test data
    testUser = await seedTestUser();
    testMovie = await seedTestMovie({ createdBy: testUser.id });
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await clearTestDatabase();
  });

  describe('addToWatchlist', () => {
    it('should add movie to watchlist successfully', async () => {
      const mockReq = {
        body: {
          movieId: testMovie.id,
          status: 'PLANNED',
          rating: 8,
          notes: 'Great movie!'
        },
        user: { id: testUser.id }
      };

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await addToWatchlist(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
            userId: testUser.id,
            movieId: testMovie.id,
            status: 'PLANNED',
            rating: 8,
            notes: 'Great movie!'
          })
        })
      );
    });

    it('should not add if movie does not exist', async () => {
      const mockReq = {
        body: {
          movieId: 'non-existent-movie-id'
        },
        user: { id: testUser.id }
      };

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await addToWatchlist(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Movie not found'
      });
    });

    it('should not add duplicate watchlist item', async () => {
      // Add first item
      await seedTestWatchlistItem(testUser.id, testMovie.id);

      const mockReq = {
        body: {
          movieId: testMovie.id
        },
        user: { id: testUser.id }
      };

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await addToWatchlist(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Movie already in watchlist'
      });
    });
  });

  describe('deleteFromWatchlist', () => {
    beforeEach(async () => {
      await seedTestWatchlistItem(testUser.id, testMovie.id);
    });

    it('should delete watchlist item successfully', async () => {
      const watchlistItem = await prisma.watchlistItem.findFirst({
        where: { userId: testUser.id, movieId: testMovie.id }
      });

      const mockReq = {
        params: { id: watchlistItem.id },
        user: { id: testUser.id }
      };

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await deleteFromWatchlist(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Item removed from watchlist'
      });

      // Verify item is deleted
      const deletedItem = await prisma.watchlistItem.findUnique({
        where: { id: watchlistItem.id }
      });
      expect(deletedItem).toBeNull();
    });

    it('should not delete non-existent watchlist item', async () => {
      const mockReq = {
        params: { id: 'non-existent-id' },
        user: { id: testUser.id }
      };

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await deleteFromWatchlist(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Watchlist item not found'
      });
    });

    it('should not delete item belonging to another user', async () => {
      // Create another user and their watchlist item
      const otherUser = await seedTestUser({ email: 'other@example.com' });
      const otherWatchlistItem = await seedTestWatchlistItem(otherUser.id, testMovie.id);

      const mockReq = {
        params: { id: otherWatchlistItem.id },
        user: { id: testUser.id }
      };

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await deleteFromWatchlist(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Not authorized to delete this item'
      });
    });
  });

  describe('updateWatchlist', () => {
    let watchlistItem;

    beforeEach(async () => {
      watchlistItem = await seedTestWatchlistItem(testUser.id, testMovie.id);
    });

    it('should update watchlist item successfully', async () => {
      const mockReq = {
        params: { id: watchlistItem.id },
        body: {
          status: 'COMPLETED',
          rating: 9,
          notes: 'Amazing movie!'
        },
        user: { id: testUser.id }
      };

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await updateWatchlist(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
            status: 'COMPLETED',
            rating: 9,
            notes: 'Amazing movie!'
          })
        })
      );
    });

    it('should update only provided fields', async () => {
      const mockReq = {
        params: { id: watchlistItem.id },
        body: {
          rating: 7
          // Only rating provided
        },
        user: { id: testUser.id }
      };

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await updateWatchlist(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
            rating: 7,
            status: 'PLANNED', // Should remain unchanged
            notes: 'Test watchlist item' // Should remain unchanged
          })
        })
      );
    });

    it('should not update non-existent watchlist item', async () => {
      const mockReq = {
        params: { id: 'non-existent-id' },
        body: { status: 'COMPLETED' },
        user: { id: testUser.id }
      };

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await updateWatchlist(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Watchlist item not found'
      });
    });

    it('should not update item belonging to another user', async () => {
      const otherUser = await seedTestUser({ email: 'other@example.com' });
      const otherWatchlistItem = await seedTestWatchlistItem(otherUser.id, testMovie.id);

      const mockReq = {
        params: { id: otherWatchlistItem.id },
        body: { status: 'COMPLETED' },
        user: { id: testUser.id }
      };

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await updateWatchlist(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Not authorized to update this item'
      });
    });
  });
});
