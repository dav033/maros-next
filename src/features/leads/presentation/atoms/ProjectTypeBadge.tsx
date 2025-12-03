import { Badge } from "@/shared/ui";

interface ProjectTypeBadgeProps {
  projectType: {
    id: number;
    name: string;
    color?: string | null;
  } | null | undefined;
}

export function ProjectTypeBadge({ projectType }: ProjectTypeBadgeProps) {
  if (!projectType) {
    return <span className="text-gray-400">—</span>;
  }

  // Queremos misma intensidad para todos: usamos colores consistentes y alpha fijo (hex 20)
  const colorFromName = (name: string): string | null => {
    const n = name.toLowerCase();
    if (n.includes("roof") || n.includes("techo")) return "#ef4444"; // red-500
    if (n.includes("plumb") || n.includes("plomer")) return "#3b82f6"; // blue-500
    if (n.includes("construction") || n.includes("construc")) return "#f59e0b"; // amber-500
    if (n.includes("electric") || n.includes("eléctric")) return "#10b981"; // emerald-500
    if (n.includes("hvac") || n.includes("clima")) return "#8b5cf6"; // violet-500
    if (n.includes("paint") || n.includes("pintura")) return "#6366f1"; // indigo-500
    return null;
  };

  const color = projectType.color ?? colorFromName(projectType.name) ?? "#9ca3af"; // gray-400 fallback (unclassified)
  const textGray = "#9ca3af"; // unify text contrast similar to Unclassified
  const borderGray = "#4b5563"; // gray-600 border for consistent contrast

  return (
    <Badge
      size="sm"
      dot
      dotColor={color}
      customColor={color}
      customBgColor={`${color}20`}
      customTextColor={textGray}
      customBorderColor={borderGray}
    >
      {projectType.name}
    </Badge>
  );
}
