/// <reference types="vite/client" />
import { GoogleGenAI } from '@google/genai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || '';

export const aiClient = apiKey ? new GoogleGenAI({ apiKey }) : null;

/**
 * Generate AI Vibe Playlist recommendations based on user prompt or mood
 */
export async function generateAIVibePlaylist(moodPrompt: string): Promise<{ title: string; description: string; songQueries: string[] }> {
  try {
    if (!aiClient) throw new Error('API key not configured');
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Create a music vibe playlist for someone feeling: "${moodPrompt}". 
Return a JSON object with:
- "title": A cool 3-4 word aesthetic playlist title with emojis
- "description": A 1-sentence vibe summary
- "songQueries": Array of 5 popular song titles + artists matching this exact vibe.
Return strictly valid JSON.`,
      config: {
        responseMimeType: 'application/json'
      }
    });

    if (response.text) {
      const parsed = JSON.parse(response.text);
      return {
        title: parsed.title || `Vibe Mix: ${moodPrompt}`,
        description: parsed.description || `Curated music for ${moodPrompt}`,
        songQueries: parsed.songQueries || ['Blinding Lights', 'Cruel Summer', 'Levitating', 'Die With A Smile', 'Starboy']
      };
    }
  } catch (err) {
    console.warn('Gemini AI fallback:', err);
  }

  return {
    title: `⚡ AI Vibe Mix: ${moodPrompt}`,
    description: `Curated high-frequency soundtrack tuned for ${moodPrompt}`,
    songQueries: ['Blinding Lights The Weeknd', 'Cruel Summer Taylor Swift', 'Levitating Dua Lipa', 'Die With A Smile Bruno Mars', 'Starboy']
  };
}
