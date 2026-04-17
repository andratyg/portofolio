'use server';
/**
 * @fileOverview A GenAI tool to generate creative description suggestions for new portfolio items.
 *
 * - generatePortfolioDescriptionSuggestion - A function that handles the generation of description suggestions.
 * - GeneratePortfolioDescriptionSuggestionInput - The input type for the generatePortfolioDescriptionSuggestion function.
 * - GeneratePortfolioDescriptionSuggestionOutput - The return type for the generatePortfolioDescriptionSuggestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePortfolioDescriptionSuggestionInputSchema = z.object({
  title: z.string().describe('The title of the portfolio item.'),
  projectType: z
    .string()
    .describe('The type or category of the project (e.g., web, UI, backend).'),
  technologiesUsed: z
    .array(z.string())
    .describe('A list of technologies or skills used in the project.'),
  keyFeatures: z
    .string()
    .optional()
    .describe('A brief description of the key features or functionalities.'),
  targetAudience: z
    .string()
    .optional()
    .describe('The intended audience or users of the project.'),
  problemSolved: z
    .string()
    .optional()
    .describe('The problem or challenge that the project addresses.'),
});
export type GeneratePortfolioDescriptionSuggestionInput = z.infer<
  typeof GeneratePortfolioDescriptionSuggestionInputSchema
>;

const GeneratePortfolioDescriptionSuggestionOutputSchema = z.object({
  descriptionSuggestion: z
    .string()
    .describe(
      'A creative and engaging description suggestion for the portfolio item.'
    ),
});
export type GeneratePortfolioDescriptionSuggestionOutput = z.infer<
  typeof GeneratePortfolioDescriptionSuggestionOutputSchema
>;

export async function generatePortfolioDescriptionSuggestion(
  input: GeneratePortfolioDescriptionSuggestionInput
): Promise<GeneratePortfolioDescriptionSuggestionOutput> {
  return generatePortfolioDescriptionSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePortfolioDescriptionPrompt',
  input: {schema: GeneratePortfolioDescriptionSuggestionInputSchema},
  output: {schema: GeneratePortfolioDescriptionSuggestionOutputSchema},
  prompt: `You are an AI assistant specialized in generating creative, engaging, and professional descriptions for portfolio items.
Your goal is to help an administrator create compelling content for their portfolio.

Based on the following information, suggest a concise and impactful description for a new portfolio item. The description should highlight its unique aspects, value proposition, and appeal to potential clients or employers.

Project Title: {{{title}}}
Project Type: {{{projectType}}}
Technologies Used: {{#each technologiesUsed}}- {{{this}}}
{{/each}}
{{#if keyFeatures}}
Key Features: {{{keyFeatures}}}
{{/if}}
{{#if problemSolved}}
Problem Solved: {{{problemSolved}}}
{{/if}}
{{#if targetAudience}}
Target Audience: {{{targetAudience}}}
{{/if}}

Generate a description of approximately 2-3 paragraphs, focusing on clarity, creativity, and the impact of the project.
`,
});

const generatePortfolioDescriptionSuggestionFlow = ai.defineFlow(
  {
    name: 'generatePortfolioDescriptionSuggestionFlow',
    inputSchema: GeneratePortfolioDescriptionSuggestionInputSchema,
    outputSchema: GeneratePortfolioDescriptionSuggestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
