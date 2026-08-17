"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BriefcaseBusiness, Layers3 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNoteLinkableRecords } from "@/features/notes/presentation/hooks/data/useNoteLinkableRecords";
import { useTasksViewState } from "../hooks/useTasksViewState";
import { TaskTemplateApply } from "./TaskTemplateApply";
import { useCurrentUser } from "@/shared/auth/CurrentUserProvider";

const SCOPES = [
  { value: "all", label: "All lines" },
  { value: "CONSTRUCTION", label: "Construction" },
  { value: "ROOFING", label: "Roofing" },
  { value: "PLUMBING", label: "Plumbing" },
] as const;

export function TaskScopeBar() {
  const { state, replaceState } = useTasksViewState();
  const { user } = useCurrentUser();
  const searchParams = useSearchParams();
  const restoredForUser = useRef<number | null>(null);
  const [restoreReadyForUser, setRestoreReadyForUser] = useState<number | null>(null);
  const records = useNoteLinkableRecords(true);

  useEffect(() => {
    if (!user || restoredForUser.current === user.id) return;
    restoredForUser.current = user.id;
    const saved = window.localStorage.getItem(`maros.tasks.scope.${user.id}`);
    if (saved && !searchParams.has("scope") && !searchParams.has("job")) {
      try {
        const parsed = JSON.parse(saved) as { scope?: string; job?: number | null };
        replaceState({ scope: parsed.scope ?? "all", job: parsed.job ?? null });
      } catch { /* Ignore a stale preference and keep URL/default state. */ }
    }
    // Do not let the persistence effect run until the URL has either been
    // restored or explicitly accepted as the source of truth.
    setRestoreReadyForUser(user.id);
  }, [replaceState, searchParams, user]);

  useEffect(() => {
    if (!user || restoreReadyForUser !== user.id) return;
    window.localStorage.setItem(`maros.tasks.scope.${user.id}`, JSON.stringify({ scope: state.scope, job: state.job }));
  }, [restoreReadyForUser, state.job, state.scope, user]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Layers3 className="h-3.5 w-3.5" aria-hidden="true" />
        Scope
      </div>
      <Select value={state.scope} onValueChange={(value) => replaceState({ scope: value })}>
        <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
        <SelectContent>
          {SCOPES.map((scope) => <SelectItem key={scope.value} value={scope.value}>{scope.label}</SelectItem>)}
        </SelectContent>
      </Select>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <BriefcaseBusiness className="h-3.5 w-3.5" aria-hidden="true" />
        Job
      </div>
      <Select
        value={state.job == null ? "all" : String(state.job)}
        onValueChange={(value) => replaceState({ job: value === "all" ? null : Number(value) })}
      >
        <SelectTrigger className="h-8 w-52 text-xs"><SelectValue placeholder="All jobs" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All jobs</SelectItem>
          {records.leads.map((lead) => (
            <SelectItem key={lead.id} value={String(lead.id)}>
              {lead.name}{lead.leadNumber ? ` · ${lead.leadNumber}` : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {state.job != null ? <TaskTemplateApply leadId={state.job} /> : null}
    </div>
  );
}
