"use client";

import { useId, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, Folder, FolderOpen, GripVertical } from "lucide-react";
import { motion } from "motion/react";
import { usePrefersReducedMotion } from "@/shared/presentation/hooks/usePrefersReducedMotion";
import type { TaskWorkspaceFolder } from "../../domain";

type FolderPositionUpdate = { id: number; position: number };

type Props = {
  folders: TaskWorkspaceFolder[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  canReorder?: boolean;
  onReorder?: (updates: FolderPositionUpdate[]) => Promise<void>;
};

function SortableFolder({
  folder,
  depth,
  selected,
  canReorder,
  prefersReducedMotion,
  hasChildren,
  expanded,
  onSelect,
  onToggle,
  children,
}: {
  folder: TaskWorkspaceFolder;
  depth: number;
  selected: boolean;
  canReorder: boolean;
  prefersReducedMotion: boolean;
  hasChildren: boolean;
  expanded: boolean;
  onSelect: (id: number) => void;
  onToggle: (id: number) => void;
  children: React.ReactNode;
}) {
  const childrenId = useId();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: folder.id, disabled: !canReorder });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: prefersReducedMotion ? undefined : transition,
        paddingLeft: `${depth * 16}px`,
      }}
      className={isDragging ? "relative z-10 opacity-60" : undefined}
    >
      <div className="flex items-center gap-1">
        {hasChildren ? (
          <button
            type="button"
            aria-label={`${expanded ? "Plegar" : "Desplegar"} carpeta ${folder.title}`}
            aria-expanded={expanded}
            aria-controls={childrenId}
            onClick={() => onToggle(folder.id)}
            className="shrink-0 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <motion.span
              className="flex"
              animate={{ rotate: expanded ? 0 : -90 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.16 }}
            >
              <ChevronDown className="size-3.5" aria-hidden="true" />
            </motion.span>
          </button>
        ) : (
          <span className="size-6 shrink-0" aria-hidden="true" />
        )}
        <button
          type="button"
          onClick={() => onSelect(folder.id)}
          aria-current={selected ? "true" : undefined}
          className={`flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted ${selected ? "bg-muted font-medium" : ""}`}
        >
          {selected ? (
            <FolderOpen
              className="h-4 w-4 shrink-0 text-primary"
              aria-hidden="true"
            />
          ) : (
            <Folder
              className="h-4 w-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
          )}
          <span className="truncate">{folder.title}</span>
        </button>
        {canReorder ? (
          <button
            type="button"
            {...attributes}
            {...listeners}
            aria-label={`Reordenar carpeta ${folder.title}`}
            className="touch-none rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <GripVertical className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>
      {hasChildren ? (
        <motion.div
          id={childrenId}
          aria-hidden={!expanded}
          inert={!expanded}
          initial={false}
          animate={{ height: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.18,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{ overflow: "hidden", pointerEvents: expanded ? "auto" : "none" }}
        >
          {children}
        </motion.div>
      ) : null}
    </div>
  );
}

function nextPositions(
  ordered: TaskWorkspaceFolder[],
  movedIndex: number,
): FolderPositionUpdate[] {
  const before = ordered[movedIndex - 1];
  const after = ordered[movedIndex + 1];
  const moved = ordered[movedIndex];

  if (before && after && after.position - before.position > 1) {
    return [
      {
        id: moved.id,
        position: Math.floor((before.position + after.position) / 2),
      },
    ];
  }
  if (!before && after && after.position > 0) {
    return [{ id: moved.id, position: after.position - 1 }];
  }
  if (before && !after) {
    return [{ id: moved.id, position: before.position + 1 }];
  }

  return ordered.map((folder, index) => ({
    id: folder.id,
    position: (index + 1) * 1000,
  }));
}

export function WorkspaceFolderTree({
  folders,
  selectedId,
  onSelect,
  canReorder = false,
  onReorder,
}: Props) {
  const dndContextId = useId();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [collapsedFolderIds, setCollapsedFolderIds] = useState<Set<number>>(
    () => new Set(),
  );
  const [optimisticPositions, setOptimisticPositions] = useState<
    Record<number, number>
  >({});
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const sortedFolders = folders
    .map((folder) => ({
      ...folder,
      position: optimisticPositions[folder.id] ?? folder.position,
    }))
    .sort((a, b) => a.position - b.position || a.id - b.id);
  const roots = sortedFolders.filter((folder) => folder.parentFolderId == null);
  const childrenOf = (parentId: number) =>
    sortedFolders.filter((folder) => folder.parentFolderId === parentId);
  const toggleFolder = (folderId: number) => {
    setCollapsedFolderIds((current) => {
      const next = new Set(current);
      if (next.has(folderId)) next.delete(folderId);
      else next.add(folderId);
      return next;
    });
  };
  const detectSiblingCollision = (
    args: Parameters<typeof closestCenter>[0],
  ) => {
    const activeFolder = sortedFolders.find(
      (folder) => folder.id === Number(args.active.id),
    );
    if (!activeFolder) return closestCenter(args);
    const siblingIds = new Set(
      sortedFolders
        .filter(
          (folder) => folder.parentFolderId === activeFolder.parentFolderId,
        )
        .map((folder) => folder.id),
    );
    return closestCenter({
      ...args,
      droppableContainers: args.droppableContainers.filter((container) =>
        siblingIds.has(Number(container.id)),
      ),
    });
  };

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id || !canReorder || !onReorder) return;
    const activeFolder = sortedFolders.find(
      (folder) => folder.id === Number(active.id),
    );
    const overFolder = sortedFolders.find(
      (folder) => folder.id === Number(over.id),
    );
    if (
      !activeFolder ||
      !overFolder ||
      activeFolder.parentFolderId !== overFolder.parentFolderId
    )
      return;

    const siblings = sortedFolders
      .filter((folder) => folder.parentFolderId === activeFolder.parentFolderId)
      .sort((a, b) => a.position - b.position || a.id - b.id);
    const oldIndex = siblings.findIndex(
      (folder) => folder.id === activeFolder.id,
    );
    const newIndex = siblings.findIndex(
      (folder) => folder.id === overFolder.id,
    );
    if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return;

    const ordered = arrayMove(siblings, oldIndex, newIndex);
    const updates = nextPositions(ordered, newIndex);
    setOptimisticPositions((current) => ({
      ...current,
      ...Object.fromEntries(updates.map(({ id, position }) => [id, position])),
    }));
    try {
      await onReorder(updates);
    } finally {
      setOptimisticPositions({});
    }
  };

  const renderFolder = (
    folder: TaskWorkspaceFolder,
    depth = 0,
  ): React.ReactNode => {
    const children = childrenOf(folder.id);
    return (
      <SortableFolder
        key={folder.id}
        folder={folder}
        depth={depth}
        selected={selectedId === folder.id}
        canReorder={canReorder}
        prefersReducedMotion={prefersReducedMotion}
        hasChildren={children.length > 0}
        expanded={!collapsedFolderIds.has(folder.id)}
        onSelect={onSelect}
        onToggle={toggleFolder}
      >
        {children.length > 0 ? (
          <SortableContext
            items={children.map((child) => child.id)}
            strategy={verticalListSortingStrategy}
          >
            {children.map((child) => renderFolder(child, depth + 1))}
          </SortableContext>
        ) : null}
      </SortableFolder>
    );
  };

  return (
    <DndContext
      id={`workspace-folder-tree-${dndContextId}`}
      sensors={sensors}
      collisionDetection={detectSiblingCollision}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-0.5">
        <button
          type="button"
          onClick={() => onSelect(null)}
          aria-current={selectedId == null ? "true" : undefined}
          className={`w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted ${selectedId == null ? "bg-muted font-medium" : ""}`}
        >
          Todas las tareas del espacio
        </button>
        <SortableContext
          items={roots.map((folder) => folder.id)}
          strategy={verticalListSortingStrategy}
        >
          {roots.map((folder) => renderFolder(folder))}
        </SortableContext>
      </div>
    </DndContext>
  );
}
