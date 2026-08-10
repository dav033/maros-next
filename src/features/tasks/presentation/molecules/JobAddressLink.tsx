import { MapPin } from "lucide-react";
import type { Lead } from "@/leads/domain";
import type { Project } from "@/project/domain";
import type { Task } from "@/tasks/domain";

/**
 * The jobsite address is never stored on the task — it's derived from whatever CRM
 * record it's linked to, so correcting the lead's address instantly corrects every task
 * pointing at it. See PLAN-TAREAS.md §0.4. Projects carry their own `lead` relation, so
 * both link kinds resolve through the same two fields.
 */
export function deriveJobAddress(
  task: Task,
  leads: Lead[] | undefined,
  projects: Project[] | undefined
): { label: string; href: string | null } | null {
  const lead =
    task.entityKind === "lead" && task.entityId != null
      ? leads?.find((item) => item.id === task.entityId)
      : task.entityKind === "project" && task.entityId != null
        ? projects?.find((item) => item.id === task.entityId)?.lead
        : undefined;

  if (!lead?.location) return null;
  return { label: lead.location, href: lead.addressLink ?? null };
}

export function JobAddressLink({
  address,
}: {
  address: { label: string; href: string | null } | null;
}) {
  if (!address) return null;

  if (!address.href) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <MapPin className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{address.label}</span>
      </span>
    );
  }

  return (
    <a
      href={address.href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-1 text-xs text-muted-foreground underline decoration-dotted hover:text-foreground"
    >
      <MapPin className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{address.label}</span>
    </a>
  );
}
