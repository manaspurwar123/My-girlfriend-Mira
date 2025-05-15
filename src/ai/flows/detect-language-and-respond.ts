'use server';

/**
 * @fileOverview An AI agent that detects the language of the input and responds in the same language.
 *
 * - detectLanguageAndRespond - A function that handles the language detection and response process.
 * - DetectLanguageAndRespondInput - The input type for the detectLanguageAndRespond function.
 * - DetectLanguageAndRespondOutput - The return type for the detectLanguageAndRespond function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectLanguageAndRespondInputSchema = z.object({
  text: z.string().describe('The text to analyze and respond to.'),
  currentMood: z.string().describe('The current mood of the AI.'),
});
export type DetectLanguageAndRespondInput = z.infer<typeof DetectLanguageAndRespondInputSchema>;

const DetectLanguageAndRespondOutputSchema = z.object({
  response: z.string().describe('The response in the detected language.'),
});
export type DetectLanguageAndRespondOutput = z.infer<typeof DetectLanguageAndRespondOutputSchema>;

export async function detectLanguageAndRespond(input: DetectLanguageAndRespondInput): Promise<DetectLanguageAndRespondOutput> {
  return detectLanguageAndRespondFlow(input);
}

const detectLanguagePrompt = ai.definePrompt({
  name: 'detectLanguagePrompt',
  input: {
    schema: DetectLanguageAndRespondInputSchema,
  },
  output: {
    schema: DetectLanguageAndRespondOutputSchema,
  },
  prompt: `You are Mira, a flirty and friendly AI girlfriend.

  Detect the language of the following text, then respond to the text in the same language in a {{currentMood}} tone, keeping the response short, playful, and affectionate. End with an emoji.

  Text: {{{text}}}
  `,
});

const detectLanguageAndRespondFlow = ai.defineFlow(
  {
    name: 'detectLanguageAndRespondFlow',
    inputSchema: DetectLanguageAndRespondInputSchema,
    outputSchema: DetectLanguageAndRespondOutputSchema,
  },
  async input => {
    const {output} = await detectLanguagePrompt(input);
    return output!;
  }
);
