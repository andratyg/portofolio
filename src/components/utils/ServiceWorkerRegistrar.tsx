"use client";

import { useEffect } from 'react';

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    // Strict Admin Isolation: Never register or keep active Service Workers on /admin routes.
    // This immediately eliminates stale cache, CSS 404 MIME type errors, and React #418 hydration crashes.
    if (window.location.pathname.startsWith('/admin')) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister();
        }
      });
      if ('caches' in window) {
        caches.keys().then((keys) => {
          for (const key of keys) {
            caches.delete(key);
          }
        });
      }
      return;
    }

    // Public routes: register /sw.js and eagerly check for updates
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        reg.update().catch(() => {});
      })
      .catch(() => {});
  }, []);

  return null;
}
