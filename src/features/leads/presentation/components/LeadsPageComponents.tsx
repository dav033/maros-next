import { Button } from "@/shared/ui";
import type { LeadsToolbar } from "@/leads";

interface LeadsPageHeaderProps {
  title: string;
  description: string;
  onNewLead: () => void;
}

export function LeadsPageHeader({
  title,
  description,
  onNewLead,
}: LeadsPageHeaderProps) {
  return (
    <>
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-theme-light sm:text-2xl">
          {title}
        </h1>
        <p className="text-xs text-gray-400 sm:text-sm">{description}</p>
      </header>
    </>
  );
}

interface LeadsPageToolbarProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  searchField: string;
  onSearchFieldChange: (field: string) => void;
  totalCount: number;
  filteredCount: number;
  onNewLead: () => void;
  LeadsToolbar: typeof LeadsToolbar;
}

export function LeadsPageToolbar({
  searchQuery,
  onSearchQueryChange,
  searchField,
  onSearchFieldChange,
  totalCount,
  filteredCount,
  onNewLead,
  LeadsToolbar,
}: LeadsPageToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <LeadsToolbar
        searchQuery={searchQuery}
        onSearchQueryChange={onSearchQueryChange}
        searchField={searchField}
        onSearchFieldChange={onSearchFieldChange}
        totalCount={totalCount}
        filteredCount={filteredCount}
      />
      <Button variant="primary" onClick={onNewLead}>
        <span className="mr-2 text-lg leading-none">＋</span>
        New Lead
      </Button>
    </div>
  );
}
