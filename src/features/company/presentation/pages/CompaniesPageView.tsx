"use client";

import { NotesEditorModal, DeleteFeedbackModal, EntityCrudPageTemplate } from "@/components/shared";
import { CompaniesTable } from "../organisms/CompaniesTable";
import { CompaniesTableSkeleton } from "../organisms/CompaniesTableSkeleton";
import { CompanyModal } from "../organisms/CompanyModal";
import { ManageServicesModal } from "../organisms/ManageServicesModal";
import { X, Building, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ContactModal } from "@/features/contact/presentation/organisms/ContactModal";
import type { UseCompaniesPageLogicReturn } from "../hooks";
import {
  useCompaniesToolbarSearchController,
  useCompanyContactModalController,
  useCompanyModalController,
  useCompanyNotesModalController,
} from "../hooks";

export interface CompaniesPageViewProps {
  logic: UseCompaniesPageLogicReturn;
}

export function CompaniesPageView({ logic }: CompaniesPageViewProps) {
  // 1) Estructura modular del hook
  const { data, modals, table, quickContact, notes } = logic;

  // 2) Datos
  const { companies, contacts, services, showSkeleton } = data;

  // 3) Modales
  const {
    create: createModal,
    edit: editModal,
    services: servicesModal,
    contact: contactModal,
  } = modals;

  // 4) Tabla
  const {
    rows,
    totalCount,
    filteredCount,
    deleteModalProps,
    getContextMenuItems,
    // 🔴 OJO: aquí usamos searchState, NO search
    searchState,
  } = table;

  const {
    searchQuery,
    searchField,
    setSearchQuery,
    setSearchField,
  } = searchState;

  // 5) Quick contact
  const {
    formValue: contactFormValue,
    isSubmitting: isContactSubmitting,
    error: contactError,
    handleChange: handleContactFormChange,
    handleSubmit: handleContactSubmit,
    handleClose: handleContactModalClose,
  } = quickContact;

  // 6) Notas
  const { modalProps: notesModalProps } = notes;

  // === Controladores de UI ===
  const companyModalController = useCompanyModalController({
    createModal,
    editModal,
  });

  const contactModalController = useCompanyContactModalController({
    isOpen: contactModal.isOpen,
    onClose: handleContactModalClose,
    onSubmit: handleContactSubmit,
    formValue: contactFormValue,
    onFormChange: handleContactFormChange,
    isLoading: isContactSubmitting,
    error: contactError,
  });

  const toolbarSearchController = useCompaniesToolbarSearchController({
    searchQuery,
    searchField,
    setSearchQuery,
    setSearchField,
    filteredCount,
    totalCount,
  });

  const notesModalController = useCompanyNotesModalController({
    isOpen: notesModalProps.isOpen,
    title: notesModalProps.title || "",
    notes: notesModalProps.notes,
    onChangeNotes: notesModalProps.onChangeNotes,
    onClose: notesModalProps.onClose,
    onSave: notesModalProps.onSave,
    loading: notesModalProps.loading,
  });

  return (
    <EntityCrudPageTemplate
      header={
        <header className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-foreground sm:text-2xl">Companies</h1>
            <p className="text-xs text-muted-foreground sm:text-sm">Manage companies and services.</p>
        </header>
      }
      toolbar={
        <div className="flex items-center justify-between gap-3 rounded-xl bg-card p-3">
          <div className="max-w-3xl flex-1">
            <div className="flex items-center gap-2 w-full">
              <div className="w-32 shrink-0">
                <Select value={toolbarSearchController.selectedField} onValueChange={toolbarSearchController.onFieldChange}>
                  <SelectTrigger className="bg-background border-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {toolbarSearchController.searchFields.map((field) => (
                      <SelectItem key={field.value} value={field.value}>
                        {field.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-0 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  value={toolbarSearchController.searchTerm}
                  onChange={(e) => toolbarSearchController.onSearchChange(e.target.value)}
                  placeholder={toolbarSearchController.placeholder}
                  className="pl-9 bg-background border-input"
                />
              </div>
              {toolbarSearchController.searchTerm.trim().length > 0 && (
                <Button
                  type="button"
                  onClick={() => toolbarSearchController.onSearchChange("")}
                  aria-label="Clear search"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              {typeof toolbarSearchController.resultCount === "number" && typeof toolbarSearchController.totalCount === "number" && (
                <span className="whitespace-nowrap text-[10px] text-muted-foreground">
                  Showing {toolbarSearchController.resultCount} of {toolbarSearchController.totalCount} results
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              onClick={createModal.open}
              aria-label="New company"
              size="icon"
              className="bg-[#2c3637] hover:bg-[#2c3637]/90 text-foreground"
            >
              <Building className="size-4" />
            </Button>
          </div>
        </div>
      }
      isLoading={showSkeleton}
      loadingContent={<CompaniesTableSkeleton />}
      tableContent={
        <CompaniesTable
          companies={rows}
          services={services ?? []}
          getContextMenuItems={getContextMenuItems}
          onOpenNotesModal={table.onOpenNotesModal}
          pagination={{ enabled: true }}
        />
      }
      modals={
        <>
          <CompanyModal
            controller={companyModalController}
            services={services ?? []}
            contacts={contacts ?? []}
            onCreateNewContact={() => contactModal.open(companyModalController.mode === 'create' ? 'create' : 'edit')}
          />

          <ContactModal
            controller={contactModalController}
            companies={companies ?? []}
            onCreateNewCompany={createModal.open}
          />

          <ManageServicesModal
            isOpen={servicesModal.isOpen}
            onClose={servicesModal.close}
            services={services ?? []}
          />

          <DeleteFeedbackModal
            isOpen={deleteModalProps.isOpen}
            title="Delete Company"
            description={
              <>
                Are you sure you want to delete company{" "}
                <span className="font-semibold text-foreground">
                  {deleteModalProps.itemToDelete?.name}
                </span>
                ?
                <br />
                This action cannot be undone.
              </>
            }
            error={deleteModalProps.error}
            loading={deleteModalProps.isDeleting}
            onClose={deleteModalProps.onClose}
            onConfirm={deleteModalProps.onConfirm}
          />

          <NotesEditorModal controller={notesModalController} />
        </>
      }
    />
  );
}
