import { Badge } from "@/components/ui/badge";

interface ProjectTypeBadgeProps {
  projectType: {
    id: number;
    name: string;
    color?: string | null;
  } | null | undefined;
}

export function ProjectTypeBadge({ projectType }: ProjectTypeBadgeProps) {
  if (!projectType) {
    return <span className="text-muted-foreground">—</span>;
  }

  const colorFromName = (name: string): string | null => {
    const n = name.toLowerCase();
    if (n.includes("roof") || n.includes("techo")) return "#ef4444";
    if (n.includes("plumb") || n.includes("plomer")) return "#3b82f6";
    if (n.includes("construction") || n.includes("construc")) return "#f59e0b";
    if (n.includes("electric") || n.includes("eléctric")) return "#10b981";
    if (n.includes("hvac") || n.includes("clima")) return "#8b5cf6";
    if (n.includes("paint") || n.includes("pintura")) return "#6366f1";
    return null;
  };

  const color = projectType.color ?? colorFromName(projectType.name) ?? "#9ca3af";

  return (
    <Badge
      variant="outline"
      // Badges no longer wrap, so a long type name would widen the column instead;
      // cap it and ellipsize, with the full name on hover.
      className="max-w-full gap-1.5 text-xs"
      style={{ borderColor: color, color }}
      title={projectType.name}
    >
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="truncate">{projectType.name}</span>
    </Badge>
  );
}
