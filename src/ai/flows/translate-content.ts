
'use server';
/**
 * @fileOverview A GenAI tool to translate portfolio content between Indonesian and English.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateContentInputSchema = z.object({
  text: z.string().describe('The text to translate.'),
  targetLang: z.enum(['id', 'en']).describe('The target language (id for Indonesian, en for English).'),
});
export type TranslateContentInput = z.infer<typeof TranslateContentInputSchema>;

const TranslateContentOutputSchema = z.object({
  translatedText: z.string().describe('The translated version of the input text.'),
});
export type TranslateContentOutput = z.infer<typeof TranslateContentOutputSchema>;

export async function translateContent(input: TranslateContentInput): Promise<TranslateContentOutput> {
  return translateContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translateContentPrompt',
  input: {schema: TranslateContentInputSchema},
  output: {schema: TranslateContentOutputSchema},
  prompt: `You are a professional translator fluent in Indonesian and English.
Translate the following text into {{targetLang}} (id = Indonesian, en = English).

Context: This is for a professional portfolio of a Software Developer.
Ensure the tone remains professional, confident, and natural for a technical audience.

Text to translate:
{{{text}}}`,
});

const translateContentFlow = ai.defineFlow(
  {
    name: 'translateContentFlow',
    inputSchema: TranslateContentInputSchema,
    outputSchema: TranslateContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
