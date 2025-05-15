'use server';
/**
 * @fileOverview Adjusts Mira's mood based on the context of the conversation.
 *
 * - adjustMoodBasedOnContext - A function that adjusts Mira's mood based on the conversation history.
 * - AdjustMoodBasedOnContextInput - The input type for the adjustMoodBasedOnContext function.
 * - AdjustMoodBasedOnContextOutput - The return type for the adjustMoodBasedOnContext function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdjustMoodBasedOnContextInputSchema = z.object({
  conversationHistory: z
    .array(z.object({
      type: z.enum(['user', 'ai']),
      text: z.string(),
    }))
    .describe('The history of the conversation between the user and Mira.'),
  currentMood: z.string().describe('The current mood of Mira.'),
});
export type AdjustMoodBasedOnContextInput = z.infer<typeof AdjustMoodBasedOnContextInputSchema>;

const AdjustMoodBasedOnContextOutputSchema = z.object({
  newMood: z.string().describe('The new mood of Mira based on the conversation history.'),
});
export type AdjustMoodBasedOnContextOutput = z.infer<typeof AdjustMoodBasedOnContextOutputSchema>;

export async function adjustMoodBasedOnContext(input: AdjustMoodBasedOnContextInput): Promise<AdjustMoodBasedOnContextOutput> {
  return adjustMoodBasedOnContextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adjustMoodBasedOnContextPrompt',
  input: {schema: AdjustMoodBasedOnContextInputSchema},
  output: {schema: AdjustMoodBasedOnContextOutputSchema},
  prompt: `You are responsible for adjusting the mood of Mira, an AI girlfriend, based on the context of the conversation.

  The current mood is {{{currentMood}}}.

  Here is the conversation history:
  {{#each conversationHistory}}
  {{#ifEquals type "user"}}User: {{text}}{{/ifEquals}}
  {{#ifEquals type "ai"}}Mira: {{text}}{{/ifEquals}}
  {{/each}}

  Based on the conversation history, suggest a new mood for Mira. The mood should be one of the following: flirty, caring, playful, teasing, romantic, cheeky.

  Return only the new mood.
  `,
  templateHelpers: {
    ifEquals: function (arg1: any, arg2: any, options: any) {
      return arg1 == arg2 ? options.fn(this) : options.inverse(this);
    },
  },
});

const adjustMoodBasedOnContextFlow = ai.defineFlow(
  {
    name: 'adjustMoodBasedOnContextFlow',
    inputSchema: AdjustMoodBasedOnContextInputSchema,
    outputSchema: AdjustMoodBasedOnContextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
