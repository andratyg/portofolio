"use client";

import React, { useEffect, useState } from 'react';
import { useTheme } from '../ThemeContext';
import ImlekDecorations from './ImlekDecorations';
import RamadanDecorations from './RamadanDecorations';
import NatalDecorations from './NatalDecorations';

export default function ThemeDecorations() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {theme === 'imlek' && <ImlekDecorations />}
      {theme === 'ramadan' && <RamadanDecorations />}
      {theme === 'natal' && <NatalDecorations />}
    </>
  );
}
