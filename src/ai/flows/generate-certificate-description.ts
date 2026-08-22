'use server';
/**
 * @fileOverview A GenAI tool to generate professional full descriptions for certificates.
 *
 * - generateCertificateDescription - A function that handles the generation of certificate description suggestions.
 * - GenerateCertificateDescriptionInput - The input type for the function.
 * - GenerateCertificateDescriptionOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCertificateDescriptionInputSchema = z.object({
  title: z.string().describe('The title of the certificate.'),
  issuer: z.string().describe('The organization that issued the certificate.'),
  shortDescription: z.string().optional().describe('A brief overview or notes of the certificate.'),
  existingCertificatesContext: z.string().optional().describe('Summary of other certificates in the portfolio to maintain consistent terminology, tone, and experience claims.'),
  developerProfileContext: z.string().optional().describe('Context regarding the developer identity, key tech stack, and background.'),
});
export type GenerateCertificateDescriptionInput = z.infer<
  typeof GenerateCertificateDescriptionInputSchema
>;

const GenerateCertificateDescriptionOutputSchema = z.object({
  descriptionSuggestion: z
    .string()
    .describe(
      'A professional, authoritative, and contextually consistent description of the certificate and what competencies it validates.'
    ),
});
export type GenerateCertificateDescriptionOutput = z.infer<
  typeof GenerateCertificateDescriptionOutputSchema
>;

export async function generateCertificateDescription(
  input: GenerateCertificateDescriptionInput
): Promise<GenerateCertificateDescriptionOutput> {
  const hasKey = !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY);
  if (!hasKey) {
    return {
      descriptionSuggestion: `Sertifikasi ${input.title} yang diterbitkan oleh ${input.issuer} memvalidasi kompetensi profesional dan keahlian teknis terkait.`
    };
  }
  return generateCertificateDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCertificateDescriptionPrompt',
  input: {schema: GenerateCertificateDescriptionInputSchema},
  output: {schema: GenerateCertificateDescriptionOutputSchema},
  prompt: `You are an expert technical portfolio consultant helping a Software Developer craft high-impact certificate descriptions.
Your task is to write a compelling, authoritative, and professional "Full Description" for a certificate.

{{#if developerProfileContext}}
--- DEVELOPER PROFILE & BACKGROUND ---
{{{developerProfileContext}}}
{{/if}}

{{#if existingCertificatesContext}}
--- EXISTING CREDENTIALS IN PORTFOLIO (FOR HARMONY & CONSISTENT TONE) ---
{{{existingCertificatesContext}}}
{{/if}}

Certificate Details to Describe:
Title: {{{title}}}
Issuer: {{{issuer}}}
{{#if shortDescription}}Overview / Notes: {{{shortDescription}}}{{/if}}

Guidelines:
1. Harmonize with the developer's core skill set and existing portfolio certificates.
2. Clearly articulate the technical competencies validated by this credential and its relevance to modern software engineering standards.
3. Keep the tone confident, professional, and authoritative. Provide 2-3 focused paragraphs.`,
});

const generateCertificateDescriptionFlow = ai.defineFlow(
  {
    name: 'generateCertificateDescriptionFlow',
    inputSchema: GenerateCertificateDescriptionInputSchema,
    outputSchema: GenerateCertificateDescriptionOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      if (output) {
        return output;
      }
    } catch (err) {
      console.warn('[Cert Desc Gen] Error generating certificate description:', err);
    }
    return {
      descriptionSuggestion: `Sertifikasi ${input.title} yang diterbitkan oleh ${input.issuer} memvalidasi kompetensi profesional dan keahlian teknis terkait.`
    };
  }
);

