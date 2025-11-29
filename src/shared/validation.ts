export function normalizeText(input: unknown): string {
  return String(input ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeLower(input: unknown): string {
  return normalizeText(input).toLowerCase();
}

export function normalizeEmail(e?: string): string | undefined {
  if (!e) return undefined;
  const v = normalizeLower(e);
  return v || undefined;
}

export function normalizePhone(p?: string): string | undefined {
  if (!p) return undefined;
  const trimmed = String(p).trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith("+")) {
    const rest = trimmed.slice(1).replace(/\D+/g, "");
    return rest ? `+${rest}` : undefined;
  }
  const digits = trimmed.replace(/\D+/g, "");
  return digits || undefined;
}

export function isValidEmail(email?: string): boolean {
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function countDigits(s?: string): number {
  if (!s) return 0;
  return s.replace(/\D+/g, "").length;
}

export function isISODateOrDateTime(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})?)?$/.test(s);
}

export function isIsoLocalDate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

export function coerceIsoLocalDate(input: unknown, fallback?: string): string {
  const raw = normalizeText(input);
  if (raw && isIsoLocalDate(raw)) return raw;
  if (raw && /^\d{4}-\d{2}-\d{2}T/.test(raw)) return raw.slice(0, 10);
  if (raw) {
    const d = new Date(raw);
    if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  }
  if (fallback && isIsoLocalDate(fallback)) return fallback;
  return new Date().toISOString().slice(0, 10);
}
