
'use server';
/**
 * @fileOverview A GenAI tool to translate portfolio content between Indonesian and English.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateContentInputSchema = z.object({
  text: z.string().min(1, 'Text cannot be empty').max(15000, 'Text exceeds 15,000 characters limit.').describe('The text to translate.'),
  targetLang: z.enum(['id', 'en']).describe('The target language (id for Indonesian, en for English).'),
});
export type TranslateContentInput = z.infer<typeof TranslateContentInputSchema>;

const TranslateContentOutputSchema = z.object({
  translatedText: z.string().describe('The translated version of the input text.'),
});
export type TranslateContentOutput = z.infer<typeof TranslateContentOutputSchema>;

export async function translateContent(input: TranslateContentInput): Promise<TranslateContentOutput> {
  const parsed = TranslateContentInputSchema.safeParse(input);
  if (!parsed.success) {
    console.warn('[translateContent] Invalid input received:', parsed.error.issues);
    return { translatedText: typeof input?.text === 'string' ? input.text : '' };
  }

  const hasKey = !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY);
  if (!hasKey) {
    return { translatedText: input.text };
  }
  return translateContentFlow(parsed.data);
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
    try {
      const {output} = await prompt(input);
      if (output) {
        return output;
      }
    } catch (err) {
      console.warn('[Translation Flow] Error translating content:', err);
    }
    return {translatedText: input.text};
  }
);
