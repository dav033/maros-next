"use client";

import { NotesEditorModal } from "@/components/custom";
import type { Contact } from "@/contact";
import { EntityCrudPageTemplate,
  DeleteFeedbackModal } from "@/components/custom";
import { X, UserPlus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// TODO: NotesEditorModal needs to be migrated separately
import { ContactsTable } from "../organisms/ContactsTable";
import { ContactsTableSkeleton } from "../organisms/ContactsTableSkeleton";
import { ContactModal } from "../organisms/ContactModal";
import { CompanyModal } from "@/features/company/presentation/organisms/CompanyModal";
import { CompanyDetailsModal } from "../organisms/CompanyDetailsModal";
import type { UseContactsPageLogicReturn } from "../hooks";
import {
  useContactCompanyModalController,
  useContactModalController,
  useContactsNotesModalController,
  useContactsToolbarSearchController,
} from "../hooks";

export interface ContactsPageViewProps {
  logic: UseContactsPageLogicReturn;
}

export function ContactsPageView({ logic }: ContactsPageViewProps) {
  const {
    data,
    crud,
    table,
    companyModal,
    notesModal,
    companyDetailsModal,
  } = logic;

  const {
    contacts: filteredContacts,
    companies,
    services,
    showSkeleton,
  } = data;

  const {
    rows: tableFilteredContacts,
    totalCount,
    filteredCount,
    searchState,
  } = table;

  const {
    searchQuery,
    searchField,
    setSearchQuery,
    setSearchField,
  } = searchState;

  const {
    isCompanyModalOpen,
    companyFormValue,
    companyServerError,
    isCompanySubmitting,
    openCompanyModal,
    closeCompanyModal,
    handleCompanyFormChange,
    handleCompanySubmit,
  } = companyModal;

  const contactModalController = useContactModalController({
    mode: crud.mode,
    closeModal: crud.closeModal,
    handleCreateSubmit: crud.handleCreateSubmit,
    handleEditSubmit: crud.handleEditSubmit,
    formValue: crud.formValue,
    handleFormChange: crud.handleFormChange,
    isPending: crud.isPending,
    serverError: crud.serverError,
  });

  const companyModalController = useContactCompanyModalController({
    isOpen: isCompanyModalOpen,
    onClose: closeCompanyModal,
    onSubmit: handleCompanySubmit,
    formValue: companyFormValue,
    onChange: handleCompanyFormChange,
    isSubmitting: isCompanySubmitting,
    serverError: companyServerError,
  });

  const toolbarSearchController = useContactsToolbarSearchController({
    searchQuery,
    searchField,
    setSearchQuery,
    setSearchField,
    filteredCount,
    totalCount,
  });

  const notesModalController = useContactsNotesModalController({
    isOpen: notesModal.isOpen,
    title: notesModal.title,
    notes: notesModal.notes,
    onChangeNotes: notesModal.onChangeNotes,
    onClose: notesModal.onClose,
    onSave: notesModal.onSave,
    loading: notesModal.loading,
  });

  return (
    <EntityCrudPageTemplate
      header={
        <header className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-foreground sm:text-2xl">Contacts</h1>
            <p className="text-xs text-muted-foreground sm:text-sm">Manage people and customers connected to your projects.</p>
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
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                />
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
              onClick={crud.openCreate}
              aria-label="New contact"
              className="whitespace-nowrap text-sm font-medium"
            >
              <span className="mr-2"><UserPlus className="size-4.5" /></span>
              New contact
            </Button>
          </div>
        </div>
      }
      isLoading={showSkeleton}
      loadingContent={<ContactsTableSkeleton />}
      tableContent={
        <ContactsTable
          tableLogic={table}
          companies={companies}
          isLoading={showSkeleton}
        />
      }
      modals={
        <>
          <ContactModal
            controller={contactModalController}
            companies={companies ?? []}
            onCreateNewCompany={openCompanyModal}
          />

          <CompanyModal
            controller={companyModalController}
            services={services ?? []}
            contacts={[]}
          />

          <DeleteFeedbackModal
            isOpen={table.deleteModalProps.isOpen}
            title="Delete Contact"
            description={
              <>
                Are you sure you want to delete contact{" "}
                <span className="font-semibold text-foreground">
                  {table.deleteModalProps.itemToDelete?.name}
                </span>
                ?
                <br />
                This action cannot be undone.
              </>
            }
            error={table.deleteModalProps.error}
            loading={table.deleteModalProps.isDeleting}
            onClose={table.deleteModalProps.onClose}
            onConfirm={table.deleteModalProps.onConfirm}
          />

          <NotesEditorModal controller={notesModalController} />

          <CompanyDetailsModal
            isOpen={companyDetailsModal.isOpen}
            company={companyDetailsModal.company}
            onClose={companyDetailsModal.close}
          />
        </>
      }
    />
  );
}
