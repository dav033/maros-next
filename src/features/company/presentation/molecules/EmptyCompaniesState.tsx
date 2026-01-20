import { Building } from "lucide-react";

interface EmptyCompaniesStateProps {
  onCreateClick?: () => void;
}

export function EmptyCompaniesState({ onCreateClick }: EmptyCompaniesStateProps) {
  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <div className="max-w-md rounded-xl border border-dashed border-border bg-background/80 px-4 py-8 text-center text-sm text-muted-foreground sm:rounded-2xl sm:px-6 sm:py-10">
        <Building className="size-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-base font-medium text-foreground">No companies found.</p>
        <p className="mt-2 text-xs sm:text-sm">
          Use the button above to create a new company.
        </p>
      </div>
    </div>
  );
}
