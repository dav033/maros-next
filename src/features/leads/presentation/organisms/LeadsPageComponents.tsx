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
    <header className="flex flex-col gap-1">
      <h1 className="text-xl font-semibold text-theme-light sm:text-2xl">
        {title}
      </h1>
      <p className="text-xs text-gray-400 sm:text-sm">{description}</p>
    </header>
  );
}
