import type { SearchConfig } from "./types";

export type SearchState<T> = Readonly<{
  query: string;
  field: keyof T & string | "all";
}>;

export function normalizeValue(
  value: string,
  config?: { normalize?: (s: string) => string }
): string {
  const fn = config?.normalize ?? ((s: string) => s.toLowerCase().trim());
  return fn(value);
}

export function filterBySearch<T>(
  items: readonly T[],
  config: SearchConfig<T>,
  state: SearchState<T>
): T[] {
  const query = normalizeValue(state.query, config);
  if (!query) return [...items];

  const fieldsToSearch =
    state.field === "all" ? config.fields.map((f) => f.key) : [state.field];

  return items.filter((item) =>
    fieldsToSearch.some((key) => {
      const raw = (item as any)[key];
      if (raw == null) return false;
      const value = normalizeValue(String(raw), config);
      return value.includes(query);
    })
  );
}
