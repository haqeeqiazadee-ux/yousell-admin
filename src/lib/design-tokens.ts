/**
 * YOUSELL Design Tokens — TypeScript Constants
 * Section 2.1 (Colors), 2.3 (Motion), 9 (Breakpoints)
 */

// ── Brand Palette ──
export const COLORS = {
  brand: {
    900: '#0A0E1A',
    800: '#0F1629',
    700: '#141D36',
    600: '#1E2D52',
    500: '#2E4580',
    400: '#3D5FA8',
    300: '#5B7ECC',
    200: '#A3B8E8',
    100: '#D4DFFB',
    '050': '#EEF2FF',
  },
  semantic: {
    success: '#10B981',
    successDim: '#065F46',
    warning: '#F59E0B',
    warningDim: '#78350F',
    danger: '#EF4444',
    dangerDim: '#7F1D1D',
    neutral: '#6B7280',
  },
  ai: {
    glow: '#6366F1',
    pulse: '#818CF8',
    insight: '#A78BFA',
  },
  chart: [
    '#3B82F6', // blue
    '#10B981', // emerald
    '#F59E0B', // amber
    '#8B5CF6', // violet
    '#EC4899', // pink
    '#14B8A6', // teal
    '#F97316', // orange
    '#6B7280', // grey
  ],
} as const;

// ── Motion System (Section 2.3) ──
export const MOTION = {
  ease: {
    out: [0.0, 0.0, 0.2, 1.0] as const,
    spring: { damping: 25, stiffness: 300 },
    bounce: { damping: 15, stiffness: 200 },
  },
  duration: {
    instant: 0.08,
    fast: 0.15,
    base: 0.25,
    slow: 0.4,
    reveal: 0.6,
  },
  stagger: {
    children: 0.05,
    delay: 0.1,
  },
  // Standard animation presets
  cardEntrance: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.25, ease: [0.0, 0.0, 0.2, 1.0] },
  },
  streamingText: {
    charDelay: 0.03, // 30ms per character
  },
  pageTransition: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12 },
    transition: { duration: 0.25, ease: [0.0, 0.0, 0.2, 1.0] },
  },
  hover: {
    scale: 1.01,
    transition: { duration: 0.15 },
  },
  active: {
    scale: 0.99,
    transition: { duration: 0.08 },
  },
} as const;

// ── Breakpoints (Section 9) ──
export const BREAKPOINTS = {
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
  '3xl': 1920,
} as const;

// ── Layout Dimensions (Section 3) ──
export const LAYOUT = {
  topbarHeight: 48,
  sidebarWidth: 240,
  sidebarCollapsed: 56,
  aiRailWidth: 320,
  navbarHeight: 72,
  mainMaxWidth: 1536, // max-w-screen-2xl
  mainPaddingX: 24, // px-6
} as const;

// ── AI Score Badge Thresholds (Section 4.2) ──
export const AI_SCORE_BADGES = {
  hot: { min: 90, label: 'Hot', color: 'emerald' },
  rising: { min: 70, label: 'Rising', color: 'blue' },
  stable: { min: 50, label: 'Stable', color: 'amber' },
  cooling: { min: 0, label: 'Cooling', color: 'grey' },
} as const;

// ── Confidence Indicator Thresholds (Section 6.1) ──
export const CONFIDENCE = {
  high: { min: 85, color: 'green' },
  medium: { min: 60, color: 'amber' },
  low: { min: 0, color: 'none' },
} as const;

// ── Polling Intervals (Section 16) ──
export const POLLING = {
  engineStatus: 5000,
  engineStatusStale: 2000,
  productData: 60000,
  aiInsights: 0, // never cache
} as const;

// ── Typography Scale ──
export const TYPOGRAPHY = {
  xs: { size: 11, lineHeight: 16 },
  sm: { size: 13, lineHeight: 20 },
  base: { size: 15, lineHeight: 24 },
  lg: { size: 17, lineHeight: 26 },
  xl: { size: 20, lineHeight: 30 },
  '2xl': { size: 24, lineHeight: 32 },
  '3xl': { size: 30, lineHeight: 38 },
  '4xl': { size: 36, lineHeight: 44 },
  '5xl': { size: 48, lineHeight: 56 },
  '7xl': { size: 72, lineHeight: 80 },
} as const;

// ── Spacing Grid (8pt) ──
export const SPACING = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;
