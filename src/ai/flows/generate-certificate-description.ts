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
  shortDescription: z.string().optional().describe('A brief overview of the certificate.'),
});
export type GenerateCertificateDescriptionInput = z.infer<
  typeof GenerateCertificateDescriptionInputSchema
>;

const GenerateCertificateDescriptionOutputSchema = z.object({
  descriptionSuggestion: z
    .string()
    .describe(
      'A professional and detailed description of the certificate and what it validates.'
    ),
});
export type GenerateCertificateDescriptionOutput = z.infer<
  typeof GenerateCertificateDescriptionOutputSchema
>;

export async function generateCertificateDescription(
  input: GenerateCertificateDescriptionInput
): Promise<GenerateCertificateDescriptionOutput> {
  return generateCertificateDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCertificateDescriptionPrompt',
  input: {schema: GenerateCertificateDescriptionInputSchema},
  output: {schema: GenerateCertificateDescriptionOutputSchema},
  prompt: `You are an AI assistant helping a professional build their portfolio.
Your task is to write a compelling, professional, and detailed "Full Description" for a certificate.

This description should explain:
1. What technical skills or knowledge were validated by this certification.
2. The significance of the certification in the industry.
3. The commitment required to earn it.

Certificate Details:
Title: {{{title}}}
Issuer: {{{issuer}}}
{{#if shortDescription}}Overview: {{{shortDescription}}}{{/if}}

Please generate a detailed description of 2-3 paragraphs. Keep it professional and authoritative.`,
});

const generateCertificateDescriptionFlow = ai.defineFlow(
  {
    name: 'generateCertificateDescriptionFlow',
    inputSchema: GenerateCertificateDescriptionInputSchema,
    outputSchema: GenerateCertificateDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
