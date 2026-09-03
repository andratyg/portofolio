"use client";

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from '../providers/ThemeContext';
import ImlekDecorations from './ImlekDecorations';
import RamadanDecorations from './RamadanDecorations';
import NatalDecorations from './NatalDecorations';
import MinecraftDecorations from './MinecraftDecorations';
import OnePieceDecorations from './OnePieceDecorations';
import NarutoDecorations from './NarutoDecorations';

// ─── Dynamic Lazy-Loaded 3D Mascots ──────────────────────────────────────────
// Only downloaded & executed when the user activates the corresponding theme.
// Never impacts initial page load or Standard / Seasonal themes.
const MinecraftMascot = dynamic(() => import('./3d/MinecraftMascot'), {
  ssr: false,
  loading: () => null,
});

const OnePieceMascot = dynamic(() => import('./3d/OnePieceMascot'), {
  ssr: false,
  loading: () => null,
});

const NarutoMascot = dynamic(() => import('./3d/NarutoMascot'), {
  ssr: false,
  loading: () => null,
});

export default function ThemeDecorations() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* Seasonal 2D Ambient Canvases */}
      {theme === 'imlek' && <ImlekDecorations />}
      {theme === 'ramadan' && <RamadanDecorations />}
      {theme === 'natal' && <NatalDecorations />}

      {/* Anime & Gaming: 2D Canvas Atmosphere + Procedural 3D Mascot */}
      {theme === 'minecraft' && (
        <>
          <MinecraftDecorations />
          <MinecraftMascot />
        </>
      )}

      {theme === 'onepiece' && (
        <>
          <OnePieceDecorations />
          <OnePieceMascot />
        </>
      )}

      {theme === 'naruto' && (
        <>
          <NarutoDecorations />
          <NarutoMascot />
        </>
      )}
    </>
  );
}
