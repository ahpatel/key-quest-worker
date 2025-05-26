import { Lesson, Phrase } from './types';

interface D1Result<T> {
  results?: T[];
  success: boolean;
  error?: string;
  meta: Record<string, unknown>;
}

export async function getLessons(db: D1Database, difficulty?: string): Promise<Lesson[]> {
  let query = 'SELECT * FROM lessons';
  const params: string[] = [];
  
  if (difficulty) {
    query += ' WHERE difficulty = ?';
    params.push(difficulty);
  }
  
  query += ' ORDER BY created_at DESC';
  
  const result = await db.prepare(query).bind(...params).all<Lesson>();
  return (result as D1Result<Lesson>).results || [];
}

export async function getLessonById(db: D1Database, id: string): Promise<Lesson | null> {
  const stmt = db.prepare('SELECT * FROM lessons WHERE id = ?').bind(id);
  const lesson = await stmt.first();
  return lesson as unknown as Lesson | null;
}

export async function createLesson(
  db: D1Database, 
  lesson: Omit<Lesson, 'id' | 'createdAt' | 'updatedAt'>
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const id = crypto.randomUUID();
    const now = Date.now();
    
    await db.prepare(
      'INSERT INTO lessons (id, title, description, content, difficulty, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(
      id,
      lesson.title,
      lesson.description || null,
      lesson.content,
      lesson.difficulty,
      now,
      now
    ).run();
    
    return { success: true, id };
  } catch (error) {
    console.error('Error creating lesson:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

export async function getPhrasesByLessonId(db: D1Database, lessonId: string): Promise<Phrase[]> {
  const { results } = await db.prepare(
    'SELECT * FROM phrases WHERE lesson_id = ? ORDER BY created_at DESC'
  ).bind(lessonId).all();
  
  return results as unknown as Phrase[];
}

export async function createPhrase(
  db: D1Database, 
  phrase: Omit<Phrase, 'id' | 'createdAt'>
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const id = crypto.randomUUID();
    const now = Date.now();
    
    await db.prepare(
      'INSERT INTO phrases (id, lesson_id, text, difficulty, created_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(
      id,
      phrase.lessonId,
      phrase.text,
      phrase.difficulty,
      now
    ).run();
    
    return { success: true, id };
  } catch (error) {
    console.error('Error creating phrase:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
