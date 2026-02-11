# Testing Guide

This project includes comprehensive unit tests for both the frontend and backend codebases.

## Test Summary

**Frontend Tests:** 61 passing tests
**Backend Tests:** 47 passing tests
**Total:** 108 passing tests

## Frontend Testing (Vitest + React Testing Library)

### Setup

The frontend uses Vitest as the test runner with React Testing Library for component tests.

**Configuration:**
- `vitest.config.ts` - Vitest configuration
- `src/test/setup.ts` - Global test setup
- `src/test/test-utils.tsx` - Custom render utilities with providers

### Test Coverage

#### Utils Tests
- `utils/cn.test.ts` - TailwindCSS class name utility
- `utils/apiError.test.ts` - API error message mapping
- `utils/candidates/candidateUtils.test.ts` - Filtering and sorting logic

#### Hooks Tests
- `hooks/generate/useGenerateFlow.test.ts` - Candidate generation flow
- `store/useAppStore.test.ts` - Zustand global state management

#### Component Tests
- `components/candidates/CandidateFilters.test.tsx` - Search and filter UI
- `components/ranking/RankingForm.test.tsx` - Ranking criteria input
- `components/ranking/RankingStats.test.tsx` - Ranking statistics display

### Running Frontend Tests

```bash
cd client

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

## Backend Testing (Jest + Supertest)

### Setup

The backend uses Jest as the test runner with mocked Prisma client for database operations.

**Configuration:**
- `jest.config.js` - Jest configuration
- `src/test/setup.ts` - Global test setup
- `src/test/mockData.ts` - Mock data factories

### Test Coverage

#### Utils Tests
- `utils/AppError.test.ts` - Custom error classes

#### Middleware Tests
- `middleware/auth.test.ts` - API key authentication
- `middleware/validation.test.ts` - Zod request validation
- `middleware/errorHandler.test.ts` - Global error handling

#### DAL Tests
- `dal/candidateRepository.test.ts` - Candidate data access layer
- `dal/rankingRepository.test.ts` - Ranking data access layer

#### Controller Tests
- `controllers/candidateController.test.ts` - Candidate endpoints
- `controllers/rankingController.test.ts` - Ranking endpoints

### Running Backend Tests

```bash
cd server

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Test Patterns & Best Practices

### Frontend

1. **Component Testing:** Use React Testing Library queries (getByRole, getByText)
2. **User Interactions:** Use userEvent for realistic user interactions
3. **Async Operations:** Use waitFor for async state updates
4. **Mocking:** Mock API calls and external dependencies
5. **Providers:** Always wrap components with necessary providers (QueryClient, etc.)

### Backend

1. **Repository Tests:** Mock Prisma client to test data access logic
2. **Controller Tests:** Mock dependencies (repositories, services) to test request/response handling
3. **Middleware Tests:** Test request/response/next flow with mock objects
4. **Error Handling:** Test both success and error scenarios
5. **Validation:** Test Zod schema validation with valid/invalid inputs

## CI/CD Integration

Tests are designed to run in CI environments:

```bash
# Frontend
cd client && npm ci && npm test -- --run

# Backend
cd server && npm ci && npm test
```

## Coverage Reports

Both frontend and backend generate coverage reports:

- **Frontend:** `client/coverage/`
- **Backend:** `server/coverage/`

Open `coverage/index.html` in each directory to view detailed coverage reports.

## Common Issues

### Frontend

- **Act warnings:** Ensure all state updates are wrapped in `act()` or use `waitFor()`
- **Fake timers:** Remember to call `vi.useRealTimers()` in `afterEach` if using fake timers
- **Provider errors:** Ensure components are wrapped with `QueryClientProvider`

### Backend

- **Mock persistence:** Always call `jest.clearAllMocks()` in `beforeEach`
- **Async tests:** Use `async/await` for all async operations
- **Type errors:** Explicitly type mocked Request/Response objects

## Future Improvements

- Add integration tests with test database
- Add E2E tests using Playwright or Cypress
- Increase coverage to 90%+ for critical paths
- Add performance/load tests for AI endpoints
- Add visual regression tests for UI components
