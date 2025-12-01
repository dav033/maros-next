interface CompanyTypeBadgeProps {
  type: string | null | undefined;
}

export function CompanyTypeBadge({ type }: CompanyTypeBadgeProps) {
  const getTypeStyles = () => {
    switch (type) {
      case "SUBCONTRACTOR":
        return "bg-blue-500/15 text-blue-400";
      case "GENERAL_CONTRACTOR":
        return "bg-green-500/15 text-green-400";
      case "SUPPLIER":
        return "bg-yellow-500/15 text-yellow-400";
      case "HOA":
        return "bg-purple-500/15 text-purple-400";
      case "OTHER":
        return "bg-gray-500/15 text-gray-400";
      default:
        return "bg-theme-gray-subtle text-gray-300";
    }
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getTypeStyles()}`}
    >
      {type ?? "No type"}
    </span>
  );
}
