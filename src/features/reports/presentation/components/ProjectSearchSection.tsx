import { SearchableSelect, Typography } from "@dav033/dav-components";
import type { Project } from "@/project/domain";

interface ProjectSearchSectionProps {
  projectOptions: Array<{ value: string; label: string }>;
  projectInput: string;
  onSelectProject: (value: string) => void;
  projectsLoading: boolean;
  error?: Error | null;
  hasRemoteData?: boolean;
  leadNumber?: string;
}

export const ProjectSearchSection = ({
  projectOptions,
  projectInput,
  onSelectProject,
  projectsLoading,
  error,
  hasRemoteData,
  leadNumber,
}: ProjectSearchSectionProps) => {
  return (
    <section className="rounded-2xl bg-[#1d1d1f] p-6 shadow-sm space-y-4">
      <Typography variant="body" className="font-semibold text-theme-light">
        Search Project Information
      </Typography>
      <div className="space-y-2">
        <Typography variant="small" className="text-gray-300">
          Projects
        </Typography>
        <SearchableSelect
          options={projectOptions}
          value={projectInput}
          onChange={onSelectProject}
          placeholder="Search and select project"
          icon="mdi:magnify"
          disabled={projectsLoading}
        />
      </div>
      {error && (
        <Typography variant="small" className="text-red-400">
          {error.message}
        </Typography>
      )}
      {hasRemoteData && (
        <Typography variant="small" className="text-emerald-400">
          Data preloaded from API for project {leadNumber}.
        </Typography>
      )}
    </section>
  );
};


