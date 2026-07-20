import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface YesNoBadgeProps {
  value: boolean;
}

// Mismo lenguaje visual que el resto de badges semánticos (outline + color inline):
// "No" es gris neutro, no rojo de error, porque no representa una condición negativa.
// Colores desde tokens CSS compartidos (--badge-*), no hex crudo: ver globals.css.
export function YesNoBadge({ value }: YesNoBadgeProps) {
  return value ? (
    <Badge variant="outline" className="gap-1" style={{ borderColor: "hsl(var(--badge-green))", color: "hsl(var(--badge-green))" }}>
      <Check className="size-3" />
      Yes
    </Badge>
  ) : (
    <Badge variant="outline" className="gap-1" style={{ borderColor: "hsl(var(--badge-neutral))", color: "hsl(var(--badge-neutral))" }}>
      <X className="size-3" />
      No
    </Badge>
  );
}
