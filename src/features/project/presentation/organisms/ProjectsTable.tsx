"use client";

import * as React from "react";
import type { Project } from "@/project/domain";
import {
  ContextMenuTable,
  type ContextMenuTableItem,
} from "@dav033/dav-components";
import { useProjectsTableColumns } from "../hooks/table/useProjectsTableColumns";
import type { UseProjectsTableLogicReturn } from "../hooks/table/useProjectsTableLogic";

export interface ProjectsTableProps {
  tableLogic?: UseProjectsTableLogicReturn;
  isLoading?: boolean;
  projects?: Project[];
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
  onOpenNotesModal?: (project: Project) => void;
}

export function ProjectsTable({
  tableLogic,
  isLoading = false,
  projects,
  onEdit,
  onDelete,
  onOpenNotesModal,
}: ProjectsTableProps) {
  const rows = tableLogic?.rows ?? projects ?? [];
  
  const resolvedGetContextMenuItems = React.useMemo<((project: Project) => ContextMenuTableItem[]) | undefined>(() => {
    if (tableLogic?.getContextMenuItems) {
      return tableLogic.getContextMenuItems;
    }

    if (onEdit || onDelete) {
      return (project: Project) => {
        const items = [];
        if (onEdit) {
          items.push({
            label: "Edit",
            onClick: () => onEdit(project),
            icon: "lucide:edit",
          });
        }
        if (onDelete) {
          items.push({
            label: "Delete",
            onClick: () => onDelete(project),
            variant: "danger" as const,
            icon: "lucide:trash",
          });
        }
        return items;
      };
    }

    return undefined;
  }, [onDelete, onEdit, tableLogic?.getContextMenuItems]);

  const columns = useProjectsTableColumns({ onOpenNotesModal });

  return (
    <ContextMenuTable<Project>
      data={rows}
      columns={columns}
      rowKey={(project) => project.id}
      getContextMenuItems={resolvedGetContextMenuItems}
      isLoading={isLoading}
      loadingState={{
        iconName: "lucide:loader-2",
        title: "Loading projects…",
        subtitle: "Please wait while we load your projects.",
      }}
      emptyState={{
        iconName: "lucide:folder-x",
        title: "No projects found",
        subtitle: "Get started by creating a new project.",
      }}
    />
  );
}

