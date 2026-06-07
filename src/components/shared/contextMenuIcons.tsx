"use client";

import {
  Building,
  DollarSign,
  Edit,
  FileText,
  type LucideIcon,
  StickyNote,
  Trash,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  "lucide:edit": Edit,
  "lucide:trash": Trash,
  "lucide:trash-2": Trash,
  "lucide:file-text": FileText,
  "lucide:sticky-note": StickyNote,
  "lucide:dollar-sign": DollarSign,
  "lucide:building": Building,
  "mdi:note-text": StickyNote,
  "mdi:cash-multiple": DollarSign,
};

export function resolveContextIcon(icon: unknown): React.ReactNode {
  if (icon == null) return null;
  if (typeof icon === "string") {
    const Component = ICON_MAP[icon];
    return Component ? <Component className="size-4" /> : null;
  }
  return icon as React.ReactNode;
}
