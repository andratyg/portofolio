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
  existingProjectsContext: z
    .string()
    .optional()
    .describe('Summary of existing projects in portfolio to ensure consistency in tone, narrative structure, and claimed technical mastery.'),
  developerProfileContext: z
    .string()
    .optional()
    .describe('Summary of developer profile, background, and claimed expertise.'),
});
export type GeneratePortfolioDescriptionSuggestionInput = z.infer<
  typeof GeneratePortfolioDescriptionSuggestionInputSchema
>;

const GeneratePortfolioDescriptionSuggestionOutputSchema = z.object({
  descriptionSuggestion: z
    .string()
    .describe(
      'A creative, engaging, and contextually consistent description suggestion for the portfolio item.'
    ),
});
export type GeneratePortfolioDescriptionSuggestionOutput = z.infer<
  typeof GeneratePortfolioDescriptionSuggestionOutputSchema
>;

export async function generatePortfolioDescriptionSuggestion(
  input: GeneratePortfolioDescriptionSuggestionInput
): Promise<GeneratePortfolioDescriptionSuggestionOutput> {
  const hasKey = !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY);
  if (!hasKey) {
    return {
      descriptionSuggestion: `${input.title} adalah proyek ${input.projectType} yang dikembangkan menggunakan ${input.technologiesUsed.join(', ')}.`
    };
  }
  return generatePortfolioDescriptionSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePortfolioDescriptionPrompt',
  input: {schema: GeneratePortfolioDescriptionSuggestionInputSchema},
  output: {schema: GeneratePortfolioDescriptionSuggestionOutputSchema},
  prompt: `You are an elite technical portfolio consultant and senior software engineering mentor.
Your task is to craft an engaging, high-impact, and professional description for a project in a developer's portfolio.

{{#if developerProfileContext}}
--- DEVELOPER BACKGROUND & PROFILE ---
{{{developerProfileContext}}}
{{/if}}

{{#if existingProjectsContext}}
--- EXISTING PORTFOLIO PROJECTS (FOR HARMONY, TONE, AND CONSISTENCY) ---
{{{existingProjectsContext}}}
{{/if}}

Project Information:
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

Instructions:
1. Ensure the narrative style, vocabulary, and technical framing are consistent with the developer's experience level and other portfolio entries.
2. Structure the description around the core engineering value: Problem / Motivation -> Technical Architecture & Key Features -> Practical Real-World Impact.
3. Write 2-3 focused paragraphs in a confident, professional, and clear tone suitable for engineering managers, clients, and technical recruiters.
`,
});

const generatePortfolioDescriptionSuggestionFlow = ai.defineFlow(
  {
    name: 'generatePortfolioDescriptionSuggestionFlow',
    inputSchema: GeneratePortfolioDescriptionSuggestionInputSchema,
    outputSchema: GeneratePortfolioDescriptionSuggestionOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      if (output) {
        return output;
      }
    } catch (err) {
      console.warn('[Project Desc Gen] Error generating description:', err);
    }
    return {
      descriptionSuggestion: `${input.title} adalah proyek ${input.projectType} yang dikembangkan menggunakan ${input.technologiesUsed.join(', ')}.`
    };
  }
);

