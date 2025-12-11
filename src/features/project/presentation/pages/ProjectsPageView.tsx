"use client";

import type { Project } from "@/project/domain";
import { ProjectsTable } from "@/project/presentation";
import { DeleteFeedbackModal, NotesEditorModal } from "@dav033/dav-components";
import { ProjectModal } from "../organisms/ProjectModal";
import { PaymentsModal } from "../organisms/PaymentsModal";
import { TableToolbar, SimplePageHeader, Icon } from "@dav033/dav-components";
import { ProjectsTableSkeleton } from "../organisms/ProjectsTableSkeleton";
import { EntityCrudPageTemplate } from "@dav033/dav-components";
import type { UseProjectsPageLogicReturn } from "./useProjectsPageLogic";
import { useProjectsToolbarSearchController } from "../hooks/table/useProjectsToolbarSearchController";
import { useProjectsNotesModalController } from "../hooks/modals/useProjectsNotesModalController";
import { useInstantLeadsByType } from "@/leads/presentation";
import { LeadType } from "@/leads/domain";

export interface ProjectsPageViewProps {
  logic: UseProjectsPageLogicReturn;
}

export function ProjectsPageView({ logic }: ProjectsPageViewProps) {
  const { data, crud, table, notesModal, openNotesModal, paymentsModal } = logic;

  const { projects, showSkeleton } = data;

  const {
    isCreateModalOpen,
    openCreateModal,
    closeCreateModal,
    createController,
    isEditModalOpen,
    selectedProject,
    openEditModal,
    closeEditModal,
    updateController,
  } = crud;

  const {
    rows,
    totalCount,
    filteredCount,
    searchState,
    deleteModalProps,
    getContextMenuItems,
  } = table;

  const { searchQuery, searchField, setSearchQuery, setSearchField } =
    searchState;

  // Obtener todos los leads para el select
  const allLeads = useInstantLeadsByType(LeadType.CONSTRUCTION);
  const plumbingLeads = useInstantLeadsByType(LeadType.PLUMBING);
  const roofingLeads = useInstantLeadsByType(LeadType.ROOFING);
  
  const leads = [
    ...(allLeads.leads ?? []),
    ...(plumbingLeads.leads ?? []),
    ...(roofingLeads.leads ?? []),
  ];

  const toolbarSearchController = useProjectsToolbarSearchController({
    searchQuery,
    searchField,
    setSearchQuery,
    setSearchField,
    filteredCount,
    totalCount,
  });

  const notesModalController = useProjectsNotesModalController({
    isOpen: notesModal.isOpen,
    title: notesModal.title,
    notes: notesModal.notes,
    onChangeNotes: notesModal.onChangeNotes,
    onClose: notesModal.onClose,
    onSave: notesModal.onSave,
    loading: notesModal.loading,
  });

  const projectModalController = {
    isOpen: isCreateModalOpen || isEditModalOpen,
    mode: (isCreateModalOpen ? "create" : "edit") as "create" | "edit",
    onClose: isCreateModalOpen ? closeCreateModal : closeEditModal,
    createController: isCreateModalOpen ? createController : undefined,
    updateController: isEditModalOpen ? updateController : undefined,
    project: selectedProject,
  };

  return (
    <EntityCrudPageTemplate
      header={
        <SimplePageHeader
          title="Projects"
          description="Manage your projects"
        />
      }
      toolbar={
        <TableToolbar
          search={toolbarSearchController}
          onCreate={openCreateModal}
          createLabel="New Project"
          createIcon={<Icon name="mdi:folder-plus-outline" size={18} />}
        />
      }
      isLoading={showSkeleton}
      loadingContent={<ProjectsTableSkeleton />}
      tableContent={
        <ProjectsTable
          tableLogic={table}
          isLoading={showSkeleton}
          onOpenNotesModal={openNotesModal}
        />
      }
      modals={
        <>
          <DeleteFeedbackModal
            isOpen={deleteModalProps.isOpen}
            title="Delete Project"
            description={
              <>
                Are you sure you want to delete project{" "}
                <span className="font-semibold text-theme-light">
                  {selectedProject?.lead.name}
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

          <ProjectModal
            controller={projectModalController}
            leads={leads}
          />

          <NotesEditorModal controller={notesModalController} />

          <PaymentsModal controller={paymentsModal} />
        </>
      }
    />
  );
}

