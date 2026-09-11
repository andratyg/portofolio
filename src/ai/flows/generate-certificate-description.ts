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
  shortDescriptionId: z
    .string()
    .optional()
    .describe('Ringkasan 1 kalimat kredensial dalam Bahasa Indonesia.'),
  shortDescriptionEn: z
    .string()
    .optional()
    .describe('1-sentence executive credential summary in English.'),
  fullDescriptionId: z
    .string()
    .optional()
    .describe('Uraian mendalam tentang kompetensi yang divalidasi dan relevansi industri dalam Bahasa Indonesia.'),
  fullDescriptionEn: z
    .string()
    .optional()
    .describe('In-depth professional competency validation in English.'),
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
      descriptionSuggestion: `Sertifikasi ${input.title} yang diterbitkan oleh ${input.issuer} memvalidasi kompetensi profesional dan keahlian teknis terkait.`,
      shortDescriptionId: `Memvalidasi kompetensi teknis tingkat lanjut pada bidang ${input.title} yang diakui secara resmi oleh ${input.issuer}.`,
      shortDescriptionEn: `Validates advanced technical competencies in ${input.title}, officially recognized by ${input.issuer}.`,
      fullDescriptionId: `Sertifikasi resmi "${input.title}" dari ${input.issuer} mengukuhkan penguasaan arsitektur, standar industri terbaik, dan pemecahan masalah teknis di lingkungan produksi.`,
      fullDescriptionEn: `Official certification "${input.title}" issued by ${input.issuer} demonstrates practical mastery of industry best practices, architecture standards, and production-grade engineering.`,
    };
  }
  return generateCertificateDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCertificateDescriptionPrompt',
  input: {schema: GenerateCertificateDescriptionInputSchema},
  output: {schema: GenerateCertificateDescriptionOutputSchema},
  prompt: `You are an expert technical portfolio consultant helping a Software Developer craft high-impact certificate descriptions.
Your task is to write compelling, authoritative, and professional descriptions for a certificate in both Indonesian and English.

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
3. Provide:
   - "shortDescriptionId": A sharp 1-sentence credential highlight in Indonesian.
   - "shortDescriptionEn": Concise English version of the highlight.
   - "fullDescriptionId": A comprehensive 2-3 paragraph deep-dive in Indonesian into the verified knowledge, methodologies, and practical software engineering capability.
   - "fullDescriptionEn": Fluent English translation and adaptation of the full description.
   - "descriptionSuggestion": The full Indonesian description.
`,
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
      descriptionSuggestion: `Sertifikasi ${input.title} yang diterbitkan oleh ${input.issuer} memvalidasi kompetensi profesional dan keahlian teknis terkait.`,
      shortDescriptionId: `Memvalidasi kompetensi teknis tingkat lanjut pada bidang ${input.title} yang diakui secara resmi oleh ${input.issuer}.`,
      shortDescriptionEn: `Validates advanced technical competencies in ${input.title}, officially recognized by ${input.issuer}.`,
      fullDescriptionId: `Sertifikasi resmi "${input.title}" dari ${input.issuer} mengukuhkan penguasaan arsitektur, standar industri terbaik, dan pemecahan masalah teknis di lingkungan produksi.`,
      fullDescriptionEn: `Official certification "${input.title}" issued by ${input.issuer} demonstrates practical mastery of industry best practices, architecture standards, and production-grade engineering.`,
    };
  }
);

