export const PROFILE_COLOR_PALETTE = [
  // Paleta intermedia: mantiene suavidad pero más saturada
  '#87b0e8', /* softened blue (readable with black text) */
  '#66D4A3', /* softened mint */
  '#FFDF70', /* warm pale yellow */
  '#FF9CCF', /* soft pink */
  '#BFA8FF', /* lavender */
  '#66E0F0', /* soft cyan */
  '#FFB86B', /* soft orange/peach */
  '#7EE19A', /* soft light green */
];

export function getProfileColor(index: number): string {
  return PROFILE_COLOR_PALETTE[index % PROFILE_COLOR_PALETTE.length];
}

export function generateInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '??';
  const words = trimmed.split(/\s+/);
  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }
  return trimmed.slice(0, 2).toUpperCase();
}

export function normalizeInitials(value: string, fallbackName: string): string {
  const trimmed = value.trim();
  if (trimmed) return trimmed.slice(0, 2).toUpperCase();
  return generateInitials(fallbackName);
}

export function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '');
  const value = normalized.length === 3
    ? normalized.split('').map((part) => `${part}${part}`).join('')
    : normalized;
  const r = Number.parseInt(value.slice(0, 2), 16);
  const g = Number.parseInt(value.slice(2, 4), 16);
  const b = Number.parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
