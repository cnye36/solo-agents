/**
 * Zinc-neutral dark theme (aligned with apps/web `globals.css`).
 * No slate/blue-gray or cyan cast; violet removed in favor of zinc + white primary actions.
 */
export const colors = {
  background: "#09090b",
  surface: "#27272a",
  surfaceElevated: "#3f3f46",
  surfaceMuted: "#18181b",
  border: "rgba(161, 161, 170, 0.14)",
  borderStrong: "rgba(255, 255, 255, 0.12)",
  text: "#fafafa",
  textMuted: "#a1a1aa",
  textSoft: "#d4d4d8",
  /** Icons, subtle highlights, active thread tint (zinc-100) */
  accent: "#e4e4e7",
  accentMuted: "rgba(244, 244, 245, 0.1)",
  /** Primary filled controls (matches web white CTAs) */
  primary: "#fafafa",
  onPrimary: "#18181b",
  /** User chat bubble (zinc-600) */
  userBubble: "#52525b",
  userBubbleText: "#fafafa",
  success: "#34d399",
  warning: "#f59e0b",
  danger: "#fb7185",
} as const;

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

export const radii = {
  sm: 12,
  md: 18,
  lg: 24,
  pill: 999,
} as const;
