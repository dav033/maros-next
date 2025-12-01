import * as React from "react";
import type { Lead } from "@/leads";
import { deleteLead } from "@/leads";
import { useLeadsApp } from "@/di";
import { getNotesArray } from "@/shared/utils/notes";
import {
  useContextMenu,
  useDeleteModal,
  useNotesModal,
} from "@/shared/ui";
import type { ContextMenuOption } from "@/shared/ui";
import { useToast } from "@/shared/ui/context/ToastContext";
import type { LeadsAppContext } from "@/features/leads/application/context";

interface UseLeadsTableLogicProps {
  leads: Lead[];
  onEdit?: (lead: Lead) => void;
  onDelete?: (leadId: number) => void;
}

export function useLeadsTableLogic({
  leads,
  onEdit,
  onDelete,
}: UseLeadsTableLogicProps) {
  const app = useLeadsApp() as LeadsAppContext & {
    patchLead: (
      id: number,
      patch: { notes?: string[] },
      options?: Record<string, unknown>
    ) => Promise<Lead>;
  };

  const toast = useToast();
  const { isVisible, position, options, show, hide } = useContextMenu();
  const [localLeads, setLocalLeads] = React.useState<Lead[]>(leads);
  const [contactToView, setContactToView] = React.useState<any | null>(null);

  React.useEffect(() => {
    setLocalLeads(leads);
  }, [leads]);

  const {
    deleteModalState,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete,
  } = useDeleteModal<Lead>();

  const {
    notesModalState,
    openNotesModal,
    closeNotesModal,
    updateNotes,
    saveNotes,
  } = useNotesModal<Lead>();

  const handleDeleteLead = React.useCallback(
    async (lead: Lead) => {
      await confirmDelete(async (leadToDelete) => {
        await deleteLead(app, leadToDelete.id);
        setLocalLeads((prev) => prev.filter((l) => l.id !== leadToDelete.id));
        toast?.showSuccess?.("Lead deleted successfully!");
        onDelete?.(leadToDelete.id);
      });
    },
    [app, confirmDelete, toast, onDelete]
  );

  const handleCloseContactModal = React.useCallback(() => {
    setContactToView(null);
  }, []);

  const handleRowContextMenu = React.useCallback(
    (event: React.MouseEvent, lead: Lead) => {
      event.preventDefault();
      const contextOptions: ContextMenuOption[] = [
        {
          id: "edit",
          label: "Edit",
          icon: "lucide:edit",
          action: () => {
            onEdit?.(lead);
            hide();
          },
        },
        {
          id: "delete",
          label: "Delete",
          icon: "lucide:trash-2",
          action: () => {
            openDeleteModal(lead);
            hide();
          },
          danger: true,
        },
      ];
      show(event, contextOptions);
    },
    [show, hide, onEdit, openDeleteModal]
  );

  const handleOpenContactModal = React.useCallback((contact: any) => {
    setContactToView(contact);
  }, []);

  const handleOpenNotesModal = React.useCallback(
    (lead: Lead) => {
      const notes = getNotesArray(lead.notesJson);
      openNotesModal(lead, lead.name, notes);
    },
    [openNotesModal]
  );

  const handleSaveLeadNotes = React.useCallback(async () => {
    await saveNotes(async (lead, notes) => {
      const updated = await app.patchLead(lead.id, { notes }, {});
      setLocalLeads((prev) =>
        prev.map((l) => (l.id === updated.id ? updated : l))
      );
      toast?.showSuccess?.("Notes updated successfully");
    });
  }, [app, saveNotes, toast]);

  return {
    localLeads,
    contextMenu: { isVisible, position, options, hide },
    contactModal: {
      contact: contactToView,
      open: handleOpenContactModal,
      close: handleCloseContactModal,
    },
    deleteModal: {
      state: deleteModalState,
      close: closeDeleteModal,
      handleDelete: handleDeleteLead,
    },
    notesModal: {
      state: notesModalState,
      open: handleOpenNotesModal,
      close: closeNotesModal,
      update: updateNotes,
      save: handleSaveLeadNotes,
    },
    handleRowContextMenu,
  };
}
