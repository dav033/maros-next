"use client";

import * as React from "react";
import { User } from "lucide-react";

export interface ContactInfoDisplayProps {
  contact: {
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
  if (!contact || !contact.name || contact.name.trim() === "") {
    return <span className="text-foreground">—</span>;
  }

  if (variant === "text") {
    return <span className={`text-foreground ${className}`}>{contact.name}</span>;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-md border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-300 hover:bg-indigo-500/20 transition-colors cursor-pointer w-[160px] ${className}`}
    >
      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300">
        <User className="size-2.5" />
      </div>
      <span className="truncate">{contact.name}</span>
    </button>
  );
}
