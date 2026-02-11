# Backend Code Guide

A practical guide to understanding the Express.js backend architecture and code organization.

## 🏗️ Architecture Overview

```
HTTP Request → Middleware Stack → Controller → Service → DAL → Database
                    ↓                                              ↓
              Error Handler ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ←
```

**Layered Architecture:**
1. **Middleware**: Authentication, validation, rate limiting, logging
2. **Controllers**: HTTP request/response handling
3. **Services**: Business logic (AI integration, data processing)
4. **DAL (Data Access Layer)**: Database operations
5. **Error Handling**: Centralized error management

**Key Principle:** Each layer has a single, clear responsibility (SOLID principles).

## 📁 Folder Structure

```
server/src/
├── middleware/             # Request processing pipeline
│   ├── auth.ts            # API key authentication
│   ├── validation.ts      # Zod schema validation
│   ├── rateLimiter.ts     # Rate limiting (general + AI)
│   └── errorHandler.ts    # Global error handling
│
├── controllers/           # HTTP request handlers
│   ├── candidateController.ts  # Candidate endpoints
│   └── rankingController.ts    # Ranking endpoints
│
├── services/              # Business logic
│   ├── claudeService.ts   # AI integration (generation, ranking)
│   └── prismaService.ts   # Prisma client singleton
│
├── dal/                   # Data Access Layer
│   ├── candidateRepository.ts  # Candidate CRUD
│   └── rankingRepository.ts    # Ranking CRUD
│
├── routes/                # Route definitions
│   ├── candidates.ts      # Candidate routes
│   └── rankings.ts        # Ranking routes
│
├── utils/                 # Utilities
│   ├── AppError.ts        # Custom error classes
│   └── logger.ts          # Winston logger
│
└── types/                 # TypeScript definitions
    └── index.ts           # Zod schemas & types
```

## 🎯 Key Concepts

### 1. Request Flow

**Complete Request Journey:**

```
1. HTTP Request arrives
    ↓
2. Middleware Stack (runs in order):
    • Helmet (security headers)
    • Morgan (HTTP logging)
    • CORS (cross-origin)
    • Rate Limiter (prevent abuse)
    • Body Parser (parse JSON)
    • Auth (API key check - optional)
    • Validation (Zod schema)
    ↓
3. Controller:
    • Extract data from req
    • Call service/DAL
    • Return response
    ↓
4. Response sent to client

If error at any step → Error Handler
```

**Example Request:**
```typescript
POST /api/candidates/generate
Body: { count: 5 }

→ rateLimiter (AI endpoint - 10 req/15min)
→ validateBody(GenerateCandidatesSchema)
→ generateCandidatesWithCVs controller
→ claudeService.generateCandidateProfiles()
→ candidateRepository.create() for each
→ Response: { generated: 5, candidates: [...] }
```

### 2. Middleware Stack

Middleware processes requests before they reach controllers:

**Authentication** (`middleware/auth.ts`)
```typescript
export const authenticate = (req, res, next) => {
  const serverApiKey = process.env.API_KEY;
  
  // Skip auth if no API_KEY configured (dev mode)
  if (!serverApiKey) return next();
  
  const clientApiKey = req.headers['x-api-key'];
  
  if (!clientApiKey || clientApiKey !== serverApiKey) {
    logger.warn('Authentication failed');
    return next(new AppError('Invalid or missing API key', 401));
  }
  
  next();
};
```

**Validation** (`middleware/validation.ts`)
```typescript
export const validateBody = (schema: ZodSchema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    
    if (!result.success) {
      // Format Zod errors into readable messages
      const errors = result.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      
      return res.status(400).json({
        error: { message: 'Validation failed', details: errors }
      });
    }
    
    req.body = result.data; // Use validated & transformed data
    next();
  };
};
```

**Rate Limiting** (`middleware/rateLimiter.ts`)
```typescript
// General rate limit: 100 requests per 15 minutes
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later',
});

// AI endpoints: 10 requests per 15 minutes (expensive operations)
export const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many AI requests, please slow down',
});
```

### 3. Layered Architecture

**Controller Layer** (HTTP handling only)

```typescript
// controllers/candidateController.ts
export const getAllCandidates = async (req, res, next) => {
  try {
    // 1. Parse and validate query params
    const { page, limit } = PaginationSchema.parse(req.query);
    
    // 2. Call DAL (no business logic here)
    const result = await candidateRepository.findAll({ page, limit });
    
    // 3. Return response
    res.status(200).json(result);
  } catch (error) {
    // 4. Pass errors to error handler
    next(error);
  }
};
```

**Service Layer** (Business logic)

```typescript
// services/claudeService.ts
export const generateCandidateProfiles = async (count: number) => {
  // Complex AI logic here
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [{
      role: 'user',
      content: `Generate ${count} realistic candidate profiles...`,
    }],
  });
  
  // Parse and validate AI response
  const profiles = JSON.parse(response.content[0].text);
  return profiles;
};
```

**DAL Layer** (Database access)

```typescript
// dal/candidateRepository.ts
export const candidateRepository = {
  async findAll(pagination: PaginationParams) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;
    
    // Pure Prisma queries - no business logic
    const [candidates, total] = await Promise.all([
      prisma.candidate.findMany({
        include: {
          skills: { include: { skill: true } },
          cvs: { orderBy: { createdAt: 'desc' }, take: 1 },
          rankings: { orderBy: { rankedAt: 'desc' }, take: 1 },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.candidate.count(),
    ]);
    
    return {
      data: candidates,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },
  
  async delete(candidateId: string) {
    // Cascade delete handled by Prisma schema
    return prisma.candidate.delete({
      where: { id: candidateId },
    });
  },
};
```

### 4. Error Handling Strategy

**Custom Error Classes** (`utils/AppError.ts`)

```typescript
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
  }
}

// Specific error types
export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed') {
    super(message, 400);
  }
}
```

**Global Error Handler** (`middleware/errorHandler.ts`)

```typescript
export const errorHandler = (err, req, res, next) => {
  logger.error(err.message, { stack: err.stack });
  
  // 1. Handle custom AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: { message: err.message }
    });
  }
  
  // 2. Handle Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        message: 'Validation failed',
        details: err.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      },
    });
  }
  
  // 3. Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2025') { // Record not found
      return res.status(404).json({
        error: { message: 'Record not found' }
      });
    }
    if (err.code === 'P2002') { // Unique constraint
      return res.status(409).json({
        error: { message: 'A record with this value already exists' }
      });
    }
  }
  
  // 4. Generic server error (hide details in production)
  res.status(500).json({
    error: {
      message: process.env.NODE_ENV === 'production'
        ? 'Internal Server Error'
        : err.message,
    },
  });
};
```

### 5. Database Access with Prisma

**Schema** (`prisma/schema.prisma`)

```prisma
model Candidate {
  id          String   @id @default(cuid())
  firstName   String
  lastName    String
  email       String   @unique
  phone       String?
  yearsOfExp  Int
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations with cascade delete
  skills      CandidateSkill[]
  cvs         CV[]
  rankings    Ranking[]        @relation(onDelete: Cascade)
}

model Ranking {
  id              String   @id @default(cuid())
  candidateId     String
  score           Int      // 0-100
  reasoning       String   @db.Text
  criteria        String
  shouldInterview Boolean
  priority        Int      // 1-based ranking position
  rankedAt        DateTime @default(now())

  candidate       Candidate @relation(fields: [candidateId], references: [id], onDelete: Cascade)
}
```

**Repository Pattern:**

```typescript
// Encapsulates all database operations for a resource
export const candidateRepository = {
  findByEmail: (email) => { /* ... */ },
  findAll: (pagination) => { /* ... */ },
  create: (data) => { /* ... */ },
  delete: (id) => { /* ... */ },
  createCV: (data) => { /* ... */ },
  findAllWithSkills: () => { /* ... */ },
};

// Benefits:
// - Single source of truth for queries
// - Easy to test (mock the repository)
// - Can swap ORM without changing controllers
```

### 6. Type Safety with Zod

**Schema Definition** (`types/index.ts`)

```typescript
// Define schema once
export const GenerateCandidatesSchema = z.object({
  count: z
    .number()
    .int()
    .min(1, 'Must generate at least 1 candidate')
    .max(10, 'Maximum 10 candidates at once'),
});

// Infer TypeScript type from schema
export type GenerateCandidatesInput = z.infer<typeof GenerateCandidatesSchema>;

// Pagination with defaults
export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(100),
});
```

**Usage in Routes:**

```typescript
// routes/candidates.ts
router.post(
  '/generate',
  aiLimiter,                                  // Rate limit
  validateBody(GenerateCandidatesSchema),     // Validate
  generateCandidatesWithCVs                   // Handle
);

// In controller, req.body is now type-safe!
const { count }: GenerateCandidatesInput = req.body;
```

## 🔧 Route Configuration

**Example: Candidate Routes** (`routes/candidates.ts`)

```typescript
import express from 'express';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { aiLimiter } from '../middleware/rateLimiter';
import { GenerateCandidatesSchema } from '../types';
import {
  generateCandidatesWithCVs,
  getAllCandidates,
  deleteCandidate,
} from '../controllers/candidateController';

const router = express.Router();

// POST /api/candidates/generate
router.post(
  '/generate',
  authenticate,                              // Check API key (if configured)
  aiLimiter,                                 // 10 requests per 15 min
  validateBody(GenerateCandidatesSchema),    // Validate body
  generateCandidatesWithCVs                  // Handle request
);

// GET /api/candidates
router.get('/', getAllCandidates);

// DELETE /api/candidates/:id
router.delete('/:id', authenticate, deleteCandidate);

export default router;
```

## 💾 AI Integration

**Claude AI Service** (`services/claudeService.ts`)

```typescript
export const generateCandidateProfiles = async (count: number) => {
  logger.info(`Generating ${count} candidate profiles...`);
  
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: 'You are a recruitment system that generates realistic candidates.',
    messages: [{
      role: 'user',
      content: `Generate ${count} diverse, realistic candidate profiles...`,
    }],
  });
  
  const profiles = JSON.parse(response.content[0].text);
  return profiles;
};

export const rankCandidates = async (candidates, criteria: string) => {
  // Build AI prompt with candidate data
  const candidateList = candidates.map(c => ({
    id: c.id,
    name: c.name,
    experience: c.experience,
    skills: c.skills,
  }));
  
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    messages: [{
      role: 'user',
      content: `Rank these candidates for: ${criteria}\n\nCandidates:\n${JSON.stringify(candidateList)}`,
    }],
  });
  
  // AI returns array of rankings with scores and reasoning
  return JSON.parse(response.content[0].text);
};
```

## 📝 Logging Strategy

**Winston Logger** (`utils/logger.ts`)

```typescript
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

// Usage
logger.info('Candidate created', { candidateId: '123' });
logger.error('AI request failed', { error: err.message });
logger.warn('Rate limit exceeded', { ip: req.ip });
```

**HTTP Request Logging** (Morgan middleware)

```typescript
// server.ts
app.use(morgan('combined', {
  stream: { write: (message) => logger.info(message.trim()) }
}));

// Logs: "GET /api/candidates 200 123ms"
```

## 🛡️ Security Features

**Implemented Security:**

1. **Helmet.js** - Security headers (XSS, clickjacking protection)
2. **CORS** - Configured for specific origin
3. **Rate Limiting** - Prevent abuse
4. **Input Validation** - Zod schemas
5. **SQL Injection Protection** - Prisma parameterized queries
6. **API Key Auth** - Optional header-based authentication
7. **Request Size Limits** - Prevent large payloads
8. **Error Sanitization** - No sensitive data in production errors

**Security Middleware Setup:**

```typescript
// server.ts
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json({ limit: '10mb' }));
app.use(generalLimiter);
```

## 🎭 Common Patterns

### 1. Controller Pattern

```typescript
export const controllerName = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Extract & validate input
    const input = SomeSchema.parse(req.body);
    
    // 2. Call service/DAL
    const result = await repository.someMethod(input);
    
    // 3. Return response
    res.status(200).json(result);
  } catch (error) {
    // 4. Pass to error handler
    next(error);
  }
};
```

### 2. Repository Pattern

```typescript
export const resourceRepository = {
  async findAll(params) {
    return prisma.resource.findMany({ ...params });
  },
  
  async create(data) {
    return prisma.resource.create({ data });
  },
  
  async delete(id) {
    return prisma.resource.delete({ where: { id } });
  },
};
```

### 3. Error Throwing

```typescript
// In service/controller
if (!candidate) {
  throw new NotFoundError('Candidate');
}

// In business logic
if (count > 10) {
  throw new ValidationError('Maximum 10 candidates allowed');
}

// Error handler catches and formats appropriately
```

## 🐛 Debugging Tips

1. **Check Logs**: Winston logs all errors with stack traces
2. **Prisma Studio**: `npm run prisma:studio` to view database
3. **API Testing**: Use Postman or Thunder Client
4. **Database Issues**: Check `DATABASE_URL` and migrations
5. **Rate Limit**: Wait 15 minutes or adjust limits in development

**Common Issues:**

```typescript
// Problem: Validation failing
// Solution: Check Zod schema matches input
console.log(req.body); // See what's actually sent

// Problem: Prisma error P2025
// Solution: Record doesn't exist, check ID

// Problem: 401 Unauthorized
// Solution: Check x-api-key header or disable API_KEY in .env
```

## 📊 Database Patterns

### Cascade Deletes

```prisma
model Ranking {
  candidateId String
  candidate   Candidate @relation(fields: [candidateId], references: [id], onDelete: Cascade)
}

// When you delete a candidate, all rankings automatically deleted
```

### Pagination

```typescript
const skip = (page - 1) * limit;

const results = await prisma.model.findMany({
  skip,
  take: limit,
  orderBy: { createdAt: 'desc' },
});
```

### Relations with Includes

```typescript
// Efficient: Single query with includes
const candidate = await prisma.candidate.findUnique({
  where: { id },
  include: {
    skills: { include: { skill: true } },
    cvs: true,
    rankings: { orderBy: { rankedAt: 'desc' }, take: 1 },
  },
});
```

## 🎓 Key Takeaways

1. **Clear Separation**: Each layer has one responsibility
2. **Type Safety**: Zod schemas → TypeScript types → runtime validation
3. **Error Handling**: Centralized, consistent, user-friendly
4. **Security First**: Multiple layers of protection
5. **Logging**: Track everything for debugging
6. **Performance**: Efficient queries, pagination, caching
7. **Maintainability**: Repository pattern, DRY, SOLID principles

## 📚 Learning Path

To understand the codebase:

1. **Start with `server.ts`** - See middleware setup and app initialization
2. **Follow a route** - Pick `/api/candidates/generate` and trace it through:
   - `routes/candidates.ts` → middleware chain
   - `controllers/candidateController.ts` → request handling
   - `services/claudeService.ts` → business logic
   - `dal/candidateRepository.ts` → database operations
3. **Check error flow** - Throw an error and see how `errorHandler.ts` catches it
4. **Review Prisma schema** - Understand data model and relations
5. **Test an endpoint** - Use Postman to see request/response

**Pro tip:** Add console.logs or use debugger to trace execution flow. Start from the route and follow the data transformation through each layer.
