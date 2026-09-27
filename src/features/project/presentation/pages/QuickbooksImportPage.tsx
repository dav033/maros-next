"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowDownToLine,
  Check,
  CircleAlert,
  FolderKanban,
  Loader2,
  RefreshCw,
  Search,
} from "lucide-react";
import { Can } from "@/shared/auth/Can";
import { PageHeaderCard } from "@/components/shared";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getQuickbooksImportJobsAction,
  importQuickbooksJobAction,
} from "../../actions/quickbooksImportActions";
import type {
  QuickbooksImportInput,
  QuickbooksImportJob,
} from "../../actions/quickbooksImportActions";

function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function QuickbooksImportPage() {
  const pathname = usePathname();
  const [jobs, setJobs] = useState<QuickbooksImportJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [showImported, setShowImported] = useState(false);
  const [selectedJob, setSelectedJob] = useState<QuickbooksImportJob | null>(null);
  const [projectNumber, setProjectNumber] = useState("");
  const [projectName, setProjectName] = useState("");
  const [location, setLocation] = useState("");
  const [target, setTarget] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    const result = await getQuickbooksImportJobsAction();
    if (result.success) setJobs(result.data);
    else setLoadError(result.error);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadJobs();
  }, [loadJobs]);

  const visibleJobs = useMemo(() => {
    const term = query.trim().toLowerCase();
    return jobs.filter((job) => {
      if (!showImported && job.importedProjectId) return false;
      if (!term) return true;
      return [job.displayName, job.projectNumber ?? "", job.parentName ?? ""]
        .some((value) => value.toLowerCase().includes(term));
    });
  }, [jobs, query, showImported]);

  function openReview(job: QuickbooksImportJob) {
    setSelectedJob(job);
    setProjectNumber(job.projectNumber ?? "");
    setProjectName(job.displayName.slice(0, 100));
    setLocation("");
    setFormError("");
    setNotice("");
    if (job.matchingLeads.length === 1) {
      const match = job.matchingLeads[0];
      if (match.leadNumber) setProjectNumber(match.leadNumber);
      setTarget(match.projectId && !match.qboCustomerId
        ? `project:${match.projectId}`
        : match.qboCustomerId
          ? "new"
          : `lead:${match.leadId}`);
    } else {
      setTarget(job.matchingLeads.length === 0 ? "new" : "");
    }
  }

  async function importSelectedJob() {
    if (!selectedJob || !projectNumber.trim() || !target || target === "choose") return;
    const input: QuickbooksImportInput = {
      qboCustomerId: selectedJob.qboCustomerId,
      projectNumber: projectNumber.trim(),
      name: projectName.trim() || undefined,
      location: location.trim() || undefined,
    };
    if (target.startsWith("project:")) input.projectId = Number(target.slice("project:".length));
    if (target.startsWith("lead:")) input.leadId = Number(target.slice("lead:".length));

    setSaving(true);
    setFormError("");
    const result = await importQuickbooksJobAction(input);
    setSaving(false);
    if (!result.success) {
      setFormError(result.error);
      return;
    }
    setJobs((current) => current.map((job) => job.qboCustomerId === result.data.qboCustomerId
      ? { ...job, importedProjectId: result.data.projectId }
      : job));
    setNotice(`${projectNumber.trim()} is now linked to QuickBooks job ${result.data.qboCustomerId}.`);
    setSelectedJob(null);
  }

  const selectedMatch = selectedJob?.matchingLeads.find((match) =>
    target === `lead:${match.leadId}` || target === `project:${match.projectId}`,
  );

  return (
    <Can permission="projects:read" fallback={<AccessMessage />}>
      <Can permission="finance:read" fallback={<AccessMessage />}>
        <main className="space-y-5 p-4 sm:p-6">
          <PageHeaderCard
            icon={ArrowDownToLine}
            title="Import from QuickBooks"
            description="Review active QuickBooks jobs and add missing work to Projects. Each job stays linked by its exact QuickBooks ID."
            belowSlot={
              <nav className="inline-flex flex-wrap gap-1 rounded-xl bg-muted p-1" aria-label="Project sections">
                <Button asChild size="sm" variant="ghost" className={`rounded-lg ${pathname !== "/projects/import-from-quickbooks" ? "bg-background text-foreground shadow-sm hover:bg-background" : "text-muted-foreground"}`}>
                  <Link href="/projects/construction"><FolderKanban className="mr-2 h-4 w-4" />Projects</Link>
                </Button>
                <Button asChild size="sm" variant="ghost" className="rounded-lg bg-background text-foreground shadow-sm hover:bg-background">
                  <Link href="/projects/import-from-quickbooks" aria-current="page"><ArrowDownToLine className="mr-2 h-4 w-4" />Import from QuickBooks</Link>
                </Button>
              </nav>
            }
          />

          {notice && (
            <Alert>
              <Check className="h-4 w-4" />
              <AlertDescription>{notice}</AlertDescription>
            </Alert>
          )}
          {loadError && (
            <Alert variant="destructive">
              <CircleAlert className="h-4 w-4" />
              <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
                <span>{loadError}</span>
                <Button size="sm" variant="outline" onClick={() => void loadJobs()}>
                  <RefreshCw className="mr-2 h-4 w-4" />Try again
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <section className="space-y-3" aria-label="QuickBooks jobs">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative min-w-0 flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by job name, project number, or parent"
                  aria-label="Search QuickBooks jobs"
                  className="pl-9"
                />
              </div>
              <div className="flex min-h-10 items-center gap-3 rounded-xl border px-3">
                <Switch id="show-imported-jobs" checked={showImported} onCheckedChange={setShowImported} />
                <Label htmlFor="show-imported-jobs" className="cursor-pointer whitespace-nowrap text-sm text-muted-foreground">Show imported jobs</Label>
              </div>
              <Button variant="outline" onClick={() => void loadJobs()} disabled={loading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />Refresh
              </Button>
            </div>

            <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>QuickBooks job</TableHead>
                    <TableHead>Project number</TableHead>
                    <TableHead>CRM record</TableHead>
                    <TableHead className="text-right">Open balance</TableHead>
                    <TableHead className="w-32 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={5} className="h-28 text-center text-muted-foreground"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />Loading QuickBooks jobs…</TableCell></TableRow>
                  ) : visibleJobs.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="h-28 text-center text-muted-foreground">{jobs.length === 0 ? "No active QuickBooks jobs were found." : !showImported && !query.trim() ? "All active jobs are already imported. Show imported jobs to review their links." : "No jobs match this search."}</TableCell></TableRow>
                  ) : visibleJobs.map((job) => (
                    <TableRow key={job.qboCustomerId} className="transition-colors hover:bg-muted/25">
                      <TableCell className="min-w-64">
                        <div className="font-medium text-foreground">{job.displayName}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          Job ID <span className="font-mono tabular-nums">{job.qboCustomerId}</span>
                          {job.parentName ? ` · ${job.parentName}` : ""}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm tabular-nums">{job.projectNumber ?? <span className="font-sans text-muted-foreground">Needs a number</span>}</TableCell>
                      <TableCell>
                        {job.importedProjectId ? (
                          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">Project #{job.importedProjectId}</span>
                        ) : job.matchingLeads.length ? (
                          <div className="text-sm">
                            {job.matchingLeads.length === 1 ? job.matchingLeads[0].name || job.matchingLeads[0].leadNumber : `${job.matchingLeads.length} matching records`}
                            {job.matchingLeads.length === 1 && job.matchingLeads[0].projectId ? <span className="ml-1 text-muted-foreground">· Project #{job.matchingLeads[0].projectId}</span> : null}
                          </div>
                        ) : <span className="text-sm text-muted-foreground">No match</span>}
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">{formatMoney(job.balance)}</TableCell>
                      <TableCell className="text-right">
                        {job.importedProjectId ? (
                          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground"><Check className="h-4 w-4" />Imported</span>
                        ) : (
                          <Can permission="projects:write" fallback={<span className="text-xs text-muted-foreground">Read only</span>}>
                          <Button size="sm" variant="secondary" className="rounded-lg" onClick={() => openReview(job)}>Review</Button>
                          </Can>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="text-sm text-muted-foreground">{visibleJobs.length} {visibleJobs.length === 1 ? "job" : "jobs"} shown · Imports only create or link CRM records; QuickBooks is not changed.</p>
          </section>

          <Dialog open={!!selectedJob} onOpenChange={(open) => !open && !saving && setSelectedJob(null)}>
            <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>Review QuickBooks job</DialogTitle>
                <DialogDescription>
                  This creates a separate CRM project and saves the exact QuickBooks job ID for financial matching.
                </DialogDescription>
              </DialogHeader>
              {selectedJob && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-primary/15 bg-primary/10 px-4 py-3 text-sm">
                    <div className="font-medium">{selectedJob.displayName}</div>
                    <div className="mt-1 text-xs text-muted-foreground">QuickBooks job ID <span className="font-mono">{selectedJob.qboCustomerId}</span></div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="qbo-project-number">CRM project number</Label>
                      <Input id="qbo-project-number" value={projectNumber} onChange={(event) => setProjectNumber(event.target.value)} maxLength={50} placeholder="e.g. 032P-0825 CO01" disabled={!!selectedMatch} />
                    </div>
                    {target === "new" && <div className="space-y-2">
                      <Label htmlFor="qbo-project-location">Location</Label>
                      <Input id="qbo-project-location" value={location} onChange={(event) => setLocation(event.target.value)} maxLength={255} placeholder="Optional" />
                    </div>}
                  </div>
                  {target === "new" && <div className="space-y-2">
                    <Label htmlFor="qbo-project-name">CRM project name</Label>
                    <Input id="qbo-project-name" value={projectName} onChange={(event) => setProjectName(event.target.value)} maxLength={100} />
                  </div>}
                  <div className="space-y-2">
                    <Label htmlFor="qbo-import-target">CRM record</Label>
                    <Select value={target || "choose"} onValueChange={(value) => {
                      setTarget(value);
                      const selected = selectedJob.matchingLeads.find((match) =>
                        value === `lead:${match.leadId}` || value === `project:${match.projectId}`,
                      );
                      if (selected?.leadNumber) setProjectNumber(selected.leadNumber);
                    }}>
                      <SelectTrigger id="qbo-import-target"><SelectValue placeholder="Choose a CRM record" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="choose" disabled>Choose a CRM record</SelectItem>
                        {selectedJob.matchingLeads.map((match) => {
                          const unavailable = !!match.qboCustomerId && match.qboCustomerId !== selectedJob.qboCustomerId;
                          const value = match.projectId ? `project:${match.projectId}` : `lead:${match.leadId}`;
                          const label = `${match.leadNumber ?? "Unnumbered lead"} · ${match.name ?? `Lead #${match.leadId}`}${match.projectId ? ` · Project #${match.projectId}` : ""}${unavailable ? ` · Linked to QBO ${match.qboCustomerId}` : ""}`;
                          return <SelectItem key={match.leadId} value={value} disabled={unavailable}>{label}</SelectItem>;
                        })}
                        <SelectItem value="new">Create a separate CRM project</SelectItem>
                      </SelectContent>
                    </Select>
                    {selectedMatch && <p className="text-xs text-muted-foreground">The existing lead and project details will be kept. This QuickBooks job will be linked to that record.</p>}
                    {!selectedJob.matchingLeads.length && <p className="text-xs text-muted-foreground">No project number match was found. A new CRM lead and project will be created.</p>}
                  </div>
                  {formError && <Alert variant="destructive"><CircleAlert className="h-4 w-4" /><AlertDescription>{formError}</AlertDescription></Alert>}
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedJob(null)} disabled={saving}>Cancel</Button>
                <Can permission="projects:write">
                  <Button onClick={() => void importSelectedJob()} disabled={saving || !projectNumber.trim() || !target || target === "choose"}>
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowDownToLine className="mr-2 h-4 w-4" />}
                    {saving ? "Importing…" : "Import project"}
                  </Button>
                </Can>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </Can>
    </Can>
  );
}

function AccessMessage() {
  return (
    <main className="p-6">
      <Alert variant="destructive"><CircleAlert className="h-4 w-4" /><AlertDescription>You need Projects and QuickBooks finance access to view this page.</AlertDescription></Alert>
    </main>
  );
}
