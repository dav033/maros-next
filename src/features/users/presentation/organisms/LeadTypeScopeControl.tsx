"use client";

import { Check, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LeadType } from "@/leads/domain";
import { cn } from "@/lib/utils";

const LEAD_TYPE_LABELS: Record<LeadType, string> = {
  [LeadType.CONSTRUCTION]: "Construction",
  [LeadType.PLUMBING]: "Plumbing",
  [LeadType.ROOFING]: "Roofing",
};

const ALL_TYPES = [LeadType.CONSTRUCTION, LeadType.PLUMBING, LeadType.ROOFING];

/**
 * A qué tipos de lead está limitado un usuario.
 *
 * `null` es "todos los tipos" y es lo que tiene quien no está restringido. No
 * se puede dejar la selección vacía: "restringido a ningún tipo" dejaría una
 * pantalla vacía indistinguible de un fallo, y la forma de decir "ningún lead"
 * es quitarle el permiso. Quitar la última marca equivale a quitar la
 * restricción.
 */
export function LeadTypeScopeControl({
  value,
  disabled,
  onChange,
}: {
  value: LeadType[] | null;
  disabled?: boolean;
  onChange: (next: LeadType[] | null) => void;
}) {
  const restricted = value !== null && value.length > 0;
  const label = restricted
    ? value.map((type) => LEAD_TYPE_LABELS[type]).join(", ")
    : "Todos los tipos";

  function toggle(type: LeadType) {
    const current = value ?? [];
    const next = current.includes(type)
      ? current.filter((entry) => entry !== type)
      : [...current, type];
    // Quitar la ultima marca no deja a nadie sin nada: quita la restriccion.
    onChange(next.length === 0 ? null : next);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          aria-label="Tipos de lead que puede ver"
          className="h-8 w-44 justify-between border-line-strong font-normal"
        >
          <span className={cn("truncate", !restricted && "text-muted-foreground")}>
            {label}
          </span>
          <ChevronDown aria-hidden="true" className="size-3.5 shrink-0 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuItem
          onClick={() => onChange(null)}
          className="flex items-center justify-between gap-2"
        >
          Todos los tipos
          {!restricted && <Check className="size-4 shrink-0" />}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {ALL_TYPES.map((type) => (
          <DropdownMenuItem
            key={type}
            onSelect={(event) => {
              // Sin esto el menu se cierra en cada marca y hay que volver a
              // abrirlo para elegir el segundo tipo.
              event.preventDefault();
              toggle(type);
            }}
            className="flex items-center gap-2"
          >
            <Checkbox
              checked={restricted && value.includes(type)}
              aria-hidden="true"
              tabIndex={-1}
              className="pointer-events-none"
            />
            {LEAD_TYPE_LABELS[type]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
