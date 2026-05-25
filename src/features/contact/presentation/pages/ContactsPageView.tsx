"use client";

import {
  NotesEditorModal,
  DeleteFeedbackModal,
  EntityCrudPageTemplate,
  PageHeaderCard,
  PageToolbarCard,
} from "@/components/shared";
import type { Contact } from "@/contact";
import { X, UserPlus, Users, Search, Layers, Plus, SlidersHorizontal } from "lucide-react";
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
    filterState,
  } = table;

  const {
    searchQuery,
    searchField,
    setSearchQuery,
    setSearchField,
  } = searchState;

  const {
    customerFilter,
    setCustomerFilter,
    clientFilter,
    setClientFilter,
    groupBy,
    setGroupBy,
  } = filterState;

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
        <PageHeaderCard
          icon={Users}
          title="Contacts"
          description="Manage people and customers connected to your projects"
          rightSlot={
            <Button onClick={crud.openCreate} aria-label="New contact" className="h-9 gap-2">
              <Plus className="h-4 w-4" />
              New contact
            </Button>
          }
        />
      }
      toolbar={
        <PageToolbarCard
          icon={SlidersHorizontal}
          label="Filters & search"
          resultCount={toolbarSearchController.resultCount}
          totalCount={toolbarSearchController.totalCount}
        >
          <div className="w-32 shrink-0">
            <Select value={toolbarSearchController.selectedField} onValueChange={toolbarSearchController.onFieldChange}>
              <SelectTrigger className="bg-background/60 border-border/60 h-9 text-xs">
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
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              value={toolbarSearchController.searchTerm}
              onChange={(e) => toolbarSearchController.onSearchChange(e.target.value)}
              placeholder={toolbarSearchController.placeholder}
              className="pl-9 bg-background/60 border-border/60 h-9"
            />
            {toolbarSearchController.searchTerm.trim().length > 0 && (
              <Button
                type="button"
                onClick={() => toolbarSearchController.onSearchChange("")}
                aria-label="Clear search"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 px-0 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
          <Select value={String(customerFilter)} onValueChange={(v) => setCustomerFilter(v === "all" ? "all" : v === "true")}>
            <SelectTrigger className="w-36 bg-background/60 border-border/60 h-9 text-xs">
              <SelectValue placeholder="Customer" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">All customers</SelectItem>
              <SelectItem value="true">Customer: Yes</SelectItem>
              <SelectItem value="false">Customer: No</SelectItem>
            </SelectContent>
          </Select>
          <Select value={String(clientFilter)} onValueChange={(v) => setClientFilter(v === "all" ? "all" : v === "true")}>
            <SelectTrigger className="w-32 bg-background/60 border-border/60 h-9 text-xs">
              <SelectValue placeholder="Client" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">All clients</SelectItem>
              <SelectItem value="true">Client: Yes</SelectItem>
              <SelectItem value="false">Client: No</SelectItem>
            </SelectContent>
          </Select>
          <Select value={groupBy} onValueChange={(v) => setGroupBy(v as any)}>
            <SelectTrigger className="w-40 bg-background/60 border-border/60 h-9 text-xs">
              <Layers className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="none">No grouping</SelectItem>
              <SelectItem value="customer">By customer</SelectItem>
              <SelectItem value="client">By client</SelectItem>
              <SelectItem value="company">By company</SelectItem>
            </SelectContent>
          </Select>
        </PageToolbarCard>
      }
      isLoading={showSkeleton}
      loadingContent={<ContactsTableSkeleton />}
      tableContent={
        <ContactsTable
          tableLogic={table}
          companies={companies}
          isLoading={showSkeleton}
          groupBy={groupBy}
          pagination={{ enabled: true }}
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
