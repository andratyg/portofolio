"use client";

import React, { useEffect, useState } from 'react';
import { useTheme } from '../providers/ThemeContext';
import ImlekDecorations from './ImlekDecorations';
import RamadanDecorations from './RamadanDecorations';
import NatalDecorations from './NatalDecorations';
import CoffeeDecorations from './CoffeeDecorations';
import SunsetDecorations from './SunsetDecorations';
import LiquidGlassDecorations from './LiquidGlassDecorations';

export default function ThemeDecorations() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* Seasonal & Modern Ambient Canvases */}
      {theme === 'imlek' && <ImlekDecorations />}
      {theme === 'ramadan' && <RamadanDecorations />}
      {theme === 'natal' && <NatalDecorations />}
      {theme === 'catppuccin' && <CoffeeDecorations />}
      {theme === 'sunset' && <SunsetDecorations />}
      {theme === 'liquid' && <LiquidGlassDecorations />}
    </>
  );
}
