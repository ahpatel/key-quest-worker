# Key Quest Kids Worker

This is the Cloudflare Worker backend for the Key Quest Kids application. It provides a RESTful API for managing lessons and phrases, with AI-powered content generation.

## Features

- **Lessons Management**: Create and retrieve typing lessons
- **Phrases Management**: Add and retrieve phrases for each lesson
- **AI-Powered Generation**: Generate lesson content and phrases using Workers AI
- **D1 Database**: Persistent storage using Cloudflare D1

## API Endpoints

### Lessons

- `GET /api/lessons` - Get all lessons (optionally filtered by difficulty)
  - Query params: `?difficulty=beginner|intermediate|advanced`
- `GET /api/lessons/:id` - Get a specific lesson by ID
- `POST /api/lessons` - Create a new lesson
  - Body: `{ "title": string, "description?": string, "content": string, "difficulty?": "beginner"|"intermediate"|"advanced" }`

### Phrases

- `GET /api/lessons/:id/phrases` - Get all phrases for a lesson
- `POST /api/lessons/:id/phrases` - Add a new phrase to a lesson
  - Body: `{ "text": string, "difficulty?": "beginner"|"intermediate"|"advanced" }`

### AI Generation

- `POST /api/generate/phrase` - Generate a phrase using AI
  - Body: `{ "prompt?": string, "difficulty?": "beginner"|"intermediate"|"advanced", "maxLength?": number }`
- `POST /api/generate/lesson` - Generate lesson content using AI
  - Body: `{ "topic": string, "difficulty?": "beginner"|"intermediate"|"advanced" }`

## Development

### Prerequisites

- Node.js 16+
- npm or pnpm
- Cloudflare Wrangler CLI (`npm install -g wrangler`)

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Log in to Cloudflare:
   ```bash
   wrangler login
   ```

3. Create a new D1 database:
   ```bash
   wrangler d1 create key-quest-kids-db
   ```
   
   Update the `wrangler.jsonc` file with the database ID.

4. Run database migrations:
   ```bash
   wrangler d1 migrations apply key-quest-kids-db --local
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment

1. Apply migrations to production:
   ```bash
   wrangler d1 migrations apply key-quest-kids-db
   ```

2. Deploy the worker:
   ```bash
   npm run deploy
   ```

## Environment Variables

- `DB` - D1 database binding (automatically configured in `wrangler.jsonc`)
- `AI` - Workers AI binding (automatically configured in `wrangler.jsonc`)
