export type Phase = 'dawn' | 'midday' | 'afternoon' | 'night';
export const PHASES: Phase[] = ['dawn', 'midday', 'afternoon', 'night'];
export const PALETTES: Record<Phase, { hero: string; ink: string; label: string; bg: string }> = {
  dawn: { hero: '#3868F2', ink: '#7AA2FF', label: '#B6CDFF', bg: '#0A0A12' },
  midday: { hero: '#0A6CFF', ink: '#4FA3FF', label: '#A3D1FF', bg: '#04070B' },
  afternoon: { hero: '#0F4C81', ink: '#5AA9E6', label: '#A8D5F5', bg: '#05080B' },
  night: { hero: '#0D2A7A', ink: '#4D74D9', label: '#8EABF0', bg: '#05060A' },
};
export const GRAY = '#7A7F90';

function lum(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two #RRGGBB colors. */
export function contrast(a: string, b: string): number {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
