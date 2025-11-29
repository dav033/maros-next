"use client";

import * as React from "react";
import type { Company } from "../../domain/models";
import { companyCrudUseCases } from "../../application";
import { useCompanyApp } from "@/di";
import {
  ContextMenu,
  SimpleTable,
  useContextMenu,
  StatusBadge,
  Icon,
} from "@/shared/ui";
import { CompaniesToolbar } from "./CompaniesToolbar";
import type { SimpleTableColumn, ContextMenuOption } from "@/shared/ui";
import { DeleteFeedbackModal } from "@/shared/ui/molecules/DeleteFeedbackModal";
import { NotesEditorModal } from "@/shared/ui/molecules/NotesEditorModal";

export interface CompaniesTableProps {
  companies: Company[];
  isLoading?: boolean;
  onEdit: (company: Company) => void;
  onDelete: (companyId: number) => void;
  services?: Array<{ id: number; name: string; color?: string | null }>;
}

export function CompaniesTable({
  companies,
  isLoading,
  onEdit,
  onDelete,
  services = [],
}: CompaniesTableProps) {
  const { isVisible, position, options, show, hide } = useContextMenu();
  const app = useCompanyApp();


  // 🔹 Estado local de companies para mantener la tabla sincronizada
  const [localCompanies, setLocalCompanies] = React.useState<Company[]>(companies);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchField, setSearchField] = React.useState("all");

  React.useEffect(() => {
    setLocalCompanies(companies);
  }, [companies]);

  // Filtrar companies por campo y término de búsqueda
  const filteredCompanies = React.useMemo(() => {
    if (!searchQuery.trim()) return localCompanies;
    const term = searchQuery.toLowerCase();
    return localCompanies.filter((c) => {
      if (searchField === "all") {
        return (
          c.name?.toLowerCase().includes(term) ||
          c.address?.toLowerCase().includes(term) ||
          c.type?.toLowerCase().includes(term) ||
          (c.serviceId && services.find(s => s.id === c.serviceId)?.name?.toLowerCase().includes(term))
        );
      }
      if (searchField === "name") return c.name?.toLowerCase().includes(term);
      if (searchField === "address") return c.address?.toLowerCase().includes(term);
      if (searchField === "type") return c.type?.toLowerCase().includes(term);
      if (searchField === "service") return c.serviceId && services.find(s => s.id === c.serviceId)?.name?.toLowerCase().includes(term);
      return true;
    });
  }, [localCompanies, searchQuery, searchField, services]);

  // Estado para notas
  const [companyNotesModalOpen, setCompanyNotesModalOpen] =
    React.useState(false);
  const [companyNotes, setCompanyNotes] = React.useState<string[]>([]);
  const [companyNotesTitle, setCompanyNotesTitle] = React.useState<string>("");
  const [companyNotesCompanyId, setCompanyNotesCompanyId] = React.useState<
    number | null
  >(null);
  const [companyNotesLoading, setCompanyNotesLoading] = React.useState(false);

  const handleOpenCompanyNotesModal = React.useCallback((company: Company) => {
    setCompanyNotes(Array.isArray(company.notes) ? company.notes : []);
    setCompanyNotesTitle(company.name);
    setCompanyNotesCompanyId(company.id);
    setCompanyNotesModalOpen(true);
  }, []);

  const handleCloseCompanyNotesModal = React.useCallback(() => {
    if (companyNotesLoading) return;
    setCompanyNotesModalOpen(false);
    setCompanyNotes([]);
    setCompanyNotesCompanyId(null);
    setCompanyNotesTitle("");
  }, [companyNotesLoading]);

  const handleSaveCompanyNotes = React.useCallback(async () => {
    if (!companyNotesCompanyId) {
      setCompanyNotesModalOpen(false);
      return;
    }
    setCompanyNotesLoading(true);
    try {
      // Enviamos 'notes' como array y asumimos que devuelve la Company actualizada
      const updated = await companyCrudUseCases.update(app)(
        companyNotesCompanyId,
        {
          notes: companyNotes ?? [],
        }
      );

      // 🔹 Actualizar estado local con la company actualizada
      setLocalCompanies((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );

      setCompanyNotesModalOpen(false);
    } catch (e) {
      console.error("Error updating company notes", e);
    } finally {
      setCompanyNotesLoading(false);
    }
  }, [app, companyNotesCompanyId, companyNotes]);

  const columns = React.useMemo<SimpleTableColumn<Company>[]>(() => {
    return [
      {
        key: "notes",
        header: "Notes",
        className: "w-[80px] text-center",
        render: (company: Company) => (
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-theme-border/60 bg-theme-dark/70 px-2.5 py-1 text-xs text-theme-muted hover:bg-theme-primary/90 hover:text-white transition-colors duration-150"
            title="View notes"
            onClick={() => handleOpenCompanyNotesModal(company)}
          >
            <Icon name="lucide:sticky-note" size={16} />
          </button>
        ),
        sortable: false,
      },
      {
        key: "name",
        header: "Name",
        className: "w-[200px]",
        render: (company: Company) => (
          <span className="text-theme-light">{company.name}</span>
        ),
        sortable: true,
        sortValue: (company: Company) => company.name ?? "",
      },
      {
        key: "address",
        header: "Address",
        className: "w-[250px]",
        render: (company: Company) => (
          <span className="text-gray-300">{company.address ?? "—"}</span>
        ),
        sortable: true,
        sortValue: (company: Company) => company.address ?? "",
      },
      {
        key: "type",
        header: "Type",
        className: "w-[120px]",
        render: (company: Company) => (
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
              company.type === "SUBCONTRACTOR"
                ? "bg-blue-500/15 text-blue-400"
                : company.type === "GENERAL_CONTRACTOR"
                ? "bg-green-500/15 text-green-400"
                : company.type === "SUPPLIER"
                ? "bg-yellow-500/15 text-yellow-400"
                : company.type === "HOA"
                ? "bg-purple-500/15 text-purple-400"
                : company.type === "OTHER"
                ? "bg-gray-500/15 text-gray-400"
                : "bg-theme-gray-subtle text-gray-300"
            }`}
          >
            {company.type ?? "No type"}
          </span>
        ),
        sortable: true,
        sortValue: (company: Company) => company.type ?? "",
      },
      {
        key: "service",
        header: "Service",
        className: "w-[150px]",
        render: (company: Company) => {
          const service = services.find((s) => s.id === company.serviceId);
          if (!service) {
            return <span className="text-gray-400">—</span>;
          }
          const bgColor = service.color || "#000000";
          return (
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: `${bgColor}20`,
                color: bgColor === "#000000" ? "#9ca3af" : bgColor,
                borderColor: `${bgColor}40`,
                borderWidth: "1px",
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: bgColor }}
              />
              {service.name}
            </span>
          );
        },
        sortable: true,
        sortValue: (company: Company) => {
          const service = services.find((s) => s.id === company.serviceId);
          return service?.name ?? "";
        },
      },
      {
        key: "isCustomer",
        header: "Customer",
        className: "w-[100px] text-right",
        render: (company: Company) => (
          <StatusBadge status={company.isCustomer} />
        ),
        sortable: true,
        sortValue: (company: Company) =>
          company.isCustomer ? "Yes" : "No",
      },
      {
        key: "isClient",
        header: "Client",
        className: "w-[100px] text-right",
        render: (company: Company) => (
          <StatusBadge status={company.isClient} />
        ),
        sortable: true,
        sortValue: (company: Company) =>
          company.isClient ? "Yes" : "No",
      },
    ];
  }, [services, handleOpenCompanyNotesModal]);

  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [companyToDelete, setCompanyToDelete] = React.useState<Company | null>(
    null
  );
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  async function handleDeleteCompany(company: Company) {
    setCompanyToDelete(company);
    setDeleteModalOpen(true);
    setDeleteError(null);
  }

  async function confirmDelete() {
    if (!companyToDelete) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await companyCrudUseCases.delete(app)(companyToDelete.id);

      // 🔹 Actualizamos estado local
      setLocalCompanies((prev) =>
        prev.filter((c) => c.id !== companyToDelete.id)
      );

      onDelete(companyToDelete.id);
      setDeleteModalOpen(false);
      setCompanyToDelete(null);
    } catch (error: unknown) {
      setDeleteError("Failed to delete company. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  }

  function handleRowContextMenu(
    event: React.MouseEvent<HTMLTableRowElement>,
    company: Company
  ) {
    const contextOptions: ContextMenuOption[] = [
      {
        id: "edit",
        label: "Edit",
        icon: "lucide:edit",
        action: () => {
          onEdit(company);
          hide();
        },
      },
      {
        id: "delete",
        label: "Delete",
        icon: "lucide:trash-2",
        action: () => {
          handleDeleteCompany(company);
          hide();
        },
        danger: true,
      },
    ];
    show(event, contextOptions);
  }

  if (!localCompanies || localCompanies.length === 0) {
    if (isLoading) {
      return (
        <div className="rounded-2xl border border-theme-border/60 bg-theme-dark/40 p-4 text-sm text-theme-muted">
          Loading companies...
        </div>
      );
    }
    return (
      <div className="rounded-2xl border border-dashed border-theme-border/60 bg-theme-dark/40 p-4 text-sm text-theme-muted">
        No companies found.
      </div>
    );
  }

  return (
    <>
      <div className="mb-2">
        <CompaniesToolbar
          searchQuery={searchQuery}
          searchField={searchField}
          onSearchQueryChange={setSearchQuery}
          onSearchFieldChange={setSearchField}
          totalCount={localCompanies.length}
          filteredCount={filteredCompanies.length}
        />
      </div>
      <SimpleTable<Company>
        columns={columns}
        data={filteredCompanies}
        rowKey={(company) => company.id}
        onRowContextMenu={handleRowContextMenu}
      />

      <ContextMenu
        isOpen={isVisible}
        position={position}
        onClose={hide}
        options={Array.isArray(options) ? options : []}
      />

      <NotesEditorModal
        isOpen={companyNotesModalOpen}
        title={`Notes – ${companyNotesTitle || ""}`}
        notes={companyNotes}
        loading={companyNotesLoading}
        onChangeNotes={setCompanyNotes}
        onClose={handleCloseCompanyNotesModal}
        onSave={handleSaveCompanyNotes}
      />

      <DeleteFeedbackModal
        isOpen={deleteModalOpen}
        title="Delete Company"
        description={
          <>
            Are you sure you want to delete company{" "}
            <span className="font-semibold text-theme-light">
              {companyToDelete?.name}
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
            setCompanyToDelete(null);
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
