import type { SimpleTableColumn } from "@/types/table";

import * as React from "react";
import type { Lead } from "@/leads/domain";
import { ContactInfoDisplay } from "@/features/contact/presentation/atoms/ContactInfoDisplay";
import { NotesButton } from "@/components/shared";
import { LeadStatusBadge } from "../../atoms/LeadStatusBadge";
import { ProjectTypeBadge } from "../../atoms/ProjectTypeBadge";
import { SharedEntityName } from "@/components/shared/SharedEntityName";
import { useRouteSharedLayoutScope } from "@/shared/presentation/RouteMotionContext";
import { sharedEntityReturnTransition } from "@/shared/presentation/motionTransitions";

interface UseLeadsTableColumnsProps {
  onOpenContactModal: (contact: any) => void;
  onOpenNotesModal: (lead: Lead) => void;
  readOnly?: boolean;
}

export function useLeadsTableColumns({
  onOpenContactModal,
  onOpenNotesModal,
  readOnly = false,
}: UseLeadsTableColumnsProps): SimpleTableColumn<Lead>[] {
  const sharedLayoutScope = useRouteSharedLayoutScope();
  return React.useMemo<SimpleTableColumn<Lead>[]>(() => {
    return [
      {
        key: "notes",
        header: "Notes",
        className: "w-[80px] text-center",
        render: (lead: Lead) => {
          const notesArray = Array.isArray(lead.notes) ? lead.notes : [];
          if (readOnly) {
            return <span className="text-muted-foreground">{notesArray.length || "—"}</span>;
          }
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
        render: (lead: Lead) => {
          const projectId = readOnly ? lead.project?.id : undefined;
          return (
            <span className="whitespace-nowrap font-mono tabular-nums text-foreground">
              {projectId ? (
                <>
                  <SharedEntityName
                    layoutCrossfade={false}
                    layoutId={`maros-project-number-${projectId}-desktop-${sharedLayoutScope}`}
                    transition={sharedEntityReturnTransition}
                    className="hidden xl:inline-block"
                  >
                    {lead.leadNumber}
                  </SharedEntityName>
                  <SharedEntityName
                    layoutCrossfade={false}
                    layoutId={`maros-project-number-${projectId}-mobile-${sharedLayoutScope}`}
                    transition={sharedEntityReturnTransition}
                    className="inline-block xl:hidden"
                  >
                    {lead.leadNumber}
                  </SharedEntityName>
                </>
              ) : (
                <SharedEntityName layoutId={`maros-lead-number-${lead.id}`}>
                  {lead.leadNumber}
                </SharedEntityName>
              )}
            </span>
          );
        },
        sortable: true,
        sortValue: (lead: Lead) => lead.leadNumber ?? "",
      },
      {
        // Free text, so it gets the truncate treatment (see `location`) rather than
        // being allowed to stack into a multi-line cell.
        key: "name",
        header: "Name",
        className: "w-[200px] max-w-[200px]",
        render: (lead: Lead) => (
          <span className="block truncate text-foreground" title={lead.name ?? undefined}>
            {readOnly && lead.project?.id ? (
              <>
                <SharedEntityName
                  layoutId={`maros-project-name-${lead.project.id}-desktop-${sharedLayoutScope}`}
                  className="hidden xl:inline"
                >
                  {lead.name}
                </SharedEntityName>
                <SharedEntityName
                  layoutId={`maros-project-name-${lead.project.id}-mobile-${sharedLayoutScope}`}
                  className="xl:hidden"
                >
                  {lead.name}
                </SharedEntityName>
              </>
            ) : !readOnly && lead.id ? (
              <SharedEntityName layoutId={`maros-lead-name-${lead.id}`}>
                {lead.name}
              </SharedEntityName>
            ) : lead.name}
          </span>
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
            sourceInstance={`lead-${lead.id}`}
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
        // The one column that reliably overflows: a full street address wrapped into
        // four lines and set the height of every row around it. Widest column of the
        // set so a typical address fits outright; anything longer truncates with the
        // full value on hover, rather than widening the table further.
        key: "location",
        header: "Location",
        className: "w-[240px] max-w-[240px]",
        render: (lead: Lead) => (
          <span className="block truncate text-foreground" title={lead.location ?? undefined}>
            {lead.location ?? "—"}
          </span>
        ),
        sortable: true,
        sortValue: (lead: Lead) => lead.location ?? "",
      },
      {
        key: "estimate",
        header: "Estimate",
        className: "w-[120px] text-right",
        render: (lead: Lead) => (
          <span className="whitespace-nowrap font-mono text-sm tabular-nums text-foreground">
            {lead.estimate != null
              ? `$${Number(lead.estimate).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : "—"}
          </span>
        ),
        sortable: true,
        sortValue: (lead: Lead) => lead.estimate ?? -Infinity,
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
  }, [onOpenContactModal, onOpenNotesModal, readOnly, sharedLayoutScope]);
}
