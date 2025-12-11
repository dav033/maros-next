"use client";

import * as React from "react";
import { Icon, Badge } from "@dav033/dav-components";

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
    return <span className="text-gray-300">—</span>;
  }

  if (variant === "text") {
    return <span className={`text-gray-300 ${className}`}>{contact.name}</span>;
  }

  return (
    <Badge
      variant="indigo"
      size="md"
      interactive
      onClick={onClick}
      icon={
        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300">
          <Icon name="lucide:user" size={10} />
        </div>
      }
      className={`w-[160px] ${className}`}
    >
      {contact.name}
    </Badge>
  );
}
