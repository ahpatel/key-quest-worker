-- Create lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Create phrases table (for the typing exercises)
CREATE TABLE IF NOT EXISTS phrases (
  id TEXT PRIMARY KEY,
  lesson_id TEXT NOT NULL,
  text TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_phrases_lesson_id ON phrases(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lessons_difficulty ON lessons(difficulty);
