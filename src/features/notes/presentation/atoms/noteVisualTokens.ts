// Colores desde tokens CSS compartidos (--badge-*), no hex crudo: ver globals.css.
export const NOTE_TAG_COLORS: Record<string, string> = {
  neutral: "hsl(var(--badge-neutral))",
  blue: "hsl(var(--badge-blue))",
  indigo: "hsl(var(--badge-indigo))",
  amber: "hsl(var(--badge-amber))",
  orange: "hsl(var(--badge-orange))",
  green: "hsl(var(--badge-green))",
  violet: "hsl(var(--badge-violet))",
  red: "hsl(var(--badge-red))",
};

export const NOTE_TAG_COLOR_KEYS = Object.keys(NOTE_TAG_COLORS);

export function noteTagColor(color: string): string {
  return NOTE_TAG_COLORS[color] ?? NOTE_TAG_COLORS.neutral;
}
