"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";

export interface ContactInfoDisplayProps {
  contact: {
    id?: number;
    name: string;
    phone?: string | null;
    email?: string | null;
    occupation?: string | null;
    address?: string | null;
    isCustomer?: boolean;
    isClient?: boolean;
  } | null;
  onClick?: () => void;
  variant?: "button" | "text";
  className?: string;
}

export function ContactInfoDisplay({
  contact,
  onClick,
  variant = "button",
  className = "",
}: ContactInfoDisplayProps) {
  const router = useRouter();

  if (!contact || !contact.name || contact.name.trim() === "") {
    return <span className="text-foreground">—</span>;
  }

  if (variant === "text") {
    return <span className={`text-foreground ${className}`}>{contact.name}</span>;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Si hay un onClick personalizado, usarlo
    if (onClick) {
      onClick();
      return;
    }
    
    // Si el contacto tiene ID, navegar a la página de detalles
    if (contact.id) {
      router.push(`/contact/${contact.id}`);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      // max-w-full lets the pill shrink inside a squeezed column instead of forcing
      // its 160px onto the cell and pushing the rest of the row out of shape.
      // Chip dentro de una fila (elev-2): sube a la superficie de chip (elev-4) y su
      // hover, un escalon mas. El matiz sale del token compartido, no de la paleta cruda.
      className={`inline-flex w-[160px] max-w-full cursor-pointer items-center gap-2 rounded-md border bg-elev-4 px-2.5 py-1 text-xs font-medium transition-colors hover:bg-elev-5 ${className}`}
      style={{ borderColor: "hsl(var(--badge-indigo))", color: "hsl(var(--badge-indigo))" }}
    >
      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-elev-5">
        <User className="size-2.5" />
      </div>
      <span className="truncate">{contact.name}</span>
    </button>
  );
}
