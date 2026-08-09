"use client";

import { useQuery } from "@tanstack/react-query";
import { optimizedApiClient } from "@/shared/infra";

export type NoteLinkableRecord = {
  id: number;
  name: string;
  leadNumber: string | null;
};

type LinkableRecords = {
  leads: NoteLinkableRecord[];
  projects: NoteLinkableRecord[];
};

/**
 * Record labels for notes. These endpoints deliberately avoid QuickBooks so the
 * picker stays usable even while that integration is unavailable.
 */
export function useNoteLinkableRecords(enabled: boolean) {
  const query = useQuery<LinkableRecords>({
    queryKey: ["notes", "linkable-records"],
    enabled,
    queryFn: async () => {
      const [leads, projects] = await Promise.all([
        optimizedApiClient.get<NoteLinkableRecord[]>("/leads/picker"),
        optimizedApiClient.get<NoteLinkableRecord[]>("/projects/picker"),
      ]);

      return {
        leads: Array.isArray(leads.data) ? leads.data : [],
        projects: Array.isArray(projects.data) ? projects.data : [],
      };
    },
  });

  return {
    ...query,
    leads: query.data?.leads ?? [],
    projects: query.data?.projects ?? [],
  };
}
