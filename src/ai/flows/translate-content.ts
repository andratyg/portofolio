
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

// Deterministic dictionary & heuristic fallback for portfolio content when GenAI API is unavailable
function heuristicTranslate(text: string, targetLang: 'id' | 'en'): string {
  if (!text || typeof text !== 'string') return '';
  const trimmed = text.trim();
  if (!trimmed) return '';

  if (targetLang === 'en') {
    // 1. Direct phrase replacements (ordered by length descending to match full phrases first)
    const phraseMap: [RegExp, string][] = [
      [/\bPengembang Full-Stack\b/gi, 'Full-Stack Developer'],
      [/\bPengembang Web & Siswa\b/gi, 'Web Developer & Student'],
      [/\bPengembang Web\b/gi, 'Web Developer'],
      [/\bDesainer UI\/UX\b/gi, 'UI/UX Designer'],
      [/\bRekayasa Perangkat Lunak\b/gi, 'Software Engineering'],
      [/\bPengembangan Perangkat Lunak dan Gim\b/gi, 'Software and Game Development'],
      [/\bPengembangan Web Modern\b/gi, 'Modern Web Development'],
      [/\bSiswa SMK Wikrama Bogor\b/gi, 'Student at SMK Wikrama Bogor'],
      [/\bSMK Wikrama Bogor\b/gi, 'SMK Wikrama Bogor Vocational High School'],
      [/\bRekayasa Solusi Web Modern & Berdampak\b/gi, 'Engineering Modern & Impactful Web Solutions'],
      [/\bMembangun aplikasi web berperforma tinggi, skalabel, dan ramah pengguna dengan ekosistem React, Next\.js, dan Firebase\.\b/gi, 'Building high-performance, scalable, and user-friendly web applications with the React, Next.js, and Firebase ecosystem.'],
      [/\bHalo, saya\b/gi, 'Hello, I am'],
      [/\bHalo! Saya\b/gi, 'Hello! I am'],
      [/\bSaya seorang\b/gi, 'I am a'],
      [/\bSaya membangun\b/gi, 'I build'],
      [/\bfokus di web development\b/gi, 'focused on web development'],
      [/\bfokus pada\b/gi, 'focused on'],
      [/\bjurusan PPLG\b/gi, 'majoring in Software and Game Development (PPLG)'],
      [/\bTantangan Teknis\b/gi, 'Technical Challenge'],
      [/\bSolusi Strategis\b/gi, 'Strategic Solution'],
      [/\bFitur Utama\b/gi, 'Key Features'],
      [/\bHasil & Dampak\b/gi, 'Results & Impact'],
      [/\bAplikasi Web\b/gi, 'Web Application'],
      [/\bSistem Informasi\b/gi, 'Information System'],
      [/\bManajemen Data\b/gi, 'Data Management'],
      [/\bKredensial Resmi\b/gi, 'Official Credential'],
      [/\bSertifikat Kompetensi\b/gi, 'Certificate of Competence'],
      [/\bPelatihan Intensif\b/gi, 'Intensive Training'],
      [/\bDasar Pemrograman\b/gi, 'Programming Fundamentals'],
      [/\bPrinsip Rekayasa\b/gi, 'Engineering Principles'],
      [/\bberperforma tinggi\b/gi, 'high-performance'],
      [/\bramah pengguna\b/gi, 'user-friendly'],
      [/\bresponsif\b/gi, 'responsive'],
      [/\bantar muka\b/gi, 'interface'],
      [/\bterintegrasi\b/gi, 'integrated'],
      [/\bmenggunakan\b/gi, 'utilizing'],
      [/\bberbasis\b/gi, 'built with'],
      [/\bdengan\b/gi, 'with'],
      [/\buntuk\b/gi, 'for'],
      [/\bdan\b/gi, 'and'],
      [/\bserta\b/gi, 'as well as'],
      [/\byang\b/gi, 'that'],
      [/\bdari\b/gi, 'from'],
      [/\bke\b/gi, 'to'],
      [/\bdi\b/gi, 'at'],
      [/\bproyek\b/gi, 'project'],
      [/\bproyek ini\b/gi, 'this project'],
      [/\baplikasi ini\b/gi, 'this application'],
      [/\bsolusi digital\b/gi, 'digital solution'],
    ];

    let result = trimmed;
    for (const [pattern, replacement] of phraseMap) {
      result = result.replace(pattern, replacement);
    }
    return result;
  } else {
    // English to Indonesian
    const phraseMapId: [RegExp, string][] = [
      [/\bFull-Stack Developer\b/gi, 'Pengembang Full-Stack'],
      [/\bWeb Developer & Student\b/gi, 'Pengembang Web & Siswa'],
      [/\bWeb Developer\b/gi, 'Pengembang Web'],
      [/\bUI\/UX Designer\b/gi, 'Desainer UI/UX'],
      [/\bSoftware Engineering\b/gi, 'Rekayasa Perangkat Lunak'],
      [/\bSoftware and Game Development\b/gi, 'Pengembangan Perangkat Lunak dan Gim'],
      [/\bTechnical Challenge\b/gi, 'Tantangan Teknis'],
      [/\bStrategic Solution\b/gi, 'Solusi Strategis'],
      [/\bKey Features\b/gi, 'Fitur Utama'],
      [/\bResults & Impact\b/gi, 'Hasil & Dampak'],
      [/\bWeb Application\b/gi, 'Aplikasi Web'],
      [/\bHello, I am\b/gi, 'Halo, saya'],
      [/\bI build\b/gi, 'Saya membangun'],
      [/\bwith\b/gi, 'dengan'],
      [/\band\b/gi, 'dan'],
      [/\bfor\b/gi, 'untuk'],
    ];

    let result = trimmed;
    for (const [pattern, replacement] of phraseMapId) {
      result = result.replace(pattern, replacement);
    }
    return result;
  }
}

export async function translateContent(input: TranslateContentInput): Promise<TranslateContentOutput> {
  const parsed = TranslateContentInputSchema.safeParse(input);
  if (!parsed.success) {
    console.warn('[translateContent] Invalid input received:', parsed.error.issues);
    return { translatedText: typeof input?.text === 'string' ? input.text : '' };
  }

  const hasKey = !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY);
  if (!hasKey) {
    return { translatedText: heuristicTranslate(parsed.data.text, parsed.data.targetLang) };
  }

  try {
    const aiResult = await translateContentFlow(parsed.data);
    if (aiResult?.translatedText && aiResult.translatedText !== parsed.data.text) {
      return aiResult;
    }
  } catch (e) {
    console.warn('[translateContent] AI flow failed, switching to heuristic translation:', e);
  }

  return { translatedText: heuristicTranslate(parsed.data.text, parsed.data.targetLang) };
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
      if (output && output.translatedText) {
        return output;
      }
    } catch (err) {
      console.warn('[Translation Flow] Error translating content:', err);
    }
    return {translatedText: heuristicTranslate(input.text, input.targetLang)};
  }
);
