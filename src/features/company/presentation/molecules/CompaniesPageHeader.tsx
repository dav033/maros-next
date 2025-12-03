interface CompaniesPageHeaderProps {
  title?: string;
  description?: string;
}

export function CompaniesPageHeader({
  title = "Companies",
  description = "Manage companies and contractors in your network.",
}: CompaniesPageHeaderProps) {
  return (
    <header className="flex flex-col gap-1">
      <h1 className="text-xl font-semibold text-theme-light sm:text-2xl">
        {title}
      </h1>
      <p className="text-xs text-gray-400 sm:text-sm">{description}</p>
    </header>
  );
}
