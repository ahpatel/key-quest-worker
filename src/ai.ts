import { GeneratePhraseRequest, AIResponse } from './types';

export async function generatePhrase(
  ai: { run: (model: string, options: { prompt: string; max_tokens?: number }) => Promise<AIResponse> },
  request: GeneratePhraseRequest
): Promise<{ text: string; error?: string }> {
  try {
    // Define the prompt for the AI
    const prompt = `Generate a short, engaging typing exercise phrase for ${request.difficulty} level. "${request.prompt}"`;
    
    // Call the AI model - using llama-2-7b-chat-int8 which is widely available
    const response = await ai.run(
      '@cf/meta/llama-2-7b-chat-int8',
      {
        prompt,
        max_tokens: request.maxLength || 100,
      }
    );
    
    // Extract the generated text
    const generatedText = response.response || response.choices?.[0]?.text || '';
    
    if (!generatedText.trim()) {
      throw new Error('No text was generated');
    }
    
    return { text: generatedText.trim() };
  } catch (error) {
    console.error('Error generating phrase with AI:', error);
    return { 
      text: '', 
      error: error instanceof Error ? error.message : 'Failed to generate phrase' 
    };
  }
}

// Helper function to generate a lesson based on a topic
export async function generateLessonContent(
  ai: { run: (model: string, options: { prompt: string; max_tokens?: number }) => Promise<AIResponse> },
  topic: string,
  difficulty: 'beginner' | 'intermediate' | 'advanced' = 'beginner'
): Promise<{ title: string; content: string; error?: string }> {
  try {
    const prompt = `Create a short typing lesson about "${topic}" for ${difficulty} level. ` +
      `Include a brief explanation and a few example sentences.`;
    
    const response = await ai.run(
      '@cf/meta/llama-2-7b-chat-int8',
      {
        prompt,
        max_tokens: 500,
      }
    );
    
    const content = response.response || response.choices?.[0]?.text || '';
    
    if (!content.trim()) {
      throw new Error('No content was generated');
    }
    
    // Extract the title from the first line
    const lines = content.split('\n');
    const title = lines[0].replace(/^#+\s*/, '').trim() || `Lesson: ${topic}`;
    
    return { 
      title,
      content: content.trim()
    };
  } catch (error) {
    console.error('Error generating lesson content with AI:', error);
    return { 
      title: `Lesson: ${topic}`,
      content: `This is a ${difficulty} level lesson about ${topic}.`,
      error: error instanceof Error ? error.message : 'Failed to generate lesson content'
    };
  }
}
