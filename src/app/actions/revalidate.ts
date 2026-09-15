'use server';

import { revalidatePath } from 'next/cache';

/**
 * Revalidasi on-demand untuk rute portofolio.
 * Menghapus cache ISR seketika setelah terjadi pembaruan data di dashboard admin.
 *
 * @param path - Jalur halaman yang ingin direvalidasi (default: '/')
 */
const ALLOWED_STATIC_PATHS = new Set([
  '/',
  'all',
  '/about',
  '/projects',
  '/certificates',
  '/experience',
  '/blog',
  '/contact',
  '/api/public-data',
]);

export async function revalidatePortfolio(path: string = '/') {
  try {
    const cleanPath = typeof path === 'string' ? path.trim() : '/';
    
    // SSDLC Security Check: Whitelist validated paths to prevent arbitrary cache purge abuse
    const isAllowed = 
      ALLOWED_STATIC_PATHS.has(cleanPath) || 
      /^\/blog\/[a-zA-Z0-9_-]+$/.test(cleanPath) || 
      /^\/projects\/[a-zA-Z0-9_-]+$/.test(cleanPath);

    if (!isAllowed) {
      return { success: false, error: 'Unauthorized or invalid revalidation path' };
    }

    if (cleanPath === '/' || cleanPath === 'all') {
      revalidatePath('/');
      revalidatePath('/about');
      revalidatePath('/projects');
      revalidatePath('/certificates');
      revalidatePath('/experience');
      revalidatePath('/blog');
      revalidatePath('/contact');
      revalidatePath('/api/public-data');
    } else {
      revalidatePath(cleanPath);
    }
    return { success: true };
  } catch (error) {
    console.error('[revalidatePortfolio] Failed to revalidate path:', path, error);
    return { success: false, error: String(error) };
  }
}
