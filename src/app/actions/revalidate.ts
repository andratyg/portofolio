'use server';

import { revalidatePath } from 'next/cache';

/**
 * Revalidasi on-demand untuk rute portofolio.
 * Menghapus cache ISR seketika setelah terjadi pembaruan data di dashboard admin.
 *
 * @param path - Jalur halaman yang ingin direvalidasi (default: '/')
 */
export async function revalidatePortfolio(path: string = '/') {
  try {
    revalidatePath(path);
    return { success: true };
  } catch (error) {
    console.error('[revalidatePortfolio] Failed to revalidate path:', path, error);
    return { success: false, error: String(error) };
  }
}
