import type { SimpleTableColumn } from "@/types/table";

import * as React from "react";
import type { Lead } from "@/leads/domain";
import { ContactInfoDisplay } from "@/features/contact/presentation/atoms/ContactInfoDisplay";
import { NotesButton } from "@/components/custom";
import { LeadStatusBadge } from "../../atoms/LeadStatusBadge";
import { ProjectTypeBadge } from "../../atoms/ProjectTypeBadge";

interface UseLeadsTableColumnsProps {
  onOpenContactModal: (contact: any) => void;
  onOpenNotesModal: (lead: Lead) => void;
}

export function useLeadsTableColumns({
  onOpenContactModal,
  onOpenNotesModal,
}: UseLeadsTableColumnsProps): SimpleTableColumn<Lead>[] {
  return React.useMemo<SimpleTableColumn<Lead>[]>(() => {
    return [
      {
        key: "notes",
        header: "Notes",
        className: "w-[80px] text-center",
        render: (lead: Lead) => {
          const notesArray = Array.isArray(lead.notes) ? lead.notes : [];
          return (
            <NotesButton
              hasNotes={notesArray.length > 0}
              notesCount={notesArray.length}
              onClick={() => onOpenNotesModal(lead)}
              title="View notes"
            />
          );
        },
        sortable: false,
      },
      {
        key: "leadNumber",
        header: "Lead #",
        className: "w-[110px]",
        render: (lead: Lead) => (
          <span className="font-mono text-foreground">{lead.leadNumber}</span>
        ),
        sortable: true,
        sortValue: (lead: Lead) => lead.leadNumber ?? "",
      },
      {
        key: "name",
        header: "Name",
        className: "w-[200px]",
        render: (lead: Lead) => (
          <span className="text-foreground">{lead.name}</span>
        ),
        sortable: true,
        sortValue: (lead: Lead) => lead.name ?? "",
      },
      {
        key: "contact",
        header: "Contact",
        className: "w-[180px] text-center",
        render: (lead: Lead) => (
          <ContactInfoDisplay
            contact={lead.contact}
            onClick={() => lead.contact && onOpenContactModal(lead.contact)}
          />
        ),
        sortable: true,
        sortValue: (lead: Lead) => lead.contact?.name ?? "",
      },
      {
        key: "projectType",
        header: "Project Type",
        className: "w-[150px] text-center",
        render: (lead: Lead) => <ProjectTypeBadge projectType={lead.projectType} />,
        sortable: true,
        sortValue: (lead: Lead) => lead.projectType?.name ?? "",
      },
      {
        key: "location",
        header: "Location",
        className: "w-[200px]",
        render: (lead: Lead) => (
          <span className="text-foreground">{lead.location ?? "—"}</span>
        ),
        sortable: true,
        sortValue: (lead: Lead) => lead.location ?? "",
      },
      {
        key: "status",
        header: "Status",
        className: "w-[120px] text-center",
        render: (lead: Lead) => <LeadStatusBadge status={lead.status} />,
        sortable: true,
        sortValue: (lead: Lead) => lead.status ?? "",
      },
    ];
  }, [onOpenContactModal, onOpenNotesModal]);
}
