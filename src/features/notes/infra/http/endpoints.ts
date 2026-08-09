import { api, buildCrudEndpoints } from "@/shared/infra";

const BASE = api.resource("notes");

export const endpoints = {
  ...buildCrudEndpoints<number>(BASE),
  byEntity: () => `${BASE}/by-entity`,
  trash: () => `${BASE}/trash`,
  favorites: () => `${BASE}/favorites`,
  search: () => `${BASE}/search`,
  tags: () => `${BASE}/tags`,
  tag: (tagId: number) => `${BASE}/tags/${tagId}`,
  content: (id: number) => `${BASE}/${id}/content`,
  move: (id: number) => `${BASE}/${id}/move`,
  favorite: (id: number) => `${BASE}/${id}/favorite`,
  setTags: (id: number) => `${BASE}/${id}/tags`,
  entity: (id: number) => `${BASE}/${id}/entity`,
  restore: (id: number) => `${BASE}/${id}/restore`,
  purge: (id: number) => `${BASE}/${id}/purge`,
} as const;
