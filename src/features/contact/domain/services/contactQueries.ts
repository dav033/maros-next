import type { Contact } from "../models";
import { normalizeLower } from "@/shared";

export function searchByName(
  q: string,
  src?: readonly Contact[] | null
): Contact[] {
  const list = Array.isArray(src) ? src : [];
  const needle = normalizeLower(q);
  if (!needle) return list.slice(0);
  return list.filter((c) => {
    const n = normalizeLower(c.name);
    return n.includes(needle);
  });
}
