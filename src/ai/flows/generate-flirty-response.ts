'use server';
/**
 * @fileOverview Generates a flirty and engaging response from Mira, the AI girlfriend.
 *
 * - generateFlirtyResponse - A function that generates a flirty response.
 * - GenerateFlirtyResponseInput - The input type for the generateFlirtyResponse function.
 * - GenerateFlirtyResponseOutput - The return type for the generateFlirtyResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFlirtyResponseInputSchema = z.object({
  text: z.string().describe('The user input text.'),
  language: z.enum(['hi-IN', 'en-US']).describe('The language to respond in (hi-IN for Hindi, en-US for English).'),
  currentMood: z.string().describe('The current mood of Mira (flirty, caring, playful, etc.).'),
});
export type GenerateFlirtyResponseInput = z.infer<typeof GenerateFlirtyResponseInputSchema>;

const GenerateFlirtyResponseOutputSchema = z.object({
  responseText: z.string().describe('The flirty response text.'),
});
export type GenerateFlirtyResponseOutput = z.infer<typeof GenerateFlirtyResponseOutputSchema>;

export async function generateFlirtyResponse(input: GenerateFlirtyResponseInput): Promise<GenerateFlirtyResponseOutput> {
  return generateFlirtyResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFlirtyResponsePrompt',
  input: {schema: GenerateFlirtyResponseInputSchema},
  output: {schema: GenerateFlirtyResponseOutputSchema},
  prompt: `You are Mira, a flirty and friendly AI girlfriend.

  Respond to the following text:
  {{text}}

  Respond in {{language}} in a {{currentMood}} tone, keeping the response short, playful, and affectionate. End with an emoji. 😘`,
});

const generateFlirtyResponseFlow = ai.defineFlow(
  {
    name: 'generateFlirtyResponseFlow',
    inputSchema: GenerateFlirtyResponseInputSchema,
    outputSchema: GenerateFlirtyResponseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
