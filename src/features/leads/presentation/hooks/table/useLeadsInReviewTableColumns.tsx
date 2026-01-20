import type { SimpleTableColumn } from "@/types/table";
import * as React from "react";
import type { Lead } from "@/leads/domain";
import { getLeadTypeFromNumber } from "@/leads/domain";

import { ContactInfoDisplay } from "@/features/contact/presentation/atoms/ContactInfoDisplay";
import { NotesButton } from "@/components/custom";
import { Loader, Check, X } from "lucide-react";
import { LeadStatusBadge } from "../../atoms/LeadStatusBadge";
import { LeadTypeBadge } from "../../atoms/LeadTypeBadge";

interface UseLeadsInReviewTableColumnsProps {
  onOpenContactModal: (contact: any) => void;
  onOpenNotesModal: (lead: Lead) => void;
  onAccept: (lead: Lead) => void;
  onReject: (lead: Lead) => void;
  isAccepting?: number | null;
  isRejecting?: number | null;
}

// Styled action button component
function ActionButton({
  onClick,
  disabled,
  isLoading,
  variant,
  tooltip,
}: {
  onClick: (e: React.MouseEvent) => void;
  disabled: boolean;
  isLoading: boolean;
  variant: "approve" | "reject";
  tooltip: string;
}) {
  const isApprove = variant === "approve";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={disabled ? "Action not available" : tooltip}
      className={`
        group
        relative w-[28px] h-[28px] rounded-md
        flex items-center justify-center
        bg-transparent border border-[#2D3341]/50
        transition-all duration-150 ease-out
        cursor-pointer
        focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50
        disabled:opacity-40 disabled:cursor-not-allowed
        ${!disabled ? "hover:bg-accent/50 hover:border-border" : ""}
        ${!disabled ? "active:scale-[0.95]" : ""}
      `}
    >
      {isLoading ? (
        <Loader className="size-3.5 animate-spin text-muted-foreground" />
      ) : isApprove ? (
        <Check 
          className={`
            size-3.5
            transition-colors duration-150
            ${disabled 
              ? "text-muted-foreground" 
              : "text-emerald-600/60 group-hover:text-emerald-400"
            }
          `}
        />
      ) : (
        <X 
          className={`
            size-3.5
            transition-colors duration-150
            ${disabled 
              ? "text-muted-foreground" 
              : "text-red-500/60 group-hover:text-red-400"
            }
          `}
        />
      )}
    </button>
  );
}

export function useLeadsInReviewTableColumns({
  onOpenContactModal,
  onOpenNotesModal,
  onAccept,
  onReject,
  isAccepting,
  isRejecting,
}: UseLeadsInReviewTableColumnsProps): SimpleTableColumn<Lead>[] {
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
        key: "type",
        header: "Type",
        className: "w-[130px] text-center",
        render: (lead: Lead) => {
          const leadType = getLeadTypeFromNumber(lead.leadNumber);
          return <LeadTypeBadge leadType={leadType} />;
        },
        sortable: true,
        sortValue: (lead: Lead) => getLeadTypeFromNumber(lead.leadNumber) ?? "",
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
      {
        key: "actions",
        header: "",
        className: "w-[100px] text-center sticky right-0 bg-secondary-900/95 backdrop-blur-sm",
        render: (lead: Lead) => {
          const isCurrentAccepting = isAccepting === lead.id;
          const isCurrentRejecting = isRejecting === lead.id;
          const isProcessing = isCurrentAccepting || isCurrentRejecting;

          return (
            <div className="flex items-center justify-end gap-2 pr-2">
              <ActionButton
                onClick={(e) => {
                  e.stopPropagation();
                  onAccept(lead);
                }}
                disabled={isProcessing}
                isLoading={isCurrentAccepting}
                variant="approve"
                tooltip="Approve lead"
              />
              <ActionButton
                onClick={(e) => {
                  e.stopPropagation();
                  onReject(lead);
                }}
                disabled={isProcessing}
                isLoading={isCurrentRejecting}
                variant="reject"
                tooltip="Reject lead"
              />
            </div>
          );
        },
        sortable: false,
      },
    ];
  }, [onOpenContactModal, onOpenNotesModal, onAccept, onReject, isAccepting, isRejecting]);
}
