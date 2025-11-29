"use client";

import * as React from "react";
import type { Contact } from "@/contact";
import type { Company } from "@/company";
import { useContactsApp } from "@/di";
import {
  ContextMenu,
  SimpleTable,
  useContextMenu,
  StatusBadge,
  Modal,
  Icon,
} from "@/shared/ui";
import type { SimpleTableColumn, ContextMenuOption } from "@/shared/ui";
import { DeleteFeedbackModal } from "@/shared/ui/molecules/DeleteFeedbackModal";
import { NotesEditorModal } from "@/shared/ui/molecules/NotesEditorModal";
import { deleteContact, patchContact } from "@/contact";

export interface ContactsTableProps {
  contacts: Contact[];
  companies?: Company[];
  isLoading?: boolean;
  onEdit: (contact: Contact) => void;
  onDelete: (contactId: number) => void;
}

export function ContactsTable({
  contacts,
  companies = [],
  isLoading,
  onEdit,
  onDelete,
}: ContactsTableProps) {
  const { isVisible, position, options, show, hide } = useContextMenu();
  const app = useContactsApp();

  // 🔹 Estado local de contactos para mantener la tabla sincronizada
  const [localContacts, setLocalContacts] = React.useState<Contact[]>(contacts);

  // Si cambian los contactos que vienen de arriba, sincronizamos
  React.useEffect(() => {
    setLocalContacts(contacts);
  }, [contacts]);

  const [companyModalOpen, setCompanyModalOpen] = React.useState(false);
  const [companyToView, setCompanyToView] = React.useState<Company | null>(
    null
  );

  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [contactToDelete, setContactToDelete] = React.useState<Contact | null>(
    null
  );
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  // Estado para notas de contactos
  const [contactNotesModalOpen, setContactNotesModalOpen] =
    React.useState(false);
  const [contactNotes, setContactNotes] = React.useState<string[]>([]);
  const [contactNotesTitle, setContactNotesTitle] = React.useState<string>("");
  const [contactNotesContactId, setContactNotesContactId] =
    React.useState<number | null>(null);
  const [contactNotesLoading, setContactNotesLoading] = React.useState(false);

  // --- Helpers de compañía (solo vista) ---

  const handleOpenCompanyModal = React.useCallback((company: Company) => {
    setCompanyToView(company);
    setCompanyModalOpen(true);
  }, []);

  const handleCloseCompanyModal = React.useCallback(() => {
    setCompanyModalOpen(false);
    setCompanyToView(null);
  }, []);

  // --- Borrado de contacto ---

  async function handleDeleteContactClick(contact: Contact) {
    setContactToDelete(contact);
    setDeleteError(null);
    setDeleteModalOpen(true);
  }

  async function confirmDelete() {
    if (!contactToDelete) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await deleteContact(app, contactToDelete.id);

      // 🔹 Actualizamos estado local
      setLocalContacts((prev) =>
        prev.filter((c) => c.id !== contactToDelete.id)
      );

      onDelete(contactToDelete.id);
      setDeleteModalOpen(false);
      setContactToDelete(null);
    } catch (error: unknown) {
      setDeleteError("Failed to delete contact. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  }

  // --- Menú contextual por fila ---

  function handleRowContextMenu(
    event: React.MouseEvent<HTMLTableRowElement>,
    contact: Contact
  ) {
    const contextOptions: ContextMenuOption[] = [
      {
        id: "edit",
        label: "Edit",
        icon: "lucide:edit",
        action: () => {
          onEdit(contact);
          hide();
        },
      },
      {
        id: "delete",
        label: "Delete",
        icon: "lucide:trash-2",
        action: () => {
          handleDeleteContactClick(contact);
          hide();
        },
        danger: true,
      },
    ];
    show(event, contextOptions);
  }

  // --- Notas de contacto ---

  const handleOpenContactNotesModal = React.useCallback(
    (contact: Contact) => {
      // Leer directamente desde contact.notes (array)
      setContactNotes(Array.isArray(contact.notes) ? contact.notes : []);
      setContactNotesTitle(contact.name);
      setContactNotesContactId(contact.id);
      setContactNotesModalOpen(true);
    },
    []
  );

  const handleCloseContactNotesModal = React.useCallback(() => {
    if (contactNotesLoading) return;
    setContactNotesModalOpen(false);
    setContactNotes([]);
    setContactNotesContactId(null);
    setContactNotesTitle("");
  }, [contactNotesLoading]);

  const handleSaveContactNotes = React.useCallback(async () => {
    if (!contactNotesContactId) {
      setContactNotesModalOpen(false);
      return;
    }
    setContactNotesLoading(true);
    try {
      // Enviamos "notes" en el patch y asumimos que patchContact devuelve el Contact actualizado
      const updated = await patchContact(app, contactNotesContactId, {
        notes: contactNotes ?? [],
      });

      // 🔹 Actualizamos la lista local con el contacto actualizado
      setLocalContacts((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );

      setContactNotesModalOpen(false);
    } catch (e) {
      console.error("Error updating contact notes", e);
    } finally {
      setContactNotesLoading(false);
    }
  }, [app, contactNotesContactId, contactNotes]);

  // --- Columnas de la tabla ---

  const columns = React.useMemo<SimpleTableColumn<Contact>[]>(() => {
    return [
      {
        key: "notes",
        header: "Notes",
        className: "w-[80px] text-center",
        render: (contact: Contact) => (
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-theme-border/60 bg-theme-dark/70 px-2.5 py-1 text-xs text-theme-muted hover:bg-theme-primary/90 hover:text-white transition-colors duration-150"
            title="View notes"
            onClick={() => handleOpenContactNotesModal(contact)}
          >
            <Icon name="lucide:sticky-note" size={16} />
          </button>
        ),
        sortable: false,
      },
      {
        key: "name",
        header: "Name",
        className: "w-[180px]",
        render: (contact: Contact) => (
          <span className="text-theme-light">{contact.name}</span>
        ),
        sortable: true,
        sortValue: (contact: Contact) => contact.name ?? "",
      },
      {
        key: "company",
        header: "Company",
        className: "w-[180px]",
        render: (contact: Contact) => {
          const company = companies.find((c) => c.id === contact.companyId);
          if (!company) {
            return <span className="text-gray-400">—</span>;
          }
          return (
            <button
              type="button"
              className="group inline-flex w-40 cursor-pointer items-center rounded-full bg-blue-500/10 px-3 py-0.5 pr-4 transition-colors hover:bg-blue-500/20"
              onClick={() => handleOpenCompanyModal(company)}
            >
              <span className="truncate text-sm font-medium text-blue-300 transition-colors group-hover:text-blue-200">
                {company.name}
              </span>
            </button>
          );
        },
        sortable: false,
      },
      {
        key: "occupation",
        header: "Occupation",
        className: "w-[150px]",
        render: (contact: Contact) => (
          <span className="text-gray-300">{contact.occupation ?? "—"}</span>
        ),
        sortable: true,
        sortValue: (contact: Contact) => contact.occupation ?? "",
      },
      {
        key: "phone",
        header: "Phone",
        className: "w-[180px]",
        render: (contact: Contact) => (
          <span className="text-gray-300">{contact.phone ?? "—"}</span>
        ),
        sortable: true,
        sortValue: (contact: Contact) => contact.phone ?? "",
      },
      {
        key: "email",
        header: "Email",
        className: "w-[200px]",
        render: (contact: Contact) => (
          <span className="text-gray-300">{contact.email ?? "—"}</span>
        ),
        sortable: true,
        sortValue: (contact: Contact) => contact.email ?? "",
      },
      {
        key: "isCustomer",
        header: "Customer",
        className: "w-[100px] text-right",
        render: (contact: Contact) => (
          <StatusBadge status={contact.isCustomer} />
        ),
        sortable: true,
        sortValue: (contact: Contact) =>
          contact.isCustomer ? "Yes" : "No",
      },
      {
        key: "isClient",
        header: "Client",
        className: "w-[100px] text-right",
        render: (contact: Contact) => (
          <StatusBadge status={contact.isClient} />
        ),
        sortable: true,
        sortValue: (contact: Contact) =>
          contact.isClient ? "Yes" : "No",
      },
    ];
  }, [companies, handleOpenCompanyModal, handleOpenContactNotesModal]);

  // --- Estado vacío / cargando ---

  if (!localContacts || localContacts.length === 0) {
    if (isLoading) {
      return (
        <div className="rounded-2xl border border-theme-border/60 bg-theme-dark/40 p-4 text-sm text-theme-muted">
          Loading contacts...
        </div>
      );
    }
    return (
      <div className="rounded-2xl border border-dashed border-theme-border/60 bg-theme-dark/40 p-4 text-sm text-theme-muted">
        No contacts found.
      </div>
    );
  }

  return (
    <>
      <SimpleTable<Contact>
        columns={columns}
        data={localContacts}
        rowKey={(contact) => contact.id}
        onRowContextMenu={handleRowContextMenu}
      />

      <ContextMenu
        isOpen={isVisible}
        position={position}
        onClose={hide}
        options={Array.isArray(options) ? options : []}
      />

      <NotesEditorModal
        isOpen={contactNotesModalOpen}
        title={`Notes – ${contactNotesTitle || ""}`}
        notes={contactNotes}
        loading={contactNotesLoading}
        onChangeNotes={setContactNotes}
        onClose={handleCloseContactNotesModal}
        onSave={handleSaveContactNotes}
      />

      <DeleteFeedbackModal
        isOpen={deleteModalOpen}
        title="Delete Contact"
        description={
          <>
            Are you sure you want to delete contact{" "}
            <span className="font-semibold text-theme-light">
              {contactToDelete?.name}
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
            setContactToDelete(null);
            setDeleteError(null);
          }
        }}
        onConfirm={confirmDelete}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />

      {/* Modal de detalle de compañía (solo lectura) */}
      <Modal isOpen={companyModalOpen} onClose={handleCloseCompanyModal}>
        {companyToView ? (
          <div className="space-y-2 p-4">
            <div>
              <span className="font-semibold text-theme-light">Name:</span>{" "}
              {companyToView.name}
            </div>
            <div>
              <span className="font-semibold text-theme-light">Address:</span>{" "}
              {companyToView.address || "—"}
            </div>
            <div>
              <span className="font-semibold text-theme-light">Type:</span>{" "}
              {companyToView.type || "—"}
            </div>
            <div>
              <span className="font-semibold text-theme-light">
                Service ID:
              </span>{" "}
              {companyToView.serviceId ?? "—"}
            </div>
            <div>
              <span className="font-semibold text-theme-light">
                Customer:
              </span>{" "}
              {companyToView.isCustomer ? "Yes" : "No"}
            </div>
            <div>
              <span className="font-semibold text-theme-light">Client:</span>{" "}
              {companyToView.isClient ? "Yes" : "No"}
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
