import { Icon } from "@/shared/ui";

interface EmptyCompaniesStateProps {
  onCreateClick?: () => void;
}

export function EmptyCompaniesState({ onCreateClick }: EmptyCompaniesStateProps) {
  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <div className="max-w-md rounded-xl border border-dashed border-theme-gray-subtle bg-theme-dark/80 px-4 py-8 text-center text-sm text-gray-400 sm:rounded-2xl sm:px-6 sm:py-10">
        <Icon name="lucide:building-2" size={48} className="mx-auto mb-4 text-gray-500" />
        <p className="text-base font-medium text-gray-300">No companies found.</p>
        <p className="mt-2 text-xs sm:text-sm">
          Use the button above to create a new company.
        </p>
      </div>
    </div>
  );
}
