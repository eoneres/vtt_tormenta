import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes without conflicts.
 * The canonical className utility for @vtt/shared-ui.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ─── Design Tokens ────────────────────────────────────────────────────────────
// These mirror the Tailwind theme extensions in the VTT design system.

export const colors = {
  // Brand
  arcane: {
    50: '#f3f0ff',
    100: '#e9e3ff',
    500: '#7c3aed',
    600: '#6d28d9',
    700: '#5b21b6',
    900: '#3b0764',
  },
  // Semantic
  hp: {
    high: '#22c55e',
    medium: '#eab308',
    low: '#ef4444',
    empty: '#7f1d1d',
  },
  mp: {
    full: '#3b82f6',
    medium: '#60a5fa',
    low: '#93c5fd',
    empty: '#1e3a5f',
  },
  // Table
  table: {
    bg: '#0f1117',
    surface: '#1a1d2e',
    border: '#2d3148',
    hover: '#252840',
  },
} as const;

export const typography = {
  fontFamily: {
    display: "'Cinzel', serif",
    body: "'Inter', sans-serif",
    mono: "'JetBrains Mono', monospace",
    fantasy: "'MedievalSharp', serif",
  },
} as const;
