import {
  Briefcase,
  Building2,
  FileText,
  FolderKanban,
  ListTodo,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { NoteReferenceKind } from "@/notes/domain";

/**
 * One icon per referenceable kind, shared by the mention chip, the picker and the
 * backlink lists — a lead has to look like a lead wherever it is shown, or the chips stop
 * being readable at a glance, which is the whole point of them.
 *
 * Briefcase/FolderKanban/UserRound/Building2 match what NoteEntityPicker already used for
 * the four CRM kinds, so nothing that was already on screen changes meaning.
 */
export const NOTE_REFERENCE_ICONS: Record<NoteReferenceKind, LucideIcon> = {
  lead: Briefcase,
  project: FolderKanban,
  contact: UserRound,
  company: Building2,
  task: ListTodo,
  user: Users,
  note: FileText,
};

/**
 * Tint per kind, as a utility class pair.
 *
 * Distinct hues rather than one accent: a paragraph can hold a lead, a task and a
 * colleague, and three identically coloured pills read as one undifferentiated smear.
 * All six are on elevated backgrounds so they stay legible in either theme.
 */
export const NOTE_REFERENCE_CHIP_CLASSES: Record<NoteReferenceKind, string> = {
  lead: "bg-amber-500/15 text-amber-300",
  project: "bg-sky-500/15 text-sky-300",
  contact: "bg-emerald-500/15 text-emerald-300",
  company: "bg-violet-500/15 text-violet-300",
  task: "bg-rose-500/15 text-rose-300",
  user: "bg-primary/15 text-primary",
  note: "bg-slate-500/20 text-slate-300",
};
