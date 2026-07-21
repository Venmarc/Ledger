/** Shared motion helpers — Rules on UI Polish. */

export const EASE = {
  smooth: 'cubic-bezier(0.22, 1, 0.36, 1)',
  out: 'cubic-bezier(0.17, 1, 0.32, 1)',
  spring: 'cubic-bezier(0.35, 1.55, 0.65, 1)',
  inOut: 'cubic-bezier(0.66, 0, 0.34, 1)',
} as const

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
