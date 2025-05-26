interface AIOptions {
  prompt: string;
  max_tokens?: number;
}

export interface AIResponse {
  response?: string;
  choices?: Array<{ text: string }>;
  error?: string;
}

export interface Env {
  DB: D1Database;
  AI: {
    run: (model: string, options: AIOptions) => Promise<AIResponse>;
  };
}

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  content: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  createdAt: number;
  updatedAt: number;
}

export interface Phrase {
  id: string;
  lessonId: string;
  text: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  createdAt: number;
}

export interface GeneratePhraseRequest {
  prompt: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  maxLength?: number;
}

export interface ErrorResponse {
  error: string;
  message: string;
}
