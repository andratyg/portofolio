"use client"

import { useEffect } from 'react';

// Report Web Vitals to console and optionally to an analytics endpoint
export function WebVitalsReporter() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const reportWebVital = (metric: { name: string; value: number; id: string; rating: string }) => {
      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        const color = metric.rating === 'good' ? '🟢' : metric.rating === 'needs-improvement' ? '🟡' : '🔴';
        console.log(`${color} ${metric.name}: ${Math.round(metric.value)}ms [${metric.rating}]`);
      }

      // Send to analytics (Firebase Analytics, Google Analytics, etc.)
      if (typeof window.gtag === 'function') {
        window.gtag('event', metric.name, {
          event_category: 'Web Vitals',
          event_label: metric.id,
          value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
          non_interaction: true,
        });
      }
    };

    // Dynamically import web-vitals to avoid bundle bloat
    // Note: onFID was removed in web-vitals v4, replaced by onINP
    import('web-vitals').then(({ onCLS, onFCP, onLCP, onTTFB, onINP }) => {
      onCLS(reportWebVital);
      onFCP(reportWebVital);
      onLCP(reportWebVital);
      onTTFB(reportWebVital);
      onINP(reportWebVital);
    }).catch(() => {
      // web-vitals not installed — silently ignore
    });
  }, []);

  return null;
}

// Extend Window for gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}
