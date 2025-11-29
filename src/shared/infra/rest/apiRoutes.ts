export const API_BASE = "";

function clean(segment: string | number): string {
  return String(segment).replace(/^\/+|\/+$/g, "");
}

export const api = {
  base: API_BASE,
  resource: (name: string) => `/${clean(name)}`,
  path: (...segments: Array<string | number>) => `/${segments.map(clean).join("/")}`,
} as const;
