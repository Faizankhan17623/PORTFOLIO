// Kept free of heavy imports so the main bundle can use it without pulling in three.js.
export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
