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

  // Sharing. `sharedWithMe` and `allLinks` are static segments under /notes, so the
  // backend declares them before its ':id' routes — see NotesController.
  sharedWithMe: () => `${BASE}/shared-with-me`,
  allLinks: () => `${BASE}/links`,
  access: (id: number) => `${BASE}/${id}/access`,
  visibility: (id: number) => `${BASE}/${id}/visibility`,
  shares: (id: number) => `${BASE}/${id}/shares`,
  share: (id: number, shareId: number) => `${BASE}/${id}/shares/${shareId}`,
  links: (id: number) => `${BASE}/${id}/links`,
  link: (id: number, linkId: number) => `${BASE}/${id}/links/${linkId}`,
  rotateLink: (id: number, linkId: number) => `${BASE}/${id}/links/${linkId}/rotate`,
  linkViews: (id: number, linkId: number) => `${BASE}/${id}/links/${linkId}/views`,

  /** Colleagues for the people picker — see UsersController.findUserDirectory. */
  userDirectory: () => api.resource("users/directory"),
} as const;
