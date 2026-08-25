"use client";

import Link from "next/link";
import { useState } from "react";
import { FolderKanban, Plus } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTasksApp } from "@/di";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const key = ["task-workspaces"];

export function TaskWorkspacesPageView() {
  const ctx = useTasksApp();
  const queryClient = useQueryClient();
  const [queryText, setQueryText] = useState("");
  const [title, setTitle] = useState("");
  const workspaces = useQuery({ queryKey: [...key, queryText], queryFn: () => ctx.repos.workspace.list({ query: queryText || undefined }) });
  const create = useMutation({
    mutationFn: () => ctx.repos.workspace.create({ title: title.trim() }),
    onSuccess: () => { setTitle(""); void queryClient.invalidateQueries({ queryKey: key }); },
  });

  return (
    <div className="flex w-full flex-1 flex-col gap-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Tasks</p>
          <h1 className="text-2xl font-semibold tracking-tight">Workspaces</h1>
          <p className="mt-1 text-sm text-muted-foreground">Keep job work, folders, files, and related CRM records together.</p>
        </div>
        <div className="flex gap-2">
          <Input value={queryText} onChange={(event) => setQueryText(event.target.value)} placeholder="Search workspaces" className="w-52" />
          <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="New workspace" className="w-44" onKeyDown={(event) => { if (event.key === "Enter" && title.trim()) create.mutate(); }} />
          <Button disabled={!title.trim() || create.isPending} onClick={() => create.mutate()}><Plus className="mr-2 h-4 w-4" />Create</Button>
        </div>
      </header>
      {workspaces.isPending ? <p className="text-sm text-muted-foreground">Loading workspaces…</p> : null}
      {workspaces.isError ? <p className="text-sm text-destructive">Could not load workspaces.</p> : null}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {(workspaces.data?.items ?? []).map((workspace) => (
          <Link key={workspace.id} href={`/tasks/workspaces/${workspace.id}`} className="block">
            <Card className="h-full transition-colors hover:border-primary/50">
              <CardHeader className="flex-row items-start justify-between space-y-0">
                <CardTitle className="flex items-center gap-2 text-base"><FolderKanban className="h-4 w-4 text-primary" />{workspace.title}</CardTitle>
                {workspace.archivedAt ? <span className="text-xs text-muted-foreground">Archived</span> : null}
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                <span>{workspace.taskCount} tasks</span><span>{workspace.folderCount} folders</span><span>{workspace.fileCount} files</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      {!workspaces.isPending && (workspaces.data?.items ?? []).length === 0 ? <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">No workspaces yet.</p> : null}
    </div>
  );
}
