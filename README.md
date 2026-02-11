# AI Recruitment System 🤖

> Production-ready AI-powered candidate CV generation and ranking system built with Claude API

## Features

### Core Functionality
- 🎯 **AI Candidate Generation** - Generate professional candidate profiles and CVs using Claude Sonnet 4
- 📊 **Smart Ranking** - Intelligent candidate scoring and ranking based on custom criteria
- 🗂️ **Interview Prioritization** - Split candidates into "Should Interview" and "Rejected" lists
- 🔍 **Advanced Filtering** - Search and sort candidates by name, email, experience, and score
- 📝 **CV Management** - View, expand, and manage candidate CVs with markdown rendering
- 🗑️ **Data Management** - Delete candidates with automatic cascade cleanup

### Production-Ready Features
- 🔐 **Authentication** - Optional API key authentication for secure endpoints
- 🛡️ **Security** - Helmet.js, CORS, rate limiting, request size limits
- ✅ **Validation** - Comprehensive Zod schema validation
- 📝 **Logging** - Winston structured logging with Morgan for HTTP requests
- ⚡ **Performance** - Virtualized lists for rendering thousands of candidates
- 🎨 **Modern UI** - Beautiful glassmorphic design with smooth animations
- 📱 **Responsive** - Fully responsive design for all screen sizes
- ♻️ **State Management** - TanStack Query for server state, Zustand for global UI state
- 🧪 **Tested** - Comprehensive unit tests (108 tests passing)

## Tech Stack

### Backend
- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL + Prisma ORM
- **AI**: Anthropic Claude API (Sonnet 4)
- **Security**: Helmet, express-rate-limit, CORS
- **Validation**: Zod
- **Logging**: Winston + Morgan
- **Testing**: Jest + Supertest (47 tests)

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **State Management**: TanStack Query + Zustand
- **Virtualization**: @tanstack/react-virtual
- **HTTP Client**: Axios
- **Testing**: Vitest + React Testing Library (61 tests)

## Prerequisites

- **Node.js** 18+ 
- **PostgreSQL** database (local or hosted, e.g. Supabase, Neon, Railway)
- **Anthropic API Key** - Get one at [console.anthropic.com](https://console.anthropic.com)

## Setup

### 1. Install dependencies

```bash
# From project root — installs root, server, and client dependencies
npm install
npm run install:all
```

### 2. Configure environment variables

```bash
# Copy the example and fill in your values
cp server/.env.example server/.env
```

Edit `server/.env` with your actual credentials:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ai_recruitment?schema=public"

# AI Service
ANTHROPIC_API_KEY=sk-ant-...

# CORS
CLIENT_URL=http://localhost:5173

# Optional: API Authentication
# API_KEY=your-secret-api-key
```

**Optional Environment Variables:**
- `API_KEY` - If set, clients must send `x-api-key` header for authentication
- `LOG_LEVEL` - Winston log level (default: `info`)

### 3. Set up the database

```bash
# Generate Prisma client
npm run prisma:generate

# Create tables via migration
npm run prisma:migrate
```

### 4. Run the application

```bash
# Start both server and client concurrently
npm run dev
```

This runs:
- **Server** on `http://localhost:3000` (Express API)
- **Client** on `http://localhost:5173` (React + Vite)

You can also run them individually:

```bash
npm run dev:server   # server only
npm run dev:client   # client only
```

## Usage

### 1. Generate Candidates

1. Navigate to the **Generate** tab
2. Select the number of candidates to generate (1-10)
3. Click **Generate Candidates**
4. AI will create realistic profiles with CVs

### 2. View Candidates

1. Navigate to the **Candidates** tab
2. Search, filter, and sort candidates
3. Click on any candidate to expand their CV
4. Delete candidates as needed

### 3. Rank Candidates

1. Navigate to the **Rankings** tab
2. Enter your job criteria (e.g., "Senior Full-Stack Engineer with React and Node.js")
3. Click **Rank All Candidates**
4. View results split into:
   - **Should Interview** (sorted by score, highest first)
   - **Not Recommended** (sorted by score)

## API Endpoints

### Candidates

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/candidates/generate` | Generate N candidates with CVs |
| `GET` | `/api/candidates` | Get all candidates (paginated) |
| `DELETE` | `/api/candidates/:id` | Delete a candidate |

### Rankings

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/rankings/rank-all` | Rank all candidates |
| `GET` | `/api/rankings` | Get all rankings (paginated) |
| `GET` | `/api/rankings/interview-list` | Get split interview lists |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check endpoint |

## Testing

The project includes comprehensive unit tests for both frontend and backend.

### Run All Tests

```bash
# Frontend tests (Vitest + React Testing Library)
cd client
npm test

# Backend tests (Jest + Supertest)
cd server
npm test
```

### Test Coverage

```bash
# Frontend coverage report
cd client
npm run test:coverage

# Backend coverage report
cd server
npm run test:coverage
```

**Test Summary:**
- ✅ 61 frontend tests passing
- ✅ 47 backend tests passing
- ✅ 108 total tests

See [TESTING.md](./TESTING.md) for detailed testing documentation.

## Project Structure

```
ai-recruitment-system/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components (by feature)
│   │   │   ├── candidates/
│   │   │   ├── generate/
│   │   │   ├── ranking/
│   │   │   └── shared/
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API client
│   │   ├── store/         # Zustand global state
│   │   ├── utils/         # Helper functions
│   │   └── test/          # Test utilities
│   └── vitest.config.ts   # Test configuration
├── server/                # Express backend
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── dal/           # Data Access Layer
│   │   ├── middleware/    # Express middleware
│   │   ├── services/      # Business logic
│   │   ├── types/         # TypeScript types
│   │   ├── utils/         # Helper functions
│   │   └── test/          # Test utilities
│   ├── prisma/            # Database schema
│   └── jest.config.js     # Test configuration
└── TESTING.md             # Testing guide
```

## Available Scripts

### Development

| Command | Description |
|---|---|
| `npm run dev` | Start server and client concurrently |
| `npm run dev:server` | Start server only |
| `npm run dev:client` | Start client only |

### Build & Production

| Command | Description |
|---|---|
| `npm run build` | Build both server and client |
| `npm run build:server` | Build server only (TypeScript → JavaScript) |
| `npm run build:client` | Build client only (Vite production build) |

### Database

| Command | Description |
|---|---|
| `npm run prisma:generate` | Regenerate Prisma client |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:studio` | Open Prisma Studio (database GUI) |

### Testing

| Command | Description |
|---|---|
| `npm run test:client` | Run frontend tests |
| `npm run test:server` | Run backend tests |
| `npm run test:coverage` | Generate coverage reports |

### Setup

| Command | Description |
|---|---|
| `npm install` | Install root dependencies |
| `npm run install:all` | Install all dependencies (root, server, client) |

## Architecture

### Backend Architecture

The backend follows a layered architecture with clear separation of concerns:

```
Request → Middleware → Controller → Service → DAL → Database
                ↓
         Error Handler
```

**Layers:**
- **Middleware**: Authentication, validation, rate limiting, logging
- **Controllers**: HTTP request/response handling
- **Services**: Business logic (AI integration, data processing)
- **DAL (Data Access Layer)**: Database operations (Prisma)
- **Error Handling**: Centralized error handling with proper status codes

### Frontend Architecture

The frontend uses a component-based architecture with hooks:

```
Component → Custom Hook → API Service → Backend
              ↓
        State Management
      (TanStack Query + Zustand)
```

**Key Patterns:**
- **Feature-based organization**: Components grouped by domain
- **Custom hooks**: Reusable logic extraction (SRP)
- **Server state**: TanStack Query for caching and sync
- **Global UI state**: Zustand for notifications and UI state
- **Virtual lists**: Performance optimization for large datasets

## Deployment

### Backend Deployment

1. **Build the application:**
   ```bash
   cd server
   npm run build
   ```

2. **Set production environment variables:**
   ```env
   NODE_ENV=production
   DATABASE_URL=your-production-db-url
   ANTHROPIC_API_KEY=your-api-key
   CLIENT_URL=https://your-frontend-url.com
   API_KEY=your-secure-api-key
   ```

3. **Run database migrations:**
   ```bash
   npm run prisma:migrate
   ```

4. **Start the server:**
   ```bash
   npm start
   ```

**Recommended Platforms:**
- Railway, Render, Fly.io (all support PostgreSQL + Node.js)
- Heroku (with PostgreSQL add-on)
- AWS/GCP/Azure (with managed PostgreSQL)

### Frontend Deployment

1. **Build the application:**
   ```bash
   cd client
   npm run build
   ```

2. **Deploy the `dist` folder to:**
   - **Vercel** (recommended - automatic deployments)
   - **Netlify** (drag-and-drop or Git integration)
   - **Cloudflare Pages**
   - **AWS S3 + CloudFront**

3. **Update environment variables:**
   - Set `VITE_API_URL` to your backend URL if needed

## Troubleshooting

### Common Issues

**"Cannot connect to database"**
- Verify `DATABASE_URL` is correct in `.env`
- Ensure PostgreSQL is running
- Check network connectivity if using hosted DB

**"Anthropic API key invalid"**
- Verify your API key at [console.anthropic.com](https://console.anthropic.com)
- Ensure no extra spaces in `.env` file
- Check API key has sufficient credits

**"Tests failing"**
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear jest cache: `cd server && npx jest --clearCache`
- Clear vitest cache: `cd client && npx vitest --clearCache`

**"Frontend can't reach backend"**
- Verify backend is running on correct port
- Check CORS settings in `server/src/server.ts`
- Ensure `CLIENT_URL` matches frontend URL

**"Rate limit errors"**
- Wait a few minutes for rate limit to reset
- Adjust rate limits in `server/src/middleware/rateLimiter.ts`
- For development, you can temporarily disable rate limiting

## Performance Considerations

- **Virtual Lists**: Handles 10,000+ candidates without performance issues
- **Pagination**: Backend endpoints support pagination to reduce data transfer
- **Caching**: TanStack Query caches API responses to minimize requests
- **Optimistic Updates**: UI updates immediately for better UX
- **Connection Pooling**: Prisma connection pooling for database efficiency
- **Rate Limiting**: Prevents API abuse and protects AI endpoints

## Security Features

- **Helmet.js**: Security headers (XSS, clickjacking protection)
- **CORS**: Configured for specific origin
- **Rate Limiting**: General (100 req/15min) + AI endpoints (10 req/15min)
- **Input Validation**: Zod schemas validate all inputs
- **SQL Injection Protection**: Prisma parameterized queries
- **API Key Authentication**: Optional header-based auth
- **Error Handling**: No sensitive data leaked in errors

## Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Follow the code style**: 
   - ESLint + Prettier for formatting
   - Follow SOLID principles (see `.cursorrules`)
   - Add tests for new features
4. **Commit your changes**: `git commit -m 'Add amazing feature'`
5. **Push to the branch**: `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### Development Guidelines

- Write unit tests for new features
- Keep components under 250 lines (extract to smaller components)
- Use TypeScript strictly (no `any` types)
- Document complex logic with comments
- Follow the existing file structure

## License

MIT License - See [LICENSE](LICENSE) file for details

## Acknowledgments

- **Anthropic** for the Claude AI API
- **Prisma** for the excellent ORM
- **TanStack** for Query and Virtual libraries
- **Tailwind Labs** for TailwindCSS

---

Built with ❤️ using Claude Sonnet 4
