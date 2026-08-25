"use client";

import { Folder, FolderOpen } from "lucide-react";
import type { TaskWorkspaceFolder } from "../../domain";

type Props = { folders: TaskWorkspaceFolder[]; selectedId: number | null; onSelect: (id: number | null) => void };

export function WorkspaceFolderTree({ folders, selectedId, onSelect }: Props) {
  const roots = folders.filter((folder) => folder.parentFolderId == null);
  const childrenOf = (parentId: number) => folders.filter((folder) => folder.parentFolderId === parentId);
  const render = (folder: TaskWorkspaceFolder, depth = 0): React.ReactNode => (
    <div key={folder.id}>
      <button type="button" onClick={() => onSelect(folder.id)} className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted ${selectedId === folder.id ? "bg-muted font-medium" : ""}`} style={{ paddingLeft: `${8 + depth * 16}px` }}>
        {selectedId === folder.id ? <FolderOpen className="h-4 w-4 text-primary" /> : <Folder className="h-4 w-4 text-muted-foreground" />}{folder.title}
      </button>
      {childrenOf(folder.id).map((child) => render(child, depth + 1))}
    </div>
  );
  return <div className="space-y-0.5"><button type="button" onClick={() => onSelect(null)} className={`w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted ${selectedId == null ? "bg-muted font-medium" : ""}`}>All workspace tasks</button>{roots.map((folder) => render(folder))}</div>;
}
