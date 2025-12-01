import * as React from "react";
import { Icon } from "../atoms";

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
    <button
      type="button"
      className={`group inline-flex w-[160px] cursor-pointer items-center gap-2 rounded-full bg-indigo-500/10 px-3 py-0.5 pr-4 transition-colors hover:bg-indigo-500/20 ${className}`}
      onClick={onClick}
    >
      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300">
        <Icon name="lucide:user" size={10} />
      </div>
      <span className="truncate text-sm font-medium text-indigo-300 transition-colors group-hover:text-indigo-200">
        {contact.name}
      </span>
    </button>
  );
}
