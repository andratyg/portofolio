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
    .describe('Ringkasan lengkap atau solusi arsitektur utama untuk proyek.'),
  shortDescriptionId: z
    .string()
    .describe('Ringkasan singkat dan memikat dalam Bahasa Indonesia (1-2 kalimat) yang cocok untuk kartu proyek.'),
  shortDescriptionEn: z
    .string()
    .describe('Compelling, concise executive summary in English (1-2 sentences) for the project preview card.'),
  problemId: z
    .string()
    .describe('Uraian mendalam tentang latar belakang masalah, pain point pengguna/bisnis, dan tantangan teknis dalam Bahasa Indonesia.'),
  problemEn: z
    .string()
    .describe('In-depth problem statement, real-world context, and technical engineering challenges in English.'),
  solutionId: z
    .string()
    .describe('Solusi rekayasa perangkat lunak, arsitektur teknis, dan implementasi fitur kunci dalam Bahasa Indonesia yang terstruktur rapi.'),
  solutionEn: z
    .string()
    .describe('Comprehensive software engineering solution, technical architecture, and key features implementation in English.'),
  impactStats: z
    .string()
    .describe('Metrik dampak atau key results terukur (contoh: "+65% Efisiensi, 99.9% Uptime, <500ms Latensi").'),
});
export type GeneratePortfolioDescriptionSuggestionOutput = z.infer<
  typeof GeneratePortfolioDescriptionSuggestionOutputSchema
>;

export async function generatePortfolioDescriptionSuggestion(
  input: GeneratePortfolioDescriptionSuggestionInput
): Promise<GeneratePortfolioDescriptionSuggestionOutput> {
  const hasKey = !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY);
  if (!hasKey) {
    const techStr = input.technologiesUsed.join(', ');
    return {
      descriptionSuggestion: `${input.title} adalah solusi ${input.projectType} modern yang dikembangkan dengan ${techStr}.`,
      shortDescriptionId: `${input.title} adalah sistem ${input.projectType} modern yang dibangun dengan ${techStr} untuk efisiensi tinggi.`,
      shortDescriptionEn: `${input.title} is a modern ${input.projectType} platform built with ${techStr} for high performance.`,
      problemId: `Banyak pengguna menghadapi kendala alur kerja manual dan sistem konvensional yang lambat, rentan error, serta tidak terintegrasi dengan baik.`,
      problemEn: `Users frequently struggle with fragmented legacy workflows that suffer from slow performance, error-prone manual steps, and lack of scalability.`,
      solutionId: `Mengembangkan arsitektur web modern berbasis ${techStr} dengan desain modular, responsif, dan manajemen state reaktif untuk performa optimal.`,
      solutionEn: `Architected a modern ${input.projectType} application leveraging ${techStr} with clean architecture and reactive state management.`,
      impactStats: '+45% Efisiensi Alur Kerja',
    };
  }
  return generatePortfolioDescriptionSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePortfolioDescriptionPrompt',
  input: {schema: GeneratePortfolioDescriptionSuggestionInputSchema},
  output: {schema: GeneratePortfolioDescriptionSuggestionOutputSchema},
  prompt: `You are an elite software architect, senior technical writer, and lead engineering mentor.
Your task is to craft an exhaustive, production-grade, and deeply impressive portfolio project breakdown that highlights engineering rigor, strategic problem-solving, and measurable value.

{{#if developerProfileContext}}
--- DEVELOPER BACKGROUND & PROFILE ---
{{{developerProfileContext}}}
{{/if}}

{{#if existingProjectsContext}}
--- EXISTING PORTFOLIO PROJECTS (FOR HARMONY & TONE) ---
{{{existingProjectsContext}}}
{{/if}}

Project Inputs:
- Project Title: {{{title}}}
- Project Type: {{{projectType}}}
- Technologies Used: {{#each technologiesUsed}}- {{{this}}}
{{/each}}
{{#if keyFeatures}}- Key Features / Notes: {{{keyFeatures}}}{{/if}}
{{#if problemSolved}}- Problem / Motivation: {{{problemSolved}}}{{/if}}
{{#if targetAudience}}- Target Audience: {{{targetAudience}}}{{/if}}

Generate a comprehensive, professional breakdown in the structured JSON output:

1. "shortDescriptionId":
   A sharp, engaging 1-2 sentence overview in Bahasa Indonesia explaining what the product does and its core value proposition. Perfect for the portfolio preview card.

2. "shortDescriptionEn":
   Fluent, technical English executive summary (1-2 sentences) of the short description.

3. "problemId":
   A thorough and realistic problem analysis in Bahasa Indonesia (2-3 structured paragraphs). Clearly articulate:
   - The business/user context and pain points.
   - Bottlenecks in existing traditional solutions.
   - Specific engineering hurdles (e.g., latency, real-time data sync, state complexity, security, or cross-device responsiveness).

4. "problemEn":
   Articulate and comprehensive English translation and adaptation of the problem statement.

5. "solutionId":
   An in-depth, structured engineering solution in Bahasa Indonesia organized with clear markdown headers and bullet points:
   - 🏛️ **Arsitektur Sistem & Rekayasa**: Architectural design choices, stack rationale, and modular data flow.
   - ⚡ **Fitur & Kapabilitas Utama**: Key innovative features, seamless UX, and operational workflow.
   - 🛡️ **Performa, Keandalan & Skalabilitas**: Specific optimizations (caching, responsive layout, type safety, security).

6. "solutionEn":
   Professional, authoritative English version of the comprehensive solution with matching markdown structure.

7. "impactStats":
   Concrete, realistic performance and business impact metrics (e.g., "+60% Efisiensi Alur Kerja, 99.9% Uptime, <450ms Latensi").

8. "descriptionSuggestion":
   A high-level synthesis of the solution narrative.
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
    const techStr = input.technologiesUsed.join(', ');
    return {
      descriptionSuggestion: `${input.title} adalah solusi ${input.projectType} modern yang dikembangkan dengan ${techStr}.`,
      shortDescriptionId: `${input.title} adalah sistem ${input.projectType} modern yang dibangun dengan ${techStr} untuk efisiensi tinggi.`,
      shortDescriptionEn: `${input.title} is a modern ${input.projectType} platform built with ${techStr} for high performance.`,
      problemId: `Banyak pengguna menghadapi kendala alur kerja manual dan sistem konvensional yang lambat, rentan error, serta tidak terintegrasi dengan baik.`,
      problemEn: `Users frequently struggle with fragmented legacy workflows that suffer from slow performance, error-prone manual steps, and lack of scalability.`,
      solutionId: `Mengembangkan arsitektur web modern berbasis ${techStr} dengan desain modular, responsif, dan manajemen state reaktif untuk performa optimal.`,
      solutionEn: `Architected a modern ${input.projectType} application leveraging ${techStr} with clean architecture and reactive state management.`,
      impactStats: '+45% Efisiensi Alur Kerja',
    };
  }
);

