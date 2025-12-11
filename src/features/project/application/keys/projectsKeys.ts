export const projectsKeys = {
  all: ["projects"] as const,
  detail: (id: number) => [...projectsKeys.all, "detail", id] as const,
  list: () => [...projectsKeys.all, "list"] as const,
} as const;



