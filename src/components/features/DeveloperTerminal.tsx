"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { m as motion, AnimatePresence } from 'framer-motion';
import { Terminal as TerminalIcon, X, Minus, Square, CornerDownLeft, Sparkles } from 'lucide-react';
import { useTheme, themes, THEME_CONFIGS, Theme } from '@/components/providers/ThemeContext';
import { useLanguage } from '@/components/providers/LanguageContext';
import { useAudioFX } from '@/components/providers/AudioFXContext';
import { useProjectStore } from '@/stores/ProjectStore';
import { notifyDynamicIsland } from '@/components/features/DynamicIslandNotification';

interface OutputLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'success' | 'info';
  text?: string;
  component?: React.ReactNode;
}

const ASCII_BANNER = `
 ███╗   ██╗ █████╗ ██████╗  █████╗ 
 ████╗  ██║██╔══██╗██╔══██╗██╔══██╗
 ██╔██╗ ██║███████║██████╔╝███████║
 ██║╚██╗██║██╔══██║██╔══██╗██╔══██║
 ██║ ╚████║██║  ██║██║  ██║██║  ██║
`;

const COMMAND_LIST = [
  { cmd: 'help', desc: 'Tampilkan daftar seluruh perintah yang tersedia' },
  { cmd: 'whoami', desc: 'Informasi biodata & profil Nara Andra Tyaga' },
  { cmd: 'skills', desc: 'Daftar keahlian teknis (Frontend, Backend, Tools)' },
  { cmd: 'projects', desc: 'Lihat daftar portofolio proyek unggulan' },
  { cmd: 'contact', desc: 'Hubungi via WhatsApp, Email, & Sosial Media' },
  { cmd: 'cv', desc: 'Unduh / Buka dokumen CV & Resume' },
  { cmd: 'theme', desc: 'Lihat atau ganti tema [dark|light|liquid|sunset|...]' },
  { cmd: 'sound', desc: 'Nyalakan atau matikan sound FX [on|off]' },
  { cmd: 'matrix', desc: 'Efek visual rahasia Matrix Digital Rain' },
  { cmd: 'sudo hire', desc: 'Easter egg spesial untuk tech recruiters & clients' },
  { cmd: 'clear', desc: 'Bersihkan riwayat layar terminal' },
  { cmd: 'exit', desc: 'Tutup jendela terminal' },
];

export function DeveloperTerminal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<OutputLine[]>([]);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [showMatrix, setShowMatrix] = useState(false);

  const { theme, setTheme } = useTheme();
  const { language } = useLanguage();
  const { soundEnabled, toggleSound, play } = useAudioFX();
  const store = useProjectStore();

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize banner on first open
  useEffect(() => {
    if (history.length === 0) {
      setHistory([
        {
          id: 'banner',
          type: 'info',
          component: (
            <div className="space-y-1 mb-2 select-none">
              <pre className="text-emerald-400 font-mono text-[10px] sm:text-xs leading-none font-bold">
                {ASCII_BANNER}
              </pre>
              <p className="text-emerald-300 font-bold text-xs">
                Nara Andra Tyaga — Interactive Developer Terminal v2.5.0
              </p>
              <p className="text-slate-400 text-xs">
                Ketik <span className="text-yellow-300 font-bold">help</span> untuk melihat perintah yang tersedia, atau <span className="text-cyan-300 font-bold">skills</span> / <span className="text-cyan-300 font-bold">projects</span>.
              </p>
            </div>
          ),
        },
      ]);
    }
  }, [history.length]);

  // Global shortcut: toggle terminal with backtick ` (tilde ~)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in regular forms
      const target = e.target as HTMLElement;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

      if (e.key === '`' && !isInput) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        setIsMinimized(false);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    const handleCustomOpen = () => {
      setIsOpen(true);
      setIsMinimized(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-dev-terminal', handleCustomOpen);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-dev-terminal', handleCustomOpen);
    };
  }, [isOpen]);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, isMinimized, history]);

  // Matrix Rain canvas effect
  useEffect(() => {
    if (!showMatrix) return;
    const timer = setTimeout(() => setShowMatrix(false), 7000);
    return () => clearTimeout(timer);
  }, [showMatrix]);

  const executeCommand = useCallback((cmdRaw: string) => {
    const trimmed = cmdRaw.trim();
    if (!trimmed) return;

    play('tab');
    const parts = trimmed.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    // Record command history
    setCmdHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);

    const newEntries: OutputLine[] = [
      {
        id: `in-${Date.now()}`,
        type: 'input',
        text: trimmed,
      },
    ];

    switch (cmd) {
      case 'help':
      case '?':
        newEntries.push({
          id: `out-${Date.now()}`,
          type: 'info',
          component: (
            <div className="space-y-1.5 my-1">
              <p className="text-yellow-300 font-bold">Perintah yang Tersedia:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs">
                {COMMAND_LIST.map((c) => (
                  <div key={c.cmd} className="flex items-baseline gap-2">
                    <span className="text-emerald-400 font-bold shrink-0 w-24">
                      {c.cmd}
                    </span>
                    <span className="text-slate-400 text-[11px] truncate">
                      {c.desc}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-slate-500 text-[11px] mt-1 italic">
                Tips: Tekan tombol Panah Atas/Bawah (↑ / ↓) untuk riwayat perintah, atau Tab untuk auto-complete.
              </p>
            </div>
          ),
        });
        break;

      case 'whoami':
      case 'about':
        newEntries.push({
          id: `out-${Date.now()}`,
          type: 'output',
          component: (
            <div className="space-y-1.5 p-2 rounded bg-emerald-950/20 border border-emerald-500/20 my-1 text-xs text-slate-300">
              <p className="text-emerald-400 font-bold text-sm">Nara Andra Tyaga</p>
              <p className="text-slate-300">
                Web Developer & Tech Enthusiast dari SMK Wikrama Bogor.
              </p>
              <p className="text-slate-400 text-[11px]">
                Fokus membangun antarmuka web modern dengan performa tinggi, animasi fluida, arsitektur full-stack tangguh (Next.js, Laravel, Tailwind CSS), dan solusi digital berdampak.
              </p>
              <div className="flex gap-4 pt-1 text-[11px]">
                <span>📍 Bogor, Jawa Barat, Indonesia</span>
                <span>💼 Terbuka untuk Magang & Kolaborasi</span>
              </div>
            </div>
          ),
        });
        break;

      case 'skills':
      case 'tech':
        newEntries.push({
          id: `out-${Date.now()}`,
          type: 'output',
          component: (
            <div className="space-y-2 my-1 text-xs">
              <p className="text-cyan-300 font-bold">Teknologi & Keahlian:</p>
              <div className="space-y-1.5">
                <div>
                  <div className="flex justify-between text-slate-300 text-[11px]">
                    <span>Frontend: React, Next.js, TypeScript, Tailwind</span>
                    <span className="text-emerald-400">[██████████] 95%</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-slate-300 text-[11px]">
                    <span>Backend: Laravel, Node.js, Express, REST API</span>
                    <span className="text-emerald-400">[████████░░] 85%</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-slate-300 text-[11px]">
                    <span>Database: MySQL, PostgreSQL, Firebase / Firestore</span>
                    <span className="text-emerald-400">[████████░░] 80%</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-slate-300 text-[11px]">
                    <span>Tools & DevOps: Git, GitHub, Vercel, Figma, Docker</span>
                    <span className="text-emerald-400">[█████████░] 90%</span>
                  </div>
                </div>
              </div>
            </div>
          ),
        });
        break;

      case 'projects':
        const projects = store?.projects || [];
        newEntries.push({
          id: `out-${Date.now()}`,
          type: 'output',
          component: (
            <div className="space-y-2 my-1 text-xs">
              <p className="text-emerald-300 font-bold">Koleksi Proyek Portofolio ({projects.length}):</p>
              <div className="space-y-1">
                {projects.slice(0, 6).map((p, idx) => (
                  <div key={p.id || idx} className="flex items-center justify-between p-1 rounded hover:bg-white/5">
                    <span className="text-slate-200 font-semibold">{p.titleId || p.titleEn}</span>
                    <div className="flex gap-2 text-[11px]">
                      {p.demoUrl && (
                        <a href={p.demoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                          [Live Demo]
                        </a>
                      )}
                      {p.githubUrl && (
                        <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:underline">
                          [GitHub]
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-slate-500 text-[11px]">
                Ketik <span className="text-cyan-400 font-mono">/projects</span> di browser untuk melihat detail lengkap.
              </p>
            </div>
          ),
        });
        break;

      case 'contact':
        newEntries.push({
          id: `out-${Date.now()}`,
          type: 'output',
          component: (
            <div className="space-y-1 my-1 text-xs">
              <p className="text-emerald-300 font-bold">Kontak Langsung:</p>
              <p className="text-slate-300">WhatsApp: <a href="https://wa.me/6285692994469" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline">+62 856-9299-4469</a></p>
              <p className="text-slate-300">GitHub: <a href="https://github.com/andratyg" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">github.com/andratyg</a></p>
              <p className="text-slate-300">LinkedIn: <a href="https://linkedin.com/in/nara-andra-tyaga" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">linkedin.com/in/nara-andra-tyaga</a></p>
            </div>
          ),
        });
        break;

      case 'cv':
      case 'resume':
        const cvUrl = store?.profile?.cvUrl;
        if (cvUrl) {
          window.open(cvUrl, '_blank');
          notifyDynamicIsland({
            title: "Mengunduh CV...",
            subtitle: "Membuka dokumen CV resmi",
            icon: "download",
          });
          newEntries.push({
            id: `out-${Date.now()}`,
            type: 'success',
            text: '✓ Membuka dokumen CV & Resume di tab baru.',
          });
        } else {
          newEntries.push({
            id: `out-${Date.now()}`,
            type: 'error',
            text: 'Tautan CV belum diatur di profil.',
          });
        }
        break;

      case 'theme':
        if (args.length === 0) {
          newEntries.push({
            id: `out-${Date.now()}`,
            type: 'info',
            text: `Tema aktif: ${theme}. Tema tersedia: ${themes.join(', ')}. Contoh penggunaan: theme liquid`,
          });
        } else {
          const targetTheme = args[0].toLowerCase() as Theme;
          if (themes.includes(targetTheme)) {
            setTheme(targetTheme, true);
            notifyDynamicIsland({
              title: `Tema: ${THEME_CONFIGS[targetTheme]?.name.id || targetTheme}`,
              subtitle: "Tema tampilan berhasil diganti",
              icon: "theme",
              emoji: THEME_CONFIGS[targetTheme]?.emoji,
            });
            newEntries.push({
              id: `out-${Date.now()}`,
              type: 'success',
              text: `✓ Tema berhasil diubah ke: ${targetTheme}`,
            });
          } else {
            newEntries.push({
              id: `out-${Date.now()}`,
              type: 'error',
              text: `Tema "${args[0]}" tidak ditemukan. Pilihan: ${themes.join(', ')}`,
            });
          }
        }
        break;

      case 'sound':
        if (args[0] === 'on') {
          if (!soundEnabled) toggleSound();
          play('success');
          notifyDynamicIsland({
            title: "Audio FX: Aktif",
            subtitle: "Efek suara UI dinyalakan",
            icon: "sound-on",
          });
          newEntries.push({ id: `out-${Date.now()}`, type: 'success', text: '✓ Audio FX diaktifkan.' });
        } else if (args[0] === 'off') {
          if (soundEnabled) toggleSound();
          notifyDynamicIsland({
            title: "Audio FX: Mode Hening",
            subtitle: "Efek suara UI dimatikan",
            icon: "sound-off",
          });
          newEntries.push({ id: `out-${Date.now()}`, type: 'info', text: '✓ Audio FX dinonaktifkan.' });
        } else {
          toggleSound();
          newEntries.push({
            id: `out-${Date.now()}`,
            type: 'info',
            text: `Audio FX sekarang: ${!soundEnabled ? 'Aktif' : 'Nonaktif'}.`,
          });
        }
        break;

      case 'matrix':
        setShowMatrix(true);
        newEntries.push({
          id: `out-${Date.now()}`,
          type: 'success',
          text: 'Wake up, Neo... The Matrix has you. 🐇 (Digital rain aktif 7s)',
        });
        break;

      case 'sudo':
        if (args.join(' ').toLowerCase() === 'hire' || args.join(' ').toLowerCase() === 'hire-me') {
          play('success');
          notifyDynamicIsland({
            title: "Hiring Offer Accepted! 🚀",
            subtitle: "Menghubungkan ke WhatsApp Nara...",
            icon: "sparkles",
          });
          newEntries.push({
            id: `out-${Date.now()}`,
            type: 'success',
            component: (
              <div className="space-y-1.5 p-3 rounded bg-emerald-950/40 border border-emerald-400/40 text-xs">
                <p className="text-emerald-300 font-bold text-sm">🎉 Sudo Access Granted: HIRE INITIATIVE!</p>
                <p className="text-slate-200">
                  Terima kasih atas ketertarikan Anda untuk bekerja sama dengan Nara Andra Tyaga!
                </p>
                <p className="text-cyan-300 text-[11px]">
                  [✓] Status: Siap berkolaborasi & berkontribusi penuh.
                  <br />
                  [✓] Mengalihkan ke obrolan WhatsApp untuk diskusi lebih lanjut...
                </p>
                <a
                  href="https://wa.me/6285692994469?text=Halo%20Nara,%20saya%20tertarik%20dengan%20portofolio%20Anda%20dan%20ingin%20berdiskusi%20tentang%20peluang%20kerja%20sama!"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-xs"
                >
                  Buka WhatsApp Sekarang →
                </a>
              </div>
            ),
          });
        } else {
          newEntries.push({
            id: `out-${Date.now()}`,
            type: 'error',
            text: `Perintah sudo "${args.join(' ')}" tidak dikenali. Coba: sudo hire`,
          });
        }
        break;

      case 'clear':
      case 'cls':
        setHistory([]);
        return;

      case 'exit':
        setIsOpen(false);
        return;

      default:
        newEntries.push({
          id: `err-${Date.now()}`,
          type: 'error',
          text: `zsh: command not found: ${cmd}. Ketik 'help' untuk daftar perintah.`,
        });
        break;
    }

    setHistory((prev) => [...prev, ...newEntries]);
  }, [play, soundEnabled, store, theme, setTheme, toggleSound]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(inputVal);
      setInputVal('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const nextIdx = historyIndex === -1 ? cmdHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIdx);
      setInputVal(cmdHistory[nextIdx]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      const nextIdx = historyIndex + 1;
      if (nextIdx >= cmdHistory.length) {
        setHistoryIndex(-1);
        setInputVal('');
      } else {
        setHistoryIndex(nextIdx);
        setInputVal(cmdHistory[nextIdx]);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const current = inputVal.toLowerCase().trim();
      if (!current) return;
      const match = COMMAND_LIST.find((c) => c.cmd.startsWith(current));
      if (match) {
        setInputVal(match.cmd);
      }
    }
  };

  return (
    <>
      {/* Matrix Rain Canvas when 'matrix' command is fired */}
      {showMatrix && (
        <canvas
          ref={(c) => {
            if (!c) return;
            const ctx = c.getContext('2d');
            if (!ctx) return;
            c.width = window.innerWidth;
            c.height = window.innerHeight;
            const chars = '0123456789ABCDEFﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂ';
            const fontSize = 14;
            const cols = Math.floor(c.width / fontSize);
            const drops = Array(cols).fill(1);
            const draw = () => {
              ctx.fillStyle = 'rgba(0,0,0,0.06)';
              ctx.fillRect(0, 0, c.width, c.height);
              ctx.fillStyle = '#10b981';
              ctx.font = `${fontSize}px monospace`;
              for (let i = 0; i < drops.length; i++) {
                const text = chars[Math.floor(Math.random() * chars.length)];
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                if (drops[i] * fontSize > c.height && Math.random() > 0.975) drops[i] = 0;
                drops[i]++;
              }
            };
            const id = setInterval(draw, 33);
            return () => clearInterval(id);
          }}
          className="fixed inset-0 z-[120] pointer-events-none"
        />
      )}

      {/* Minimized Floating Badge */}
      {isOpen && isMinimized && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setIsMinimized(false)}
          className="fixed bottom-6 left-6 z-[95] flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/90 text-emerald-400 border border-emerald-500/40 shadow-xl backdrop-blur-md text-xs font-mono font-bold hover:bg-slate-900 transition-all cursor-pointer"
        >
          <TerminalIcon className="h-4 w-4 text-emerald-400" />
          <span>nara@portfolio:~ $</span>
        </motion.button>
      )}

      {/* Main Terminal Window Modal */}
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <div className="fixed inset-0 z-[95] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 10 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className={`
                relative flex flex-col rounded-2xl overflow-hidden
                bg-[#0d1117]/95 backdrop-blur-2xl border border-emerald-500/30
                shadow-[0_25px_80px_rgba(0,0,0,0.8),0_0_30px_rgba(16,185,129,0.15)]
                ${isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-3xl h-[520px] max-h-[85vh]'}
              `}
            >
              {/* Terminal Window Header (macOS Traffic Lights) */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#161b22]/90 border-b border-emerald-500/20 select-none shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="w-3 h-3 rounded-full bg-rose-500 hover:bg-rose-600 transition-colors flex items-center justify-center group"
                    title="Close Terminal"
                  >
                    <X className="w-2 h-2 text-rose-950 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsMinimized(true)}
                    className="w-3 h-3 rounded-full bg-amber-500 hover:bg-amber-600 transition-colors flex items-center justify-center group"
                    title="Minimize"
                  >
                    <Minus className="w-2 h-2 text-amber-950 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="w-3 h-3 rounded-full bg-emerald-500 hover:bg-emerald-600 transition-colors flex items-center justify-center group"
                    title="Toggle Fullscreen"
                  >
                    <Square className="w-1.5 h-1.5 text-emerald-950 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
                  <TerminalIcon className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="font-semibold text-slate-300">nara@portfolio:~</span>
                  <span className="hidden sm:inline text-slate-500">(zsh)</span>
                </div>

                <div className="text-[10px] font-mono text-slate-500 hidden sm:block">
                  press <kbd className="px-1 py-0.5 rounded bg-white/10 text-slate-300">`</kbd> or <kbd className="px-1 py-0.5 rounded bg-white/10 text-slate-300">esc</kbd> to exit
                </div>
              </div>

              {/* Terminal Screen & History Content */}
              <div
                className="flex-1 overflow-y-auto p-4 font-mono text-xs sm:text-[13px] space-y-2 select-text"
                onClick={() => inputRef.current?.focus()}
              >
                {history.map((h) => (
                  <div key={h.id}>
                    {h.type === 'input' ? (
                      <div className="flex items-center gap-2 text-slate-200">
                        <span className="text-emerald-400 font-bold shrink-0">➜</span>
                        <span className="text-cyan-400 font-semibold shrink-0">~</span>
                        <span className="text-slate-100">{h.text}</span>
                      </div>
                    ) : h.type === 'error' ? (
                      <p className="text-rose-400 pl-4">{h.text}</p>
                    ) : h.type === 'success' ? (
                      <div className="text-emerald-400 pl-4">{h.component || h.text}</div>
                    ) : (
                      <div className="pl-4">{h.component || <p className="text-slate-300">{h.text}</p>}</div>
                    )}
                  </div>
                ))}

                {/* Prompt Line */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-emerald-400 font-bold shrink-0">➜</span>
                  <span className="text-cyan-400 font-semibold shrink-0">~</span>
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-transparent text-emerald-300 font-mono text-xs sm:text-[13px] outline-none border-none p-0 focus:ring-0"
                    placeholder="Ketik 'help' untuk daftar perintah..."
                    autoFocus
                    spellCheck={false}
                    autoComplete="off"
                  />
                  <CornerDownLeft className="h-3 w-3 text-slate-600 shrink-0 opacity-60" />
                </div>
                <div ref={terminalEndRef} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
