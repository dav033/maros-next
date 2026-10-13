import { createEntityKeys } from "@/shared/query";

const entityKeys = createEntityKeys("projects");

export const projectsKeys = {
  ...entityKeys,
  financials: () => [...entityKeys.all, "financials"] as const,
};
