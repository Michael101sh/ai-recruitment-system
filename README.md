# AI Recruitment System 🤖

> AI-powered candidate CV generation and ranking system built with Claude API

## Features
- 🎯 Generate professional CVs using Claude AI
- 📊 Smart candidate ranking and scoring
- 🗂️ Interview prioritization
- 💾 PostgreSQL database with Prisma ORM

## Tech Stack
- **Backend**: Node.js, Express, TypeScript, Prisma, PostgreSQL
- **Frontend**: React, Vite, TypeScript, TailwindCSS
- **AI**: Anthropic Claude API (Sonnet 4)

## Prerequisites

- Node.js 18+
- PostgreSQL database (local or hosted, e.g. Supabase)
- Anthropic API key ([console.anthropic.com](https://console.anthropic.com))

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

```
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://user:password@localhost:5432/ai_recruitment?schema=public"
ANTHROPIC_API_KEY=sk-ant-...
CLIENT_URL=http://localhost:5173
```

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

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start server and client concurrently |
| `npm run dev:server` | Start server only |
| `npm run dev:client` | Start client only |
| `npm run build` | Build both server and client |
| `npm run install:all` | Install dependencies for both |
| `npm run prisma:generate` | Regenerate Prisma client |
| `npm run prisma:migrate` | Run database migrations |
