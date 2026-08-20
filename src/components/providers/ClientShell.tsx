"use client";

/**
 * ClientShell — lazy-loads heavy, client-only layout components.
 * This lives in a "use client" file so that `ssr: false` is permitted.
 * It is used inside layout.tsx (which is a Server Component).
 */

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

export function ClientShell() {
  return (
    <>
      <ThemeDecorations />
      <CustomCursor />
      <WebVitalsReporter />
      <ServiceWorkerRegistrar />
    </>
  );
}
