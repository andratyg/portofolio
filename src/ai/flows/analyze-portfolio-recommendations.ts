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

/**
 * Heuristic fallback audit engine in case Gemini API is offline, rate-limited,
 * or API key is not configured in production environment variables.
 */
function runHeuristicAudit(input: AnalyzePortfolioRecommendationsInput): AnalyzePortfolioRecommendationsOutput {
  const recommendations: RecommendationItem[] = [];
  const profile = input.profile;
  const stats = input.stats;
  const projects = input.projects || [];
  const certificates = input.certificates || [];
  const experiences = input.experiences || [];
  const techSkills = input.techSkills || [];
  const blogs = input.blogs || [];

  // 1. Profile Audit
  if (!profile?.aboutMeEn || profile.aboutMeEn.trim().length < 15) {
    recommendations.push({
      id: 'rec-missing-bio-en',
      category: 'Data Kosong',
      priority: 'tinggi',
      title: 'Lengkapi Bio Bahasa Inggris',
      description: 'Deskripsi profil bahasa Inggris masih kosong atau terlalu singkat. Tambahkan bio profesional dalam bahasa Inggris untuk menarik audiens global.',
      actionLink: 'profile',
    });
  }

  if (profile?.email && (profile.email.includes('karyapro.app') || profile.email.includes('example'))) {
    recommendations.push({
      id: 'rec-placeholder-email',
      category: 'Data Kosong',
      priority: 'tinggi',
      title: 'Perbarui Alamat Email Kontak',
      description: `Email saat ini ('${profile.email}') terdeteksi sebagai placeholder default. Ubah ke email resmi Anda agar pengunjung dapat menghubungi Anda.`,
      actionLink: 'profile',
    });
  }

  if (!profile?.github || !profile?.linkedin) {
    recommendations.push({
      id: 'rec-missing-social-links',
      category: 'Kredensial & Tech',
      priority: 'sedang',
      title: 'Tautkan Profil GitHub & LinkedIn',
      description: 'Pastikan tautan GitHub dan LinkedIn terisi dengan benar pada profil untuk meningkatkan kredibilitas teknis.',
      actionLink: 'profile',
    });
  }

  // 2. Metric Consistency Audit
  const claimedProjects = parseInt(stats?.completedProjects || '0', 10);
  if (claimedProjects > 0 && projects.length < claimedProjects) {
    recommendations.push({
      id: 'rec-stat-projects-mismatch',
      category: 'Konsistensi',
      priority: 'sedang',
      title: `Statistik Proyek (${claimedProjects}) Belum Sesuai Daftar Riil (${projects.length})`,
      description: `Anda mengklaim ${claimedProjects} proyek selesai di statistik Hero, namun baru mendaftarkan ${projects.length} proyek di database. Tambahkan portofolio proyek lainnya atau sesuaikan angka statistiknya.`,
      actionLink: 'projects',
    });
  }

  const claimedSkills = parseInt(stats?.techMastered || '0', 10);
  if (claimedSkills > 0 && techSkills.length < claimedSkills) {
    recommendations.push({
      id: 'rec-stat-skills-mismatch',
      category: 'Konsistensi',
      priority: 'rendah',
      title: `Lengkapi Tech Stack (${techSkills.length}/${claimedSkills} Terdaftar)`,
      description: `Klaim teknologi yang dikuasai (${claimedSkills}) lebih besar dari item yang didaftarkan (${techSkills.length}). Daftarkan skill teknis lainnya ke tab Tech Stack.`,
      actionLink: 'techstack',
    });
  }

  // 3. Projects Audit
  projects.forEach(p => {
    if (!p.titleEn || !p.shortDescriptionEn) {
      recommendations.push({
        id: `rec-proj-trans-${p.id}`,
        category: 'Peningkatan Konten',
        priority: 'tinggi',
        title: `Terjemahkan Proyek '${p.titleId || 'Tanpa Judul'}' ke Bahasa Inggris`,
        description: `Proyek '${p.titleId}' belum memiliki ringkasan versi bahasa Inggris. Gunakan fitur terjemahan AI di tab Proyek untuk melengkapinya.`,
        actionLink: 'projects',
      });
    }

    if (!p.demoUrl) {
      recommendations.push({
        id: `rec-proj-demo-${p.id}`,
        category: 'SEO',
        priority: 'sedang',
        title: `Tambahkan Demo URL pada '${p.titleId || 'Proyek'}'`,
        description: 'Tautan demo langsung atau repository proyek sangat meningkatkan kepercayaan klien dan recruiter.',
        actionLink: 'projects',
      });
    }

    if (!p.technologies || p.technologies.length === 0) {
      recommendations.push({
        id: `rec-proj-tech-${p.id}`,
        category: 'Kredensial & Tech',
        priority: 'sedang',
        title: `Tambahkan Tag Teknologi pada '${p.titleId || 'Proyek'}'`,
        description: 'Daftar teknologi yang digunakan pada proyek ini masih kosong. Tambahkan stack seperti Next.js, TypeScript, Firebase, dll.',
        actionLink: 'projects',
      });
    }
  });

  // 4. Certificates Audit
  certificates.forEach(c => {
    if (!c.credentialUrl) {
      recommendations.push({
        id: `rec-cert-cred-${c.id}`,
        category: 'Kredensial & Tech',
        priority: 'sedang',
        title: `Sematkan URL Kredensial Resmi '${c.titleId || 'Sertifikat'}'`,
        description: 'Sertifikat akan memiliki bobot pembuktian lebih tinggi jika menyertakan link verifikasi dari penerbit sertifikat.',
        actionLink: 'certificates',
      });
    }
  });

  // 5. Blogs Audit
  blogs.forEach(b => {
    if (!b.tags || b.tags.length === 0) {
      recommendations.push({
        id: `rec-blog-tags-${b.id}`,
        category: 'SEO',
        priority: 'rendah',
        title: `Tambahkan Tag Kategori pada Artikel '${b.titleId || 'Blog'}'`,
        description: 'Tag kategori memudahkan pembaca menyaring topik artikel yang relevan dan membantu struktur SEO.',
        actionLink: 'blogs',
      });
    }
  });

  // Hitung Health Score
  let score = 100;
  recommendations.forEach(r => {
    if (r.priority === 'tinggi') score -= 10;
    else if (r.priority === 'sedang') score -= 5;
    else score -= 2;
  });
  score = Math.max(35, Math.min(100, score));

  let summary = '';
  if (score >= 85) {
    summary = `Portofolio Anda dalam kondisi sangat prima (Skor: ${score}/100). Hanya terdapat beberapa optimasi minor untuk menyempurnakan portofolio Anda.`;
  } else if (score >= 65) {
    summary = `Portofolio Anda sudah memiliki fondasi yang baik (Skor: ${score}/100). Terdapat ${recommendations.length} poin perbaikan untuk meningkatkan konversi dan daya tarik internasional.`;
  } else {
    summary = `Ditemukan ${recommendations.length} poin penting yang perlu dilengkapi (Skor: ${score}/100), terutama terkait kelengkapan bahasa Inggris, email kontak, dan konsistensi metrik.`;
  }

  return {
    summary,
    healthScore: score,
    recommendations,
  };
}

export async function analyzePortfolioRecommendations(
  input: AnalyzePortfolioRecommendationsInput
): Promise<AnalyzePortfolioRecommendationsOutput> {
  const hasKey = !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY);
  if (!hasKey) {
    return runHeuristicAudit(input);
  }

  try {
    const result = await analyzePortfolioRecommendationsFlow(input);
    if (result && result.recommendations && result.recommendations.length > 0) {
      return result;
    }
  } catch (error) {
    console.warn('[AI Advisor] Gemini flow error, using intelligent heuristic audit fallback:', error);
  }

  // Fallback selalu berhasil dan tidak pernah memicu 500 error
  return runHeuristicAudit(input);
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
    try {
      const { output } = await prompt(input);
      if (output) return output;
    } catch (e) {
      console.warn('[AI Advisor] Prompt error in flow:', e);
    }
    return runHeuristicAudit(input);
  }
);
