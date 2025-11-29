"use client";

import * as React from "react";
import { getNotesArray } from "@/shared/utils/notes";
import { NotesEditorModal } from "@/shared/ui/molecules/NotesEditorModal";
import type { Lead } from "@/leads";
import { deleteLead } from "@/leads";
import { useLeadsApp } from "@/di";
import {
  ContextMenu,
  SimpleTable,
  Icon,
  useContextMenu,
  Modal,
} from "@/shared/ui";
import { DeleteFeedbackModal } from "@/shared/ui/molecules/DeleteFeedbackModal";
import { Spinner } from "@/shared/ui/atoms/Spinner";
import { useToast } from "@/shared/ui/context/ToastContext";
import type { SimpleTableColumn } from "@/shared/ui";
import type { LeadsAppContext } from "@/features/leads/application/context";

export interface LeadsTableProps {
  leads: Lead[];
  isLoading?: boolean;
  onEdit?: (lead: Lead) => void;
  onDelete?: (leadId: number) => void;
}

export function LeadsTable({
  leads,
  isLoading,
  onEdit,
  onDelete,
}: LeadsTableProps) {
  const app = useLeadsApp() as LeadsAppContext & {
    patchLead: (
      id: number,
      patch: { notes?: string[] },
      options?: Record<string, unknown>
    ) => Promise<Lead>;
  };

  const toast = useToast();

  // 🔹 Estado local de leads
  const [localLeads, setLocalLeads] = React.useState<Lead[]>(leads);

  React.useEffect(() => {
    setLocalLeads(leads);
  }, [leads]);

  // Context menu
  const { isVisible, position, options, show, hide } = useContextMenu();

  // Delete lead modal state
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [leadToDelete, setLeadToDelete] = React.useState<Lead | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  // Contact modal state
  const [contactModalOpen, setContactModalOpen] = React.useState(false);
  const [contactToView, setContactToView] = React.useState<any | null>(null);

  // Notes modal state (generalizado)
  const [notesModalOpen, setNotesModalOpen] = React.useState(false);
  const [leadNotes, setLeadNotes] = React.useState<string[]>([]);
  const [leadNotesTitle, setLeadNotesTitle] = React.useState<string>("");
  const [leadNotesLeadId, setLeadNotesLeadId] =
    React.useState<number | null>(null);
  const [notesLoading, setNotesLoading] = React.useState(false);

  // ---- Handlers ----

  const handleDeleteLead = React.useCallback((lead: Lead) => {
    setLeadToDelete(lead);
    setDeleteModalOpen(true);
    setDeleteError(null);
  }, []);

  const confirmDelete = React.useCallback(async () => {
    if (!leadToDelete) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await deleteLead(app, leadToDelete.id);

      // 🔹 Actualizamos estado local
      setLocalLeads((prev) => prev.filter((l) => l.id !== leadToDelete.id));

      setDeleteModalOpen(false);
      toast?.showSuccess?.("Lead deleted successfully!");
      onDelete?.(leadToDelete.id);
      setLeadToDelete(null);
    } catch (e) {
      setDeleteError("Error deleting lead");
    } finally {
      setDeleteLoading(false);
    }
  }, [leadToDelete, app, toast, onDelete]);

  const handleCloseContactModal = React.useCallback(() => {
    setContactModalOpen(false);
    setContactToView(null);
  }, []);

  const handleRowContextMenu = React.useCallback(
    (event: React.MouseEvent, lead: Lead) => {
      event.preventDefault();
      show(event, []);
    },
    [show]
  );

  const handleOpenContactModal = React.useCallback((contact: any) => {
    setContactToView(contact);
    setContactModalOpen(true);
  }, []);

  // Notes handlers (generalizados)
  const handleOpenNotesModal = React.useCallback((lead: Lead) => {
    setLeadNotes(getNotesArray(lead.notesJson));
    setLeadNotesTitle(lead.name);
    setLeadNotesLeadId(lead.id);
    setNotesModalOpen(true);
  }, []);

  const handleCloseNotesModal = React.useCallback(() => {
    if (notesLoading) return;
    setNotesModalOpen(false);
    setLeadNotes([]);
    setLeadNotesLeadId(null);
    setLeadNotesTitle("");
  }, [notesLoading]);

  const handleSaveNotes = React.useCallback(async () => {
    if (!leadNotesLeadId) {
      setNotesModalOpen(false);
      return;
    }
    setNotesLoading(true);
    try {
      const updated = await app.patchLead(
        leadNotesLeadId,
        { notes: leadNotes },
        {}
      );

      // 🔹 Actualizamos estado local con el lead actualizado
      setLocalLeads((prev) =>
        prev.map((l) => (l.id === updated.id ? updated : l))
      );

      toast?.showSuccess?.("Notes updated successfully");
      setNotesModalOpen(false);
    } catch (e) {
      console.error("Error updating notes", e);
    } finally {
      setNotesLoading(false);
    }
  }, [app, leadNotesLeadId, leadNotes, toast]);

  const handleEditLead = React.useCallback(
    (lead: Lead) => {
      onEdit?.(lead);
    },
    [onEdit]
  );

  // ---- Column definition ----

  const columns = React.useMemo<SimpleTableColumn<Lead>[]>(() => {
    return [
      {
        key: "name",
        header: "Name",
        className: "w-[200px]",
        render: (lead: Lead) => (
          <span className="text-theme-light">{lead.name}</span>
        ),
        sortable: true,
        sortValue: (lead: Lead) => lead.name ?? "",
      },
      {
        key: "notes",
        header: "Notes",
        className: "w-[80px] text-center",
        render: (lead: Lead) => (
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-theme-border/60 bg-theme-dark/70 px-2.5 py-1 text-xs text-theme-muted hover:bg-theme-primary/90 hover:text-white transition-colors duration-150"
            title="View notes"
            onClick={() => handleOpenNotesModal(lead)}
          >
            <Icon name="lucide:sticky-note" size={16} />
          </button>
        ),
        sortable: false,
      },
      {
        key: "contact",
        header: "Contact",
        className: "w-[180px]",
        render: (lead: Lead) =>
          lead.contact &&
          lead.contact.name &&
          lead.contact.name.trim() !== "" ? (
            <button
              type="button"
              className="group inline-flex w-[160px] cursor-pointer items-center gap-2 rounded-full bg-indigo-500/10 px-3 py-0.5 pr-4 transition-colors hover:bg-indigo-500/20"
              onClick={() => handleOpenContactModal(lead.contact)}
            >
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300">
                <Icon name="lucide:user" size={10} />
              </div>
              <span className="truncate text-sm font-medium text-indigo-300 transition-colors group-hover:text-indigo-200">
                {lead.contact.name}
              </span>
            </button>
          ) : (
            <span className="text-gray-300">—</span>
          ),
        sortable: true,
        sortValue: (lead: Lead) => lead.contact?.name ?? "",
      },
      {
        key: "projectType",
        header: "Project Type",
        className: "w-[150px]",
        render: (lead: Lead) => (
          <span className="text-gray-300">{lead.projectType?.name ?? "—"}</span>
        ),
        sortable: true,
        sortValue: (lead: Lead) => lead.projectType?.name ?? "",
      },
      {
        key: "location",
        header: "Location",
        className: "w-[200px]",
        render: (lead: Lead) => (
          <span className="text-gray-300">{lead.location ?? "—"}</span>
        ),
        sortable: true,
        sortValue: (lead: Lead) => lead.location ?? "",
      },
      {
        key: "startDate",
        header: "Start Date",
        className: "w-[120px]",
        render: (lead: Lead) => (
          <span className="text-gray-300">
            {lead.startDate
              ? new Date(lead.startDate).toLocaleDateString()
              : "—"}
          </span>
        ),
        sortable: true,
        sortValue: (lead: Lead) => lead.startDate ?? "",
      },
      {
        key: "status",
        header: "Status",
        className: "w-[130px]",
        render: (lead: Lead) => {
          const statusColors: Record<string, string> = {
            NOT_EXECUTED: "bg-gray-500/15 text-gray-400",
            COMPLETED: "bg-emerald-500/15 text-emerald-400",
            IN_PROGRESS: "bg-blue-500/15 text-blue-400",
            LOST: "bg-red-500/15 text-red-400",
            POSTPONED: "bg-yellow-500/15 text-yellow-400",
            PERMITS: "bg-purple-500/15 text-purple-400",
          };
          const statusLabels: Record<string, string> = {
            NOT_EXECUTED: "Not Executed",
            COMPLETED: "Completed",
            IN_PROGRESS: "In Progress",
            LOST: "Lost",
            POSTPONED: "Postponed",
            PERMITS: "Permits",
          };
          const colorClass =
            statusColors[lead.status] ?? "bg-theme-gray-subtle text-gray-300";
          const label = statusLabels[lead.status] ?? lead.status;
          return (
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colorClass}`}
            >
              {label}
            </span>
          );
        },
        sortable: true,
        sortValue: (lead: Lead) => lead.status ?? "",
      },
    ];
  }, [handleOpenContactModal, handleOpenNotesModal]);

  // ---- Empty state ----

  if (!localLeads || localLeads.length === 0) {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <Spinner />
        </div>
      );
    }
    return (
      <div className="rounded-2xl border border-dashed border-theme-border/60 bg-theme-dark/40 p-4 text-sm text-theme-muted">
        No leads found.
      </div>
    );
  }

  // ---- Render ----

  return (
    <>
      {isLoading && (
        <div className="mb-2 flex items-center gap-2 text-sm text-theme-muted">
          <Spinner /> <span>Loading leads...</span>
        </div>
      )}

      <SimpleTable<Lead>
        columns={columns}
        data={localLeads}
        rowKey={(lead) => lead.id}
        onRowContextMenu={handleRowContextMenu}
      />

      <ContextMenu
        isOpen={isVisible}
        position={position}
        onClose={hide}
        options={Array.isArray(options) ? options : []}
      />

      {/* Contact Modal */}
      <Modal
        isOpen={contactModalOpen}
        title="Contact Information"
        onClose={handleCloseContactModal}
      >
        <div className="space-y-2 p-4">
          <div>
            <span className="font-semibold text-theme-light">Name:</span>{" "}
            {contactToView?.name}
          </div>
          <div>
            <span className="font-semibold text-theme-light">Phone:</span>{" "}
            {contactToView?.phone || "—"}
          </div>
          <div>
            <span className="font-semibold text-theme-light">Email:</span>{" "}
            {contactToView?.email || "—"}
          </div>
          <div>
            <span className="font-semibold text-theme-light">Occupation:</span>{" "}
            {contactToView?.occupation || "—"}
          </div>
          <div>
            <span className="font-semibold text-theme-light">Address:</span>{" "}
            {contactToView?.address || "—"}
          </div>
          <div>
            <span className="font-semibold text-theme-light">Customer:</span>{" "}
            {contactToView?.isCustomer ? "Yes" : "No"}
          </div>
          <div>
            <span className="font-semibold text-theme-light">Client:</span>{" "}
            {contactToView?.isClient ? "Yes" : "No"}
          </div>
        </div>
      </Modal>

      {/* Notes Modal (generalizado) */}
      <NotesEditorModal
        isOpen={notesModalOpen}
        title={`Notes – ${leadNotesTitle || ""}`}
        notes={leadNotes}
        loading={notesLoading}
        onChangeNotes={setLeadNotes}
        onClose={handleCloseNotesModal}
        onSave={handleSaveNotes}
      />

      {/* Delete Lead Modal */}
      <DeleteFeedbackModal
        isOpen={deleteModalOpen}
        title="Delete Lead"
        description={
          <>
            Are you sure you want to delete lead{" "}
            <span className="font-semibold text-theme-light">
              {leadToDelete?.leadNumber || leadToDelete?.name}
            </span>
            ?
            <br />
            This action cannot be undone.
          </>
        }
        error={deleteError}
        loading={deleteLoading}
        onClose={() => {
          if (!deleteLoading) {
            setDeleteModalOpen(false);
            setLeadToDelete(null);
            setDeleteError(null);
          }
        }}
        onConfirm={confirmDelete}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </>
  );
}
