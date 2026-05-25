"use client";

import {
  NotesEditorModal,
  DeleteFeedbackModal,
  EntityCrudPageTemplate,
  PageHeaderCard,
  PageToolbarCard,
} from "@/components/shared";
import { CompaniesTable } from "../organisms/CompaniesTable";
import { CompaniesTableSkeleton } from "../organisms/CompaniesTableSkeleton";
import { CompanyModal } from "../organisms/CompanyModal";
import { ManageServicesModal } from "../organisms/ManageServicesModal";
import {
  X,
  Building,
  Building2,
  Search,
  Layers,
  Plus,
  SlidersHorizontal,
  Wrench,
} from "lucide-react";
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
    typeFilter,
    setTypeFilter,
    customerFilter,
    setCustomerFilter,
    clientFilter,
    setClientFilter,
    groupBy,
    setGroupBy,
  } = filterState;

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
        <PageHeaderCard
          icon={Building2}
          title="Companies"
          description="Manage companies, services and accounts"
          rightSlot={
            <>
              <Button
                onClick={() => servicesModal.open()}
                variant="outline"
                aria-label="Manage services"
                className="h-9 gap-2"
              >
                <Wrench className="h-4 w-4" />
                Services
              </Button>
              <Button
                onClick={createModal.open}
                aria-label="New company"
                className="h-9 gap-2"
              >
                <Plus className="h-4 w-4" />
                New company
              </Button>
            </>
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
          <Select value={String(typeFilter)} onValueChange={(v) => setTypeFilter(v as any)}>
            <SelectTrigger className="w-44 bg-background/60 border-border/60 h-9 text-xs">
              <Building className="h-3.5 w-3.5 mr-1.5 shrink-0 text-muted-foreground" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="DESIGN">Design</SelectItem>
              <SelectItem value="HOA">HOA</SelectItem>
              <SelectItem value="GENERAL_CONTRACTOR">Contractor</SelectItem>
              <SelectItem value="SUPPLIER">Supplier</SelectItem>
              <SelectItem value="SUBCONTRACTOR">Subcontractor</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
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
            <SelectTrigger className="w-36 bg-background/60 border-border/60 h-9 text-xs">
              <SelectValue placeholder="Supplier" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">All suppliers</SelectItem>
              <SelectItem value="true">Supplier: Yes</SelectItem>
              <SelectItem value="false">Supplier: No</SelectItem>
            </SelectContent>
          </Select>
          <Select value={groupBy} onValueChange={(v) => setGroupBy(v as any)}>
            <SelectTrigger className="w-40 bg-background/60 border-border/60 h-9 text-xs">
              <Layers className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="none">No grouping</SelectItem>
              <SelectItem value="type">By type</SelectItem>
              <SelectItem value="customer">By customer</SelectItem>
              <SelectItem value="client">By client</SelectItem>
            </SelectContent>
          </Select>
        </PageToolbarCard>
      }
      isLoading={showSkeleton}
      loadingContent={<CompaniesTableSkeleton />}
      tableContent={
        <CompaniesTable
          companies={rows}
          services={services ?? []}
          getContextMenuItems={getContextMenuItems}
          onOpenNotesModal={table.onOpenNotesModal}
          groupBy={groupBy}
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
