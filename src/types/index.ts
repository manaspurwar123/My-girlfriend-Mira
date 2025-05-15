export interface Message {
  id: string;
  type: 'user' | 'ai';
  text?: string;
  image?: string; // URL or base64 string for images
  timestamp: number;
  language?: 'hi-IN' | 'en-US'; // Language of this specific message
}

export type Language = 'hi-IN' | 'en-US';

export type Mood = "flirty" | "caring" | "playful" | "teasing" | "romantic" | "cheeky";

export const moodOptions: Mood[] = ["flirty", "caring", "playful", "teasing", "romantic", "cheeky"];
