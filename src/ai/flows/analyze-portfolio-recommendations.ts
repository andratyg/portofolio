'use server';
/**
 * @fileOverview A GenAI flow acting as an AI Portfolio Advisor/Consultant to audit portfolio completeness, consistency, SEO, and quality.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const RecommendationItemSchema = z.object({
  id: z.string().describe('Unique identifier for this recommendation (e.g., rec-missing-en-proj-1 or rec-stat-mismatch).'),
  category: z.enum(['Data Kosong', 'SEO', 'Konsistensi', 'Peningkatan Konten', 'Kredensial & Tech']).describe('Category of the recommendation.'),
  priority: z.enum(['tinggi', 'sedang', 'rendah']).describe('Priority level: tinggi (high), sedang (medium), or rendah (low).'),
  title: z.string().describe('Short actionable title of the recommendation.'),
  description: z.string().describe('Detailed explanation of what needs to be improved and why.'),
  actionLink: z.string().describe('Target admin tab identifier: "profile", "content", "projects", "certificates", "journey", "techstack", or "blogs".'),
});
export type RecommendationItem = z.infer<typeof RecommendationItemSchema>;

export const AnalyzePortfolioRecommendationsInputSchema = z.object({
  profile: z.object({
    name: z.string().optional(),
    roleId: z.string().optional(),
    roleEn: z.string().optional(),
    aboutMeId: z.string().optional(),
    aboutMeEn: z.string().optional(),
    heroTitleId: z.string().optional(),
    heroTitleEn: z.string().optional(),
    heroSubtitleId: z.string().optional(),
    heroSubtitleEn: z.string().optional(),
    email: z.string().optional(),
    whatsapp: z.string().optional(),
    linkedin: z.string().optional(),
    github: z.string().optional(),
  }).optional(),
  stats: z.object({
    completedProjects: z.string().optional(),
    yearsExperience: z.string().optional(),
    techMastered: z.string().optional(),
    clientSatisfaction: z.string().optional(),
  }).optional(),
  projects: z.array(z.object({
    id: z.string(),
    titleId: z.string().optional(),
    titleEn: z.string().optional(),
    shortDescriptionId: z.string().optional(),
    shortDescriptionEn: z.string().optional(),
    fullDescriptionId: z.string().optional(),
    fullDescriptionEn: z.string().optional(),
    technologies: z.array(z.string()).optional(),
    imageUrl: z.string().optional(),
    demoUrl: z.string().optional(),
    type: z.string().optional(),
    featured: z.boolean().optional(),
  })).optional(),
  certificates: z.array(z.object({
    id: z.string(),
    titleId: z.string().optional(),
    titleEn: z.string().optional(),
    shortDescriptionId: z.string().optional(),
    shortDescriptionEn: z.string().optional(),
    fullDescriptionId: z.string().optional(),
    fullDescriptionEn: z.string().optional(),
    issuer: z.string().optional(),
    year: z.string().optional(),
    imageUrl: z.string().optional(),
    credentialUrl: z.string().optional(),
  })).optional(),
  experiences: z.array(z.object({
    id: z.string(),
    titleId: z.string().optional(),
    titleEn: z.string().optional(),
    company: z.string().optional(),
    year: z.string().optional(),
    descriptionId: z.string().optional(),
    descriptionEn: z.string().optional(),
  })).optional(),
  techSkills: z.array(z.object({
    id: z.string(),
    name: z.string(),
    category: z.string().optional(),
    level: z.number().optional(),
  })).optional(),
  blogs: z.array(z.object({
    id: z.string(),
    titleId: z.string().optional(),
    titleEn: z.string().optional(),
    summaryId: z.string().optional(),
    summaryEn: z.string().optional(),
    tags: z.array(z.string()).optional(),
    slug: z.string().optional(),
  })).optional(),
});
export type AnalyzePortfolioRecommendationsInput = z.infer<typeof AnalyzePortfolioRecommendationsInputSchema>;

export const AnalyzePortfolioRecommendationsOutputSchema = z.object({
  summary: z.string().describe('Overall assessment summary of the portfolio health and readiness.'),
  healthScore: z.number().describe('Calculated overall portfolio completeness/quality score between 0 and 100.'),
  recommendations: z.array(RecommendationItemSchema).describe('List of actionable, prioritized recommendations.'),
});
export type AnalyzePortfolioRecommendationsOutput = z.infer<typeof AnalyzePortfolioRecommendationsOutputSchema>;

export async function analyzePortfolioRecommendations(
  input: AnalyzePortfolioRecommendationsInput
): Promise<AnalyzePortfolioRecommendationsOutput> {
  return analyzePortfolioRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzePortfolioRecommendationsPrompt',
  input: { schema: AnalyzePortfolioRecommendationsInputSchema },
  output: { schema: AnalyzePortfolioRecommendationsOutputSchema },
  prompt: `You are an elite Tech Portfolio Consultant, Senior Technical Recruiter, and Web Developer Career Advisor.
Your role is to rigorously evaluate the current state of a web developer's portfolio data and provide prioritized, concrete, and highly actionable audit recommendations.

Do NOT generate new creative replacement content; instead, pinpoint exact issues, gaps, and improvements needed.

--- CURRENT PORTFOLIO SNAPSHOT ---
Profile Data:
- Name: {{{profile.name}}}
- Role (ID): {{{profile.roleId}}} | Role (EN): {{{profile.roleEn}}}
- Bio (ID): {{{profile.aboutMeId}}}
- Bio (EN): {{{profile.aboutMeEn}}}
- Email: {{{profile.email}}}
- WhatsApp: {{{profile.whatsapp}}}
- LinkedIn: {{{profile.linkedin}}}
- GitHub: {{{profile.github}}}

Portfolio Stats:
- Total Projects Claimed: {{{stats.completedProjects}}}
- Years of Experience Claimed: {{{stats.yearsExperience}}}
- Tech Mastered Claimed: {{{stats.techMastered}}}
- Client Satisfaction: {{{stats.clientSatisfaction}}}

Actual Entries Count:
- Projects List: {{projects.length}} items
- Certificates List: {{certificates.length}} items
- Experience/Career Timeline: {{experiences.length}} items
- Tech Skills: {{techSkills.length}} items
- Blog Posts: {{blogs.length}} items

Full Projects Data:
{{#each projects}}
- [Project {{id}}] Title(ID): "{{titleId}}", Title(EN): "{{titleEn}}", ShortDesc(ID): "{{shortDescriptionId}}", ShortDesc(EN): "{{shortDescriptionEn}}", Tech: [{{technologies}}], Image: "{{imageUrl}}", Demo: "{{demoUrl}}", Featured: {{featured}}
{{/each}}

Full Certificates Data:
{{#each certificates}}
- [Cert {{id}}] Title(ID): "{{titleId}}", Title(EN): "{{titleEn}}", Issuer: "{{issuer}}", Year: "{{year}}", CredentialUrl: "{{credentialUrl}}", Image: "{{imageUrl}}"
{{/each}}

Full Experiences Data:
{{#each experiences}}
- [Exp {{id}}] Year: "{{year}}", Title(ID): "{{titleId}}", Title(EN): "{{titleEn}}", Company: "{{company}}", Desc(ID): "{{descriptionId}}", Desc(EN): "{{descriptionEn}}"
{{/each}}

Tech Skills:
{{#each techSkills}}
- [Skill] {{name}} (Category: {{category}}, Level: {{level}}%)
{{/each}}

Blogs Data:
{{#each blogs}}
- [Blog {{id}}] Slug: "{{slug}}", Title(ID): "{{titleId}}", Title(EN): "{{titleEn}}", Tags: [{{tags}}]
{{/each}}

--- AUDIT CHECKLIST TO EVALUATE ---
1. Data Kosong & Default Values:
   - Check if placeholder values exist (e.g. "admin@karyapro.app", generic phone numbers, default titles, empty images, or empty demo links).
2. Bilingual Completeness (ID vs EN):
   - Check projects, certificates, experiences, bio, and blogs for missing English translations (e.g. empty 'titleEn', 'shortDescriptionEn', 'descriptionEn', or where English text is just an untranslated copy of Indonesian text).
3. Metric & Claim Consistency:
   - Check if the claimed stats (e.g. "12 Completed Projects", "5 Years Experience") align realistically with the actual entries in projects and career timeline.
4. Description Quality & Depth:
   - Identify entries with descriptions that are too short, vague, or lack mention of real technical problem-solving.
5. Tech Stack & Credential Tagging:
   - Identify projects or certificates that have empty technologies arrays or missing verification credential URLs.
6. Categorization & Action Links:
   - Assign each recommendation an accurate category ('Data Kosong', 'SEO', 'Konsistensi', 'Peningkatan Konten', or 'Kredensial & Tech').
   - Set priority ('tinggi', 'sedang', or 'rendah').
   - Provide an exact 'actionLink' matching one of the admin tabs: "profile", "content", "projects", "certificates", "journey", "techstack", or "blogs".

Produce a thorough evaluation with a realistic healthScore (0-100), concise summary, and a list of specific recommendation items.`,
});

const analyzePortfolioRecommendationsFlow = ai.defineFlow(
  {
    name: 'analyzePortfolioRecommendationsFlow',
    inputSchema: AnalyzePortfolioRecommendationsInputSchema,
    outputSchema: AnalyzePortfolioRecommendationsOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    if (!output) {
      return {
        summary: 'Tidak dapat menganalisis data portofolio saat ini.',
        healthScore: 50,
        recommendations: [],
      };
    }
    return output;
  }
);
