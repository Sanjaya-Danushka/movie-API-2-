# Testing Guide

This guide explains how to run and understand the tests for your Movie API project.

## Test Structure

```
tests/
├── setup.js                 # Global test setup
├── testDb.js               # Database utilities for testing
├── authController.test.js  # Auth controller unit tests
├── watchlistController.test.js # Watchlist controller unit tests
├── api.test.js             # API integration tests
└── README.md               # This file
```

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode (for development)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

### API Tests Only
```bash
npm run test:api
```

### Unit Tests Only
```bash
npm run test:unit
```

## Test Types

### 1. Unit Tests
- **authController.test.js**: Tests registration and login logic
- **watchlistController.test.js**: Tests watchlist CRUD operations

### 2. Integration Tests
- **api.test.js**: Tests complete API endpoints with HTTP requests

## What's Tested

### Authentication
- User registration with password hashing
- User login with correct/incorrect credentials
- JWT token generation
- Error handling for duplicate users

### Watchlist Management
- Adding movies to watchlist
- Updating watchlist items (status, rating, notes)
- Deleting watchlist items
- Authorization (users can only modify their own items)
- Error handling for non-existent items

### API Endpoints
- All HTTP methods (GET, POST, PUT, DELETE)
- Request/response validation
- Authentication middleware
- Error status codes

## Test Database

Tests use your actual database but clean up after each test:
- Each test runs in isolation
- Database is cleared before and after each test
- Test data is seeded for each test scenario

## Mocking

- JWT token generation is mocked for consistent testing
- Authentication middleware can be bypassed for testing

## Coverage

The test suite covers:
- All controller functions
- All API endpoints
- Error scenarios
- Authorization checks
- Data validation

## Running Individual Tests

```bash
# Run a specific test file
npx jest tests/authController.test.js

# Run tests matching a pattern
npx jest --testNamePattern="register"

# Run tests in verbose mode
npx jest --verbose
```

## Troubleshooting

### Database Connection Issues
Make sure your `.env` file is properly configured with the database URL.

### Test Failures
- Check if database is accessible
- Ensure all dependencies are installed
- Verify environment variables are set

### Permission Issues
Make sure your test database user has read/write permissions.

## Best Practices

1. **Run tests before committing code**
2. **Check coverage reports** to ensure all code is tested
3. **Write tests for new features** as you develop
4. **Keep tests isolated** - don't rely on test order
5. **Use descriptive test names** that explain what's being tested
