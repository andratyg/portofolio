"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, Loader2, AlertCircle, CheckCircle2, ArrowRight, 
  RotateCcw, ShieldCheck, TrendingUp, AlertTriangle, Info,
  Filter, Check, EyeOff, Trash2, Zap, Award, Briefcase, UserCheck, BookOpen, Terminal
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  analyzePortfolioRecommendations, 
  type RecommendationItem, 
  type AnalyzePortfolioRecommendationsOutput 
} from '@/ai/flows/analyze-portfolio-recommendations';
import { Project, Certificate, Experience, TechSkill, BlogPost, ProfileData, PortfolioStats } from '@/lib/types';
import { useFirestore } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { cn } from '@/lib/utils';

interface AIAdvisorPanelProps {
  projects: Project[];
  certificates: Certificate[];
  experiences: Experience[];
  techSkills: TechSkill[];
  blogs: BlogPost[];
  profile: ProfileData;
  stats: PortfolioStats;
  onNavigateTab: (tab: string) => void;
}

export function AIAdvisorPanel({
  projects,
  certificates,
  experiences,
  techSkills,
  blogs,
  profile,
  stats,
  onNavigateTab,
}: AIAdvisorPanelProps) {
  const { toast } = useToast();
  const firestore = useFirestore();

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [healthScore, setHealthScore] = useState<number | null>(null);
  const [summary, setSummary] = useState<string>('');
  const [lastAnalyzed, setLastAnalyzed] = useState<string | null>(null);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [showDismissed, setShowDismissed] = useState<boolean>(false);
  const [isLoadingSavedState, setIsLoadingSavedState] = useState(true);

  // Load saved analysis & dismissed IDs from Firestore on mount
  useEffect(() => {
    let isMounted = true;
    async function loadAdvisorState() {
      if (!firestore) return;
      try {
        const advisorDocRef = doc(firestore, 'adminSettings', 'advisor');
        const snap = await getDoc(advisorDocRef);
        if (snap.exists() && isMounted) {
          const data = snap.data();
          if (data.recommendations) setRecommendations(data.recommendations);
          if (typeof data.healthScore === 'number') setHealthScore(data.healthScore);
          if (data.summary) setSummary(data.summary);
          if (data.lastAnalyzed) setLastAnalyzed(data.lastAnalyzed);
          if (Array.isArray(data.dismissedIds)) setDismissedIds(data.dismissedIds);
        }
      } catch (err) {
        console.warn('Could not load saved advisor state:', err);
      } finally {
        if (isMounted) setIsLoadingSavedState(false);
      }
    }
    loadAdvisorState();
    return () => { isMounted = false; };
  }, [firestore]);

  // Run AI Analysis
  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const result: AnalyzePortfolioRecommendationsOutput = await analyzePortfolioRecommendations({
        profile: {
          name: profile?.name || '',
          roleId: profile?.roleId || '',
          roleEn: profile?.roleEn || '',
          aboutMeId: profile?.aboutMeId || '',
          aboutMeEn: profile?.aboutMeEn || '',
          heroTitleId: profile?.heroTitleId || '',
          heroTitleEn: profile?.heroTitleEn || '',
          heroSubtitleId: profile?.heroSubtitleId || '',
          heroSubtitleEn: profile?.heroSubtitleEn || '',
          email: profile?.email || '',
          whatsapp: profile?.whatsapp || '',
          linkedin: profile?.linkedin || '',
          github: profile?.github || '',
        },
        stats: {
          completedProjects: stats?.completedProjects || '0',
          yearsExperience: stats?.yearsExperience || '0',
          techMastered: stats?.techMastered || '0',
          clientSatisfaction: stats?.clientSatisfaction || '100%',
        },
        projects: projects.map(p => ({
          id: p.id,
          titleId: p.titleId || '',
          titleEn: p.titleEn || '',
          shortDescriptionId: p.shortDescriptionId || '',
          shortDescriptionEn: p.shortDescriptionEn || '',
          fullDescriptionId: p.fullDescriptionId || '',
          fullDescriptionEn: p.fullDescriptionEn || '',
          technologies: p.technologies || [],
          imageUrl: p.imageUrl || '',
          demoUrl: p.demoUrl || '',
          type: p.type || 'web',
          featured: !!p.featured,
        })),
        certificates: certificates.map(c => ({
          id: c.id,
          titleId: c.titleId || '',
          titleEn: c.titleEn || '',
          shortDescriptionId: c.shortDescriptionId || '',
          shortDescriptionEn: c.shortDescriptionEn || '',
          fullDescriptionId: c.fullDescriptionId || '',
          fullDescriptionEn: c.fullDescriptionEn || '',
          issuer: c.issuer || '',
          year: c.year || '',
          imageUrl: c.imageUrl || '',
          credentialUrl: c.credentialUrl || '',
        })),
        experiences: experiences.map(e => ({
          id: e.id,
          titleId: e.titleId || '',
          titleEn: e.titleEn || '',
          company: e.company || '',
          year: e.year || '',
          descriptionId: e.descriptionId || '',
          descriptionEn: e.descriptionEn || '',
        })),
        techSkills: techSkills.map(s => ({
          id: s.id,
          name: s.name,
          category: s.category || 'Tech',
          level: s.level || 50,
        })),
        blogs: blogs.map(b => ({
          id: b.id,
          titleId: b.titleId || '',
          titleEn: b.titleEn || '',
          summaryId: b.summaryId || '',
          summaryEn: b.summaryEn || '',
          tags: b.tags || [],
          slug: b.slug || '',
        })),
      });

      setRecommendations(result.recommendations || []);
      setHealthScore(result.healthScore);
      setSummary(result.summary);
      const timestamp = new Date().toISOString();
      setLastAnalyzed(timestamp);

      // Persist to Firestore
      if (firestore) {
        try {
          const advisorDocRef = doc(firestore, 'adminSettings', 'advisor');
          await setDoc(advisorDocRef, {
            recommendations: result.recommendations || [],
            healthScore: result.healthScore,
            summary: result.summary,
            lastAnalyzed: timestamp,
            dismissedIds: dismissedIds,
          }, { merge: true });
        } catch (saveErr) {
          console.warn('Failed to persist advisor scan to Firestore:', saveErr);
        }
      }

      toast({
        title: "Audit AI Selesai",
        description: `Ditemukan ${result.recommendations.length} poin rekomendasi (Skor Kesiapan: ${result.healthScore}/100).`,
      });
    } catch (err: any) {
      console.error("Advisor scan error:", err);
      toast({
        variant: "destructive",
        title: "Gagal Menganalisis",
        description: err.message || "Terjadi kesalahan saat memanggil model AI.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Dismiss a recommendation
  const handleDismiss = async (recId: string) => {
    const updated = [...dismissedIds, recId];
    setDismissedIds(updated);

    if (firestore) {
      try {
        const advisorDocRef = doc(firestore, 'adminSettings', 'advisor');
        await setDoc(advisorDocRef, { dismissedIds: updated }, { merge: true });
      } catch (e) {
        console.error('Error saving dismissed recommendation:', e);
      }
    }

    toast({
      title: "Rekomendasi Ditandai Selesai",
      description: "Item ini telah disembunyikan dari daftar aktif.",
    });
  };

  // Restore a dismissed recommendation
  const handleRestore = async (recId: string) => {
    const updated = dismissedIds.filter(id => id !== recId);
    setDismissedIds(updated);

    if (firestore) {
      try {
        const advisorDocRef = doc(firestore, 'adminSettings', 'advisor');
        await setDoc(advisorDocRef, { dismissedIds: updated }, { merge: true });
      } catch (e) {
        console.error('Error restoring recommendation:', e);
      }
    }

    toast({
      title: "Rekomendasi Dipulihkan",
      description: "Item kembali aktif di daftar rekomendasi.",
    });
  };

  // Reset all dismissed
  const handleResetDismissed = async () => {
    setDismissedIds([]);
    if (firestore) {
      try {
        const advisorDocRef = doc(firestore, 'adminSettings', 'advisor');
        await setDoc(advisorDocRef, { dismissedIds: [] }, { merge: true });
      } catch (e) {
        console.error('Error resetting dismissed items:', e);
      }
    }
    toast({ title: "Seluruh Rekomendasi Dipulihkan" });
  };

  // Live updated recommendations based on current store state
  const liveRecommendations = useMemo(() => {
    const claimedSkills = Number.parseInt(stats?.techMastered || '0', 10) || 0;
    return recommendations
      .map(r => {
        if (r.id === 'tech-stack-count-mismatch') {
          // If the user already met or exceeded claimed skills, mark auto-resolved
          if (claimedSkills > 0 && techSkills.length >= claimedSkills) {
            return null;
          }
          return {
            ...r,
            title: `Lengkapi Tech Stack (${techSkills.length}/${claimedSkills} Terdaftar)`,
            description: `Klaim teknologi yang dikuasai (${claimedSkills}) lebih besar dari item yang didaftarkan (${techSkills.length}). Daftarkan skill teknis lainnya ke tab Tech Stack.`,
          };
        }
        return r;
      })
      .filter(Boolean) as RecommendationItem[];
  }, [recommendations, techSkills.length, stats?.techMastered]);

  // Filter recommendations
  const activeRecs = liveRecommendations.filter(r => !dismissedIds.includes(r.id));
  const dismissedRecs = liveRecommendations.filter(r => dismissedIds.includes(r.id));

  const listToRender = (showDismissed ? dismissedRecs : activeRecs).filter(r => {
    const matchCategory = filterCategory === 'all' || r.category === filterCategory;
    const matchPriority = selectedPriority === 'all' || r.priority === selectedPriority;
    return matchCategory && matchPriority;
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'tinggi':
        return (
          <Badge className="bg-destructive/15 text-destructive border-destructive/30 font-black text-[9px] uppercase px-2.5 py-0.5">
            <AlertCircle className="h-3 w-3 mr-1" /> Prioritas Tinggi
          </Badge>
        );
      case 'sedang':
        return (
          <Badge className="bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/30 font-black text-[9px] uppercase px-2.5 py-0.5">
            <AlertTriangle className="h-3 w-3 mr-1" /> Prioritas Sedang
          </Badge>
        );
      default:
        return (
          <Badge className="bg-primary/15 text-primary border-primary/30 font-black text-[9px] uppercase px-2.5 py-0.5">
            <Info className="h-3 w-3 mr-1" /> Rekomendasi
          </Badge>
        );
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Data Kosong': return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'SEO': return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'Konsistensi': return <ShieldCheck className="h-4 w-4 text-purple-500" />;
      case 'Peningkatan Konten': return <Zap className="h-4 w-4 text-amber-500" />;
      case 'Kredensial & Tech': return <Award className="h-4 w-4 text-emerald-500" />;
      default: return <Sparkles className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
      
      {/* ── Top Header Banner ── */}
      <Card className="rounded-[2.5rem] border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-background shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <CardContent className="p-6 sm:p-10 relative z-10 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
                <Sparkles className="h-3.5 w-3.5" />
                AI Portfolio Advisor · Gemini 2.5 Flash
              </div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-foreground">
                Audit Kualitas & Rekomendasi Portofolio
              </h2>
              <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                Asisten AI ini mengaudit seluruh basis data Firestore Anda (profil, metrik, proyek, sertifikat, karir, dan blog) untuk mendeteksi data kosong, inkonsistensi klaim, dan peluang peningkatan standar industri.
              </p>
            </div>

            <Button
              size="lg"
              onClick={handleRunAnalysis}
              disabled={isAnalyzing}
              className="h-14 px-8 rounded-2xl font-black uppercase tracking-wider bg-primary text-primary-foreground shadow-lg hover:shadow-primary/25 transition-all gap-3 shrink-0 w-full sm:w-auto"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Menganalisis Portofolio...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  <span>{healthScore !== null ? "Analisis Ulang (Scan AI)" : "Mulai Pindai Portofolio"}</span>
                </>
              )}
            </Button>
          </div>

          {/* ── Health Score & Overview ── */}
          {healthScore !== null && (
            <div className="pt-6 border-t border-border/40 grid sm:grid-cols-12 gap-6 items-center">
              <div className="sm:col-span-4 lg:col-span-3 flex items-center gap-4 bg-background/60 backdrop-blur-md p-4 rounded-2xl border border-border/50">
                <div className={cn(
                  "h-16 w-16 rounded-2xl flex items-center justify-center font-black text-2xl shrink-0 shadow-inner",
                  healthScore >= 85 ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30" :
                  healthScore >= 65 ? "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30" :
                  "bg-destructive/15 text-destructive border border-destructive/30"
                )}>
                  {healthScore}
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Skor Kesiapan</div>
                  <div className="font-bold text-sm text-foreground">
                    {healthScore >= 85 ? "Sangat Prima 🌟" : healthScore >= 65 ? "Cukup Baik 👍" : "Perlu Peningkatan ⚠️"}
                  </div>
                  <div className="text-[9px] text-muted-foreground/80">Skala 0 - 100</div>
                </div>
              </div>

              <div className="sm:col-span-8 lg:col-span-9 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-foreground">Ringkasan Evaluasi Konsultan</span>
                  {lastAnalyzed && (
                    <span className="text-[10px] text-muted-foreground font-medium">
                      Terakhir dipindai: {new Date(lastAnalyzed).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}, {new Date(lastAnalyzed).toLocaleDateString('id-ID')}
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed italic bg-background/40 p-3 rounded-xl border border-border/30">
                  &ldquo;{summary || 'Portofolio siap diaudit untuk memastikan kredibilitas maksimal di mata recruiter dan klien.'}&rdquo;
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Filter Bar & Stats ── */}
      {recommendations.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4 bg-card/60 backdrop-blur-md p-4 rounded-2xl border border-border">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mr-1 flex items-center gap-1">
              <Filter className="h-3 w-3" /> Kategori:
            </span>
            {['all', 'Data Kosong', 'SEO', 'Konsistensi', 'Peningkatan Konten', 'Kredensial & Tech'].map(cat => (
              <Button
                key={cat}
                variant={filterCategory === cat ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilterCategory(cat)}
                className="h-8 rounded-xl text-[10px] font-black uppercase px-3"
              >
                {cat === 'all' ? 'Semua Kategori' : cat}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDismissed(!showDismissed)}
              className={cn(
                "h-8 rounded-xl text-[10px] font-black uppercase px-3 gap-1.5",
                showDismissed && "bg-muted text-foreground border-primary"
              )}
            >
              {showDismissed ? <EyeOff className="h-3 w-3 text-primary" /> : <Check className="h-3 w-3 text-emerald-500" />}
              <span>{showDismissed ? `Kembali ke Aktif (${activeRecs.length})` : `Selesai / Diarsipkan (${dismissedRecs.length})`}</span>
            </Button>

            {dismissedRecs.length > 0 && showDismissed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetDismissed}
                className="h-8 rounded-xl text-[10px] font-bold text-destructive hover:bg-destructive/10 px-2.5"
              >
                <RotateCcw className="h-3 w-3 mr-1" /> Pulihkan Semua
              </Button>
            )}
          </div>
        </div>
      )}

      {/* ── Recommendations List ── */}
      {isAnalyzing ? (
        <Card className="rounded-[2.5rem] p-12 text-center space-y-4 border-dashed border-2">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <h3 className="font-black text-base uppercase tracking-wider">Sedang Mengaudit Portofolio...</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Gemini 2.5 Flash sedang membandingkan klaim pengalaman, kelengkapan bilingual, dan kualitas data teknis Anda.
          </p>
        </Card>
      ) : recommendations.length === 0 ? (
        <Card className="rounded-[2.5rem] p-12 text-center space-y-4 border-dashed border-2 bg-muted/10">
          <Sparkles className="h-12 w-12 text-primary/40 mx-auto" />
          <h3 className="font-black text-lg uppercase tracking-wider">Belum Ada Rekomendasi Aktif</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Klik tombol <strong>&ldquo;Mulai Pindai Portofolio&rdquo;</strong> di atas untuk memindai seluruh data proyek, sertifikat, dan profil Anda menggunakan AI Advisor.
          </p>
        </Card>
      ) : listToRender.length === 0 ? (
        <Card className="rounded-[2.5rem] p-10 text-center space-y-3 bg-muted/10">
          <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
          <h3 className="font-black text-sm uppercase tracking-wider">
            {showDismissed ? "Tidak Ada Item yang Ditandai Selesai" : "Semua Rekomendasi pada Kategori Ini Telah Ditangani!"}
          </h3>
          <p className="text-xs text-muted-foreground">
            {showDismissed ? "Item yang Anda selesaikan akan muncul di sini." : "Pilih kategori lain atau klik 'Analisis Ulang' untuk memperbarui status."}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {listToRender.map((rec) => (
            <Card
              key={rec.id}
              className={cn(
                "rounded-[2rem] border transition-all duration-300 hover:shadow-lg bg-card/80 backdrop-blur-sm",
                rec.priority === 'tinggi' && !showDismissed ? "border-destructive/30 hover:border-destructive/60" :
                rec.priority === 'sedang' && !showDismissed ? "border-yellow-500/30 hover:border-yellow-500/60" :
                "border-border/60 hover:border-primary/50",
                showDismissed && "opacity-60 bg-muted/20"
              )}
            >
              <CardContent className="p-5 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="space-y-2.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {getPriorityBadge(rec.priority)}
                    <Badge variant="outline" className="text-[9px] font-black uppercase tracking-wider gap-1.5 px-2.5 py-0.5 rounded-lg">
                      {getCategoryIcon(rec.category)}
                      {rec.category}
                    </Badge>
                  </div>

                  <h4 className="text-base sm:text-lg font-black text-foreground tracking-tight">
                    {rec.title}
                  </h4>

                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {rec.description}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                  {rec.actionLink && !showDismissed && (
                    <Button
                      size="sm"
                      onClick={() => onNavigateTab(rec.actionLink)}
                      className="h-10 rounded-xl px-4 font-black uppercase text-[10px] tracking-wider gap-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                    >
                      <span>Buka Tab Terkait</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  )}

                  {showDismissed ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRestore(rec.id)}
                      className="h-10 rounded-xl px-3.5 font-black uppercase text-[10px] tracking-wider gap-1.5"
                    >
                      <RotateCcw className="h-3.5 w-3.5 text-primary" />
                      <span>Buka Kembali</span>
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDismiss(rec.id)}
                      className="h-10 rounded-xl px-3.5 font-black uppercase text-[10px] tracking-wider gap-1.5 border-border hover:border-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
                      title="Tandai telah diperbaiki/selesai"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span>Tandai Selesai</span>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

    </div>
  );
}
