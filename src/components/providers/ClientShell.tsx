"use client";

/**
 * ClientShell — lazy-loads heavy, client-only layout components.
 * This lives in a "use client" file so that `ssr: false` is permitted.
 * It is used inside layout.tsx (which is a Server Component).
 */

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const CustomCursor = dynamic(
  () => import('@/components/features/CustomCursor').then(m => ({ default: m.CustomCursor })),
  { ssr: false, loading: () => null }
);
const WebVitalsReporter = dynamic(
  () => import('@/components/utils/WebVitalsReporter').then(m => ({ default: m.WebVitalsReporter })),
  { ssr: false, loading: () => null }
);
const ServiceWorkerRegistrar = dynamic(
  () => import('@/components/utils/ServiceWorkerRegistrar').then(m => ({ default: m.ServiceWorkerRegistrar })),
  { ssr: false, loading: () => null }
);
const ThemeDecorations = dynamic(
  () => import('@/components/themes/ThemeDecorations'),
  { ssr: false, loading: () => null }
);
const CommandPalette = dynamic(
  () => import('@/components/features/CommandPalette').then(m => ({ default: m.CommandPalette })),
  { ssr: false, loading: () => null }
);
const DynamicIslandNotification = dynamic(
  () => import('@/components/features/DynamicIslandNotification').then(m => ({ default: m.DynamicIslandNotification })),
  { ssr: false, loading: () => null }
);
const DeveloperTerminal = dynamic(
  () => import('@/components/features/DeveloperTerminal').then(m => ({ default: m.DeveloperTerminal })),
  { ssr: false, loading: () => null }
);

export function ClientShell() {
  const [isIdle, setIsIdle] = useState(false);

  useEffect(() => {
    // Auto-reload once if an outdated deployment chunk, stylesheet, or hydration mismatch fails with 404
    const handleChunkError = (event: ErrorEvent | PromiseRejectionEvent) => {
      const error = 'reason' in event ? event.reason : event.error;
      const message = error?.message || (event as ErrorEvent).message || '';
      const isChunkOrCssError =
        message.includes('Loading chunk') ||
        message.includes('ChunkLoadError') ||
        message.includes('Failed to fetch dynamically imported module') ||
        message.includes('Refused to apply style') ||
        message.includes('Minified React error #418') ||
        message.includes('Minified React error #423') ||
        message.includes('Hydration failed');

      if (isChunkOrCssError) {
        try {
          if ('caches' in window) {
            caches.keys().then((keys) => {
              keys.forEach((k) => caches.delete(k));
            });
          }
          const lastReload = sessionStorage.getItem('chunk_error_reload');
          const now = Date.now();
          if (!lastReload || now - Number(lastReload) > 12000) {
            sessionStorage.setItem('chunk_error_reload', String(now));
            window.location.reload();
          }
        } catch (e) {
          window.location.reload();
        }
      }
    };

    window.addEventListener('error', handleChunkError, true);
    window.addEventListener('unhandledrejection', handleChunkError);

    if ('requestIdleCallback' in window) {
      const handle = (window as any).requestIdleCallback(() => setIsIdle(true), { timeout: 3000 });
      return () => {
        window.removeEventListener('error', handleChunkError, true);
        window.removeEventListener('unhandledrejection', handleChunkError);
        (window as any).cancelIdleCallback?.(handle);
      };
    } else {
      const timer = setTimeout(() => setIsIdle(true), 1500);
      return () => {
        window.removeEventListener('error', handleChunkError, true);
        window.removeEventListener('unhandledrejection', handleChunkError);
        clearTimeout(timer);
      };
    }
  }, []);

  return (
    <>
      <ThemeDecorations />
      <DynamicIslandNotification />
      <CustomCursor />
      <CommandPalette />
      <DeveloperTerminal />
      {isIdle && (
        <>
          <WebVitalsReporter />
          <ServiceWorkerRegistrar />
        </>
      )}
    </>
  );
}
