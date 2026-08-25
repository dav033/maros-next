"use client";

import Link from "next/link";
import { useState } from "react";
import { Archive, ArrowLeft, Check, Plus, RotateCcw } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTasksApp } from "@/di";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useInstantTasksList } from "@/features/tasks/presentation/hooks/data/useInstantTasksList";
import { ManagedFilesHttpRepository, type ManagedFile } from "@/features/attachments/infra/ManagedFilesHttpRepository";
import { ManagedAttachmentsSection } from "@/features/attachments/presentation/ManagedAttachmentsSection";
import { PendingAttachmentPicker, type PendingAttachment } from "@/features/attachments/presentation/PendingAttachmentPicker";
import { WorkspaceFolderTree } from "../components/WorkspaceFolderTree";

const key = (id: number) => ["task-workspaces", id];

export function TaskWorkspaceDetailPageView({ workspaceId }: { workspaceId: number }) {
  const ctx = useTasksApp();
  const queryClient = useQueryClient();
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [folderTitle, setFolderTitle] = useState("");
  const [pendingFiles, setPendingFiles] = useState<PendingAttachment[]>([]);
  const workspace = useQuery({ queryKey: key(workspaceId), queryFn: () => ctx.repos.workspace.get(workspaceId) });
  const folders = workspace.data?.folders ?? [];
  const taskQuery = useInstantTasksList({ workspaceId, folderId: selectedFolderId ?? undefined, includeDescendants: selectedFolderId != null });
  const refresh = () => { void queryClient.invalidateQueries({ queryKey: key(workspaceId) }); void queryClient.invalidateQueries({ queryKey: ["tasks"] }); };
  const createFolder = useMutation({ mutationFn: () => ctx.repos.workspace.createFolder(workspaceId, { title: folderTitle.trim() }), onSuccess: () => { setFolderTitle(""); refresh(); } });
  const archive = useMutation({ mutationFn: async (): Promise<unknown> => { if (workspace.data?.archivedAt) return ctx.repos.workspace.restore(workspaceId); await ctx.repos.workspace.archive(workspaceId); }, onSuccess: refresh });
  const uploadFiles = useMutation({
    mutationFn: async (items: PendingAttachment[]) => {
      const repository = new ManagedFilesHttpRepository();
      for (const item of items) {
        const intent = await repository.createIntent({ ownerKind: "workspace", ownerId: workspaceId, fileName: item.file.name, mimeType: item.file.type || "application/octet-stream", sizeBytes: item.file.size, clientUploadId: item.id });
        await repository.upload(intent, item.file, (progress) => setPendingFiles((current) => current.map((entry) => entry.id === item.id ? { ...entry, progress } : entry)));
      }
    },
    onSuccess: () => { setPendingFiles([]); refresh(); },
    onError: (error) => setPendingFiles((current) => current.map((entry) => ({ ...entry, error: error instanceof Error ? error.message : "Upload failed" }))),
  });
  const removeFile = useMutation({ mutationFn: (id: number) => new ManagedFilesHttpRepository().remove(id), onSuccess: refresh });

  if (workspace.isPending) return <p className="text-sm text-muted-foreground">Loading workspace…</p>;
  if (workspace.isError || !workspace.data) return <p className="text-sm text-destructive">Workspace not found.</p>;
  const current = workspace.data;
  return (
    <div className="flex w-full flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><Link href="/tasks/workspaces" className="mb-2 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="mr-1 h-4 w-4" />All workspaces</Link><h1 className="text-2xl font-semibold tracking-tight">{current.title}</h1><p className="text-sm text-muted-foreground">{current.descriptionText ?? "Workspace task surface"}</p></div>
        {current.systemKey !== "general" ? <Button variant="outline" onClick={() => archive.mutate()} disabled={archive.isPending}>{current.archivedAt ? <RotateCcw className="mr-2 h-4 w-4" /> : <Archive className="mr-2 h-4 w-4" />}{current.archivedAt ? "Restore" : "Archive"}</Button> : null}
      </div>
      <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
        <Card><CardHeader><CardTitle className="text-sm">Folders</CardTitle></CardHeader><CardContent className="space-y-3"><WorkspaceFolderTree folders={folders} selectedId={selectedFolderId} onSelect={setSelectedFolderId} /><div className="flex gap-2 border-t pt-3"><Input value={folderTitle} onChange={(event) => setFolderTitle(event.target.value)} placeholder="New folder" onKeyDown={(event) => { if (event.key === "Enter" && folderTitle.trim()) createFolder.mutate(); }} /><Button size="icon" aria-label="Create folder" disabled={!folderTitle.trim() || createFolder.isPending} onClick={() => createFolder.mutate()}><Plus className="h-4 w-4" /></Button></div></CardContent></Card>
        <div className="space-y-4">
          <Card><CardHeader><CardTitle className="text-sm">Tasks {selectedFolderId != null ? "in folder" : "in workspace"}</CardTitle></CardHeader><CardContent>{taskQuery.showSkeleton ? <p className="text-sm text-muted-foreground">Loading tasks…</p> : taskQuery.tasks.length === 0 ? <p className="text-sm text-muted-foreground">No tasks in this scope.</p> : <div className="divide-y">{taskQuery.tasks.map((task) => <Link key={task.id} href={`/tasks/${task.id}`} className="flex items-center justify-between gap-3 py-3 hover:text-primary"><span className="truncate">{task.title}</span><span className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">{task.status}{task.folder?.title ? ` · ${task.folder.title}` : ""}{task.status === "done" ? <Check className="h-3.5 w-3.5" /> : null}</span></Link>)}</div>}</CardContent></Card>
          <Card><CardHeader><CardTitle className="text-sm">Linked records</CardTitle></CardHeader><CardContent><div className="flex flex-wrap gap-2">{current.links.length ? current.links.map((link) => <span key={`${link.entityKind}-${link.entityId}`} className="rounded-full border px-3 py-1 text-xs">{link.entityKind} #{link.entityId} · {link.relationship}</span>) : <span className="text-sm text-muted-foreground">No linked records.</span>}</div></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-sm">Managed files</CardTitle></CardHeader><CardContent className="space-y-3"><PendingAttachmentPicker value={pendingFiles} onChange={setPendingFiles} disabled={uploadFiles.isPending} /><Button size="sm" disabled={!pendingFiles.length || uploadFiles.isPending} onClick={() => uploadFiles.mutate(pendingFiles)}>Upload files</Button><ManagedAttachmentsSection files={current.files.map((file) => ({ ...file, ownerKind: "workspace" as const, ownerId: workspaceId, createdAt: "", updatedAt: "" } as ManagedFile))} onOpen={async (file) => { const result = await new ManagedFilesHttpRepository().getUrl(file.id); window.open(result.url, "_blank", "noopener,noreferrer"); }} onRemove={(file) => removeFile.mutate(file.id)} /></CardContent></Card>
        </div>
      </div>
    </div>
  );
}
