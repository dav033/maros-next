"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  Folder,
  FolderOpen,
  FolderPlus,
  Globe,
  GripVertical,
  MoreHorizontal,
  Plus,
  Star,
  Trash2,
  Users,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { buildNoteTree, flattenVisibleTree, excludeDescendantRows, projectNoteReparent } from "@/notes/domain";
import type { NoteKind, NotePageSummary, VisibleNoteRow } from "@/notes/domain";

// Matches the 16px-per-depth indentation used to render each row below, so a
// horizontal drag of roughly one indent's worth of pixels nests/un-nests a page.
const INDENT_WIDTH = 16;
import { usePersistedState, setStorageCodec } from "@/common/hooks/ui";
import { Button } from "@/components/ui/button";

const EXPANDED_STORAGE_KEY = "maros.notes.expanded";

function RowIcon({ row, isOpen }: { row: VisibleNoteRow; isOpen: boolean }) {
  if (row.icon) return <>{row.icon}</>;
  if (row.kind === "folder") {
    const Icon = isOpen ? FolderOpen : Folder;
    return <Icon className="h-3.5 w-3.5 text-muted-foreground" />;
  }
  return <FileText className="h-3.5 w-3.5 text-muted-foreground" />;
}

function SortableNoteTreeRow({
  row,
  isOpen,
  isActive,
  onToggle,
  onCreateChild,
  onSetFavorite,
  onTrash,
}: {
  row: VisibleNoteRow;
  isOpen: boolean;
  isActive: boolean;
  onToggle: (id: number) => void;
  onCreateChild: (parentId: number, kind?: NoteKind) => void;
  onSetFavorite: (id: number, isFavorite: boolean) => void;
  onTrash: (id: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: row.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={cn(
          "group flex items-center gap-1 rounded-md px-1 py-1.5 text-sm hover:bg-accent/50",
          isActive && "bg-accent text-accent-foreground"
        )}
        style={{ paddingLeft: 4 + row.depth * 16 }}
      >
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="flex h-6 w-6 shrink-0 cursor-grab touch-none items-center justify-center rounded text-muted-foreground hover:bg-accent sm:hidden sm:h-5 sm:w-5 sm:group-hover:flex"
          aria-label="Drag to reorder"
          title="Drag to reorder"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onToggle(row.id)}
          aria-label={row.hasChildren ? (isOpen ? "Collapse" : "Expand") : undefined}
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-accent sm:h-5 sm:w-5 sm:group-hover:hidden",
            !row.hasChildren && "invisible"
          )}
        >
          {isOpen ? "▾" : "▸"}
        </button>
        <Link
          href={`/notes/${row.id}`}
          className="flex min-w-0 flex-1 items-center gap-1.5 truncate"
        >
          <span className="shrink-0">
            <RowIcon row={row} isOpen={isOpen} />
          </span>
          <span className="truncate">{row.title || "Untitled"}</span>
          {/* Two states worth seeing at a glance from the tree: this note left the
              building, and this note was handed to someone. Both stay visible rather
              than appearing on hover — that is the point of them. */}
          {row.isPublished && (
            <Globe
              className="h-3 w-3 shrink-0 text-emerald-600 dark:text-emerald-400"
              aria-label="Published on the web"
            />
          )}
          {row.isShared && !row.isPublished && (
            <Users
              className="h-3 w-3 shrink-0 text-muted-foreground"
              aria-label="Shared with specific people"
            />
          )}
        </Link>
        <button
          type="button"
          onClick={() => onSetFavorite(row.id, !row.isFavorite)}
          // A starred page keeps its star visible; the rest only reveal it on hover,
          // so the tree doesn't turn into a wall of icons.
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-accent sm:hidden sm:h-5 sm:w-5 sm:group-hover:flex",
            row.isFavorite && "sm:flex"
          )}
          title={row.isFavorite ? "Remove from favorites" : "Add to favorites"}
          aria-label={row.isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Star
            className={cn("h-3.5 w-3.5", row.isFavorite && "fill-amber-400 text-amber-400")}
          />
        </button>
        <button
          type="button"
          onClick={() => onCreateChild(row.id)}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-accent sm:hidden sm:h-5 sm:w-5 sm:group-hover:flex"
          title="Add sub-page"
          aria-label="Add sub-page"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-accent sm:hidden sm:h-5 sm:w-5 sm:group-hover:flex data-[state=open]:flex"
              title="More actions"
              aria-label="More actions"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44">
            <DropdownMenuItem onSelect={() => onCreateChild(row.id, "page")}>
              <Plus className="mr-2 h-3.5 w-3.5" />
              New page inside
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onCreateChild(row.id, "folder")}>
              <FolderPlus className="mr-2 h-3.5 w-3.5" />
              New folder inside
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onSetFavorite(row.id, !row.isFavorite)}>
              <Star className="mr-2 h-3.5 w-3.5" />
              {row.isFavorite ? "Remove from favorites" : "Add to favorites"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={() => onTrash(row.id)}
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Move to trash
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export function NoteTreePanel({
  pages,
  onCreateRoot,
  onCreateChild,
  onMove,
  onSetFavorite,
  onTrash,
}: {
  pages: NotePageSummary[];
  onCreateRoot: (kind?: NoteKind) => void;
  onCreateChild: (parentId: number, kind?: NoteKind) => void;
  onMove: (
    id: number,
    parentId: number | null,
    beforeId: number | null,
    afterId: number | null
  ) => void;
  onSetFavorite: (id: number, isFavorite: boolean) => void;
  onTrash: (id: number) => void;
}) {
  const pathname = usePathname();
  const [expandedIds, setExpandedIds] = usePersistedState<Set<string>>(
    EXPANDED_STORAGE_KEY,
    new Set<string>(),
    setStorageCodec
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const tree = buildNoteTree(pages);
  const visibleRows = flattenVisibleTree(tree, expandedIds);

  const toggle = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      const key = String(id);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over, delta } = event;
    if (!over || active.id === over.id) return;

    const activeId = Number(active.id);
    const overId = Number(over.id);

    // Exclude the dragged page's own descendants first: they can't be valid drop
    // targets or position anchors for it (that would be a cycle), and since the
    // list is a depth-first flatten, removing them also keeps sibling-boundary
    // detection correct for everything below the dragged subtree.
    const rowsForProjection = excludeDescendantRows(
      visibleRows.map((r) => ({ id: r.id, depth: r.depth })),
      activeId
    );
    // Dragging right nests the page one level deeper per indent-width of horizontal
    // movement; dragging left un-nests it. Vertical-only drags (delta.x ≈ 0) just reorder.
    const dragDepthDelta = Math.round(delta.x / INDENT_WIDTH);
    const projection = projectNoteReparent(rowsForProjection, activeId, overId, dragDepthDelta);
    if (!projection) return;

    onMove(activeId, projection.parentId, projection.beforeId, projection.afterId);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-2 py-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Notes
        </span>
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            title="New folder"
            onClick={() => onCreateRoot("folder")}
          >
            <FolderPlus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            title="New page"
            onClick={() => onCreateRoot("page")}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-1 pb-4">
        {visibleRows.length === 0 ? (
          <p className="px-2 py-4 text-sm text-muted-foreground">No pages yet.</p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext
              items={visibleRows.map((r) => r.id)}
              strategy={verticalListSortingStrategy}
            >
              {visibleRows.map((row) => (
                <SortableNoteTreeRow
                  key={row.id}
                  row={row}
                  isOpen={expandedIds.has(String(row.id))}
                  isActive={pathname === `/notes/${row.id}`}
                  onToggle={toggle}
                  onCreateChild={onCreateChild}
                  onSetFavorite={onSetFavorite}
                  onTrash={onTrash}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
