"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Edit, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";

export interface InlineEditCardHeaderProps {
  /** Icon for the card title */
  icon: LucideIcon;
  /** Title text */
  title: string;
  /** Whether the card is in edit mode */
  isEditing: boolean;
  /** Whether a save operation is in progress */
  isSaving?: boolean;
  /** Called when the Edit button is clicked */
  onEdit: () => void;
  /** Called when the Save button is clicked */
  onSave: () => void;
  /** Called when the Cancel button is clicked */
  onCancel: () => void;
  /** Extra actions to show alongside edit/save buttons */
  extraActions?: ReactNode;
}

/**
 * Reusable card header with inline edit/save/cancel controls.
 * Used across all detail pages for editable entity cards.
 */
export function InlineEditCardHeader({
  icon: Icon,
  title,
  isEditing,
  isSaving = false,
  onEdit,
  onSave,
  onCancel,
  extraActions,
}: InlineEditCardHeaderProps) {
  return (
    <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
      <CardTitle className="flex min-w-0 items-center gap-2 text-sm leading-tight sm:text-base">
        <Icon className="size-4 shrink-0 sm:size-5" />
        <span className="min-w-0 break-words">{title}</span>
      </CardTitle>
      {isEditing ? (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isSaving}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-4 mr-2" />
            Cancel
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onSave}
            disabled={isSaving}
            className="text-muted-foreground hover:text-foreground"
          >
            <Save className="size-4 mr-2" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            aria-label={`Edit ${title}`}
            className="text-muted-foreground hover:text-foreground"
          >
            <Edit className="size-4 sm:mr-2" />
            <span className="hidden sm:inline">Edit</span>
          </Button>
          {extraActions}
        </div>
      )}
    </CardHeader>
  );
}
