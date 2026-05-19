"use client";

import { StickyNote, Edit, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface CompanyNotesSectionProps {
  notes: string[];
  onOpenNotesModal: () => void;
}

export function CompanyNotesSection({
  notes,
  onOpenNotesModal,
}: CompanyNotesSectionProps) {
  const safeNotes = Array.isArray(notes) ? notes : [];
  if (safeNotes.length > 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <StickyNote className="size-5" />
            Notes
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenNotesModal}
            className="text-muted-foreground hover:text-foreground"
          >
            <Edit className="size-4 mr-2" />
            Edit
          </Button>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {safeNotes.map((note, index) => (
              <li key={index} className="text-sm text-foreground">
                {note}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StickyNote className="size-5" />
          Notes
        </CardTitle>
        <CardDescription>No notes for this company</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline" onClick={onOpenNotesModal} className="w-full">
          <Plus className="size-4 mr-2" />
          Add Notes
        </Button>
      </CardContent>
    </Card>
  );
}
