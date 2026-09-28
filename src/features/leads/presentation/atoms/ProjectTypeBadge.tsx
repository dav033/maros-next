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

  // Colores desde tokens CSS compartidos (--badge-*), no hex crudo: ver globals.css.
  const colorFromName = (name: string): string | null => {
    const n = name.toLowerCase();
    if (n.includes("roof") || n.includes("techo")) return "hsl(var(--badge-red))";
    if (n.includes("plumb") || n.includes("plomer")) return "hsl(var(--badge-blue))";
    if (n.includes("construction") || n.includes("construc")) return "hsl(var(--badge-amber))";
    if (n.includes("electric") || n.includes("eléctric")) return "hsl(var(--badge-green))";
    if (n.includes("hvac") || n.includes("clima")) return "hsl(var(--badge-violet))";
    if (n.includes("paint") || n.includes("pintura")) return "hsl(var(--badge-indigo))";
    return null;
  };

  // `||`, no `??`: el mapper entrega "" cuando el backend no trae color, y una
  // cadena vacía no es null — con `??` estos dos respaldos nunca se ejecutaban.
  const color =
    projectType.color || colorFromName(projectType.name) || "hsl(var(--badge-neutral))";

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
