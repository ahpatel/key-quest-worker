import { getLessons, getLessonById, createLesson } from './db';
import { getPhrasesByLessonId, createPhrase } from './db';
import { generatePhrase, generateLessonContent } from './ai';
import { Env, ErrorResponse } from './types';

// Helper function to send JSON responses
function jsonResponse<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
    status,
  });
}

// Helper function to send error responses
function errorResponse(message: string, status = 400): Response {
  const error: ErrorResponse = {
    error: 'Bad Request',
    message,
  };
  return jsonResponse(error, status);
}

// Handle API routes
async function handleRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  // API Routes
  if (path.startsWith('/api/')) {
    // Lessons endpoints
    if (path === '/api/lessons' || path === '/api/lessons/') {
      if (method === 'GET') {
        // Get all lessons (optionally filtered by difficulty)
        const difficulty = url.searchParams.get('difficulty') || undefined;
        const lessons = await getLessons(env.DB, difficulty);
        return jsonResponse({ lessons });
      } else if (method === 'POST') {
        // Create a new lesson
        try {
          const data = await request.json() as {
            title: string;
            description?: string;
            content: string;
            difficulty?: 'beginner' | 'intermediate' | 'advanced';
          };
          
          if (!data.title || !data.content) {
            return errorResponse('Title and content are required', 400);
          }
          
          const result = await createLesson(env.DB, {
            title: data.title,
            description: data.description,
            content: data.content,
            difficulty: data.difficulty || 'beginner',
          });
          
          if (result.success && result.id) {
            return jsonResponse({ id: result.id }, 201);
          } else {
            return errorResponse(result.error || 'Failed to create lesson', 500);
          }
        } catch (error) {
          return errorResponse('Invalid request body', 400);
        }
      }
    }

    // Get a specific lesson by ID
    const lessonMatch = path.match(/^\/api\/lessons\/([^/]+)$/);
    if (lessonMatch && method === 'GET') {
      const lessonId = lessonMatch[1];
      const lesson = await getLessonById(env.DB, lessonId);
      
      if (!lesson) {
        return errorResponse('Lesson not found', 404);
      }
      
      return jsonResponse({ lesson });
    }

    // Phrases endpoints for a lesson
    const phrasesMatch = path.match(/^\/api\/lessons\/([^/]+)\/phrases$/);
    if (phrasesMatch) {
      const lessonId = phrasesMatch[1];
      
      if (method === 'GET') {
        // Get all phrases for a lesson
        const phrases = await getPhrasesByLessonId(env.DB, lessonId);
        return jsonResponse({ phrases });
      } else if (method === 'POST') {
        // Add a new phrase to a lesson
        try {
          const data = await request.json() as {
            text: string;
            difficulty?: 'beginner' | 'intermediate' | 'advanced';
          };
          
          if (!data.text) {
            return errorResponse('Text is required', 400);
          }
          
          const result = await createPhrase(env.DB, {
            lessonId,
            text: data.text,
            difficulty: data.difficulty || 'beginner',
          });
          
          if (result.success && result.id) {
            return jsonResponse({ id: result.id }, 201);
          } else {
            return errorResponse(result.error || 'Failed to create phrase', 500);
          }
        } catch (error) {
          return errorResponse('Invalid request body', 400);
        }
      }
    }

    // AI Generation endpoint
    if (path === '/api/generate/phrase' && method === 'POST') {
      try {
        const data = await request.json() as {
          prompt?: string;
          difficulty?: 'beginner' | 'intermediate' | 'advanced';
          maxLength?: number;
        };
        
        const result = await generatePhrase(env.AI, {
          prompt: data.prompt || 'typing exercise',
          difficulty: data.difficulty || 'beginner',
          maxLength: data.maxLength || 100,
        });
        
        if (result.error) {
          return errorResponse(result.error, 500);
        }
        
        return jsonResponse({ text: result.text });
      } catch (error) {
        return errorResponse('Invalid request', 400);
      }
    }

    // AI Generate lesson content
    if (path === '/api/generate/lesson' && method === 'POST') {
      try {
        const data = await request.json() as {
          topic?: string;
          difficulty?: 'beginner' | 'intermediate' | 'advanced';
        };
        
        if (!data.topic) {
          return errorResponse('Topic is required', 400);
        }
        
        const result = await generateLessonContent(
          env.AI,
          data.topic,
          data.difficulty || 'beginner'
        );
        
        if (result.error) {
          return errorResponse(result.error, 500);
        }
        
        return jsonResponse({
          title: result.title,
          content: result.content
        });
      } catch (error) {
        return errorResponse('Failed to generate lesson content', 500);
      }
    }
  }

  // Default 404 for unknown routes
  return errorResponse('Not Found', 404);
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    try {
      return await handleRequest(request, env);
    } catch (error) {
      console.error('Unhandled error:', error);
      return errorResponse(
        'Internal Server Error', 
        500
      );
    }
  },
};
