import { SearchableSelect } from "@/components/custom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

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
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Search Project Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Projects</Label>
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
          <p className="text-sm text-red-400">
            {error.message}
          </p>
        )}
        {hasRemoteData && (
          <p className="text-sm text-emerald-400">
            Data preloaded from API for project {leadNumber}.
          </p>
        )}
      </CardContent>
    </Card>
  );
};


