"use client";

import { useMemo, useState } from "react";
import { Check, Link2, Loader2, RefreshCw, Search, TriangleAlert } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useLinkProjectQboLink } from "@/features/quickbooks/presentation/hooks/useLinkProjectQboLink";

import { useQuickbooksImportJobs } from "../hooks/data/useQuickbooksImportJobs";

interface QuickbooksLinkProjectButtonProps {
  projectId: number;
  /** Número del proyecto. Se usa para ordenar y resaltar el job más probable. */
  projectNumber?: string | null;
  /** Job enlazado hoy, si ya hay uno: entonces el botón cambia el vínculo. */
  qboCustomerId?: string | null;
  /** Se llama tras enlazar, para refrescar lo que dependa del proyecto. */
  onLinked?: () => void;
  disabled?: boolean;
}

/** Cuántos jobs se pintan de una vez. La lista real ronda el centenar, pero el
 * buscador es lo que se usa: pintarlos todos sólo alarga el diálogo. */
const VISIBLE_LIMIT = 40;

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Selector buscable de jobs de QuickBooks para enlazar un proyecto del CRM que
 * YA existe. La importación (/projects/import-from-quickbooks) hace lo
 * contrario: parte del job y crea o busca el proyecto. Aquí se parte de la
 * ficha abierta y se le dice cuál es su job — incluido el caso que la
 * importación no puede resolver, el job cuyo nombre no lleva número.
 */
export function QuickbooksLinkProjectButton({
  projectId,
  projectNumber,
  qboCustomerId,
  onLinked,
  disabled,
}: QuickbooksLinkProjectButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  // El centenar de jobs sólo hace falta con el diálogo abierto; el botón vive en
  // la cabecera de la ficha y antes pedía la lista nada más pintarse.
  const jobsQuery = useQuickbooksImportJobs({ enabled: isOpen });
  const linkMutation = useLinkProjectQboLink();

  const isRelink = !!qboCustomerId;

  const jobs = useMemo(() => {
    const rows = jobsQuery.data ?? [];
    const wanted = normalize(projectNumber ?? "");
    // El job que lleva el número del proyecto es el candidato obvio: primero.
    return [...rows].sort((a, b) => {
      const aMatch = wanted && normalize(a.projectNumber ?? "") === wanted ? 0 : 1;
      const bMatch = wanted && normalize(b.projectNumber ?? "") === wanted ? 0 : 1;
      if (aMatch !== bMatch) return aMatch - bMatch;
      return a.displayName.localeCompare(b.displayName);
    });
  }, [jobsQuery.data, projectNumber]);

  const filtered = useMemo(() => {
    const term = normalize(query);
    if (!term) return jobs;
    return jobs.filter((job) =>
      [job.displayName, job.fullyQualifiedName, job.projectNumber ?? "", job.qboCustomerId]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [jobs, query]);

  const visible = filtered.slice(0, VISIBLE_LIMIT);
  const selectedJob = jobs.find((job) => job.qboCustomerId === selected) ?? null;

  const close = () => {
    if (linkMutation.isPending) return;
    setIsOpen(false);
    setQuery("");
    setSelected(null);
  };

  const submit = () => {
    if (!selected) return;
    linkMutation.mutate(
      { projectId, qboCustomerId: selected },
      {
        onSuccess: (result) => {
          if (!result.linked) {
            toast.info("Este proyecto ya estaba enlazado a ese job de QuickBooks.");
          } else if (result.previousQboCustomerId) {
            toast.success(
              `Vínculo cambiado al job ${result.jobDisplayName || result.qboCustomerId}.`,
            );
          } else {
            toast.success(
              `Proyecto enlazado con ${result.jobDisplayName || result.qboCustomerId}.`,
            );
          }
          setIsOpen(false);
          setQuery("");
          setSelected(null);
          onLinked?.();
        },
        onError: (error) => {
          toast.error(
            error instanceof Error ? error.message : "No se pudo enlazar el proyecto",
          );
        },
      },
    );
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        disabled={disabled}
      >
        <Link2 className="size-4 mr-2" />
        {isRelink ? "Cambiar job de QuickBooks" : "Enlazar con QuickBooks"}
      </Button>

      <Dialog open={isOpen} onOpenChange={(open) => (open ? setIsOpen(true) : close())}>
        <DialogContent className="!flex max-h-[85vh] w-[calc(100vw-2rem)] max-w-2xl flex-col overflow-hidden">
          <DialogHeader className="text-left">
            <DialogTitle>
              {isRelink ? "Cambiar el job de QuickBooks" : "Enlazar con QuickBooks"}
            </DialogTitle>
            <DialogDescription>
              Elige el job de QuickBooks que corresponde a este proyecto
              {projectNumber ? ` (${projectNumber})` : ""}. Se guarda el vínculo en el
              proyecto; en QuickBooks no cambia nada.
              {isRelink ? " El vínculo actual se reemplaza." : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por nombre, número de proyecto o id del job"
              className="pl-9"
              disabled={linkMutation.isPending}
            />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-line">
            {jobsQuery.isPending ? (
              <p className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Cargando los jobs de QuickBooks...
              </p>
            ) : jobsQuery.isError ? (
              <div className="space-y-3 p-4 text-sm">
                <p className="text-destructive">
                  {jobsQuery.error?.message ??
                    "No se pudo leer la lista de jobs de QuickBooks."}
                </p>
                <Button variant="outline" size="sm" onClick={() => void jobsQuery.refetch()}>
                  <RefreshCw className="size-4 mr-2" />
                  Reintentar
                </Button>
              </div>
            ) : visible.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">
                Ningún job de QuickBooks coincide con «{query}».
              </p>
            ) : (
              <ul className="divide-y divide-line">
                {visible.map((job) => {
                  const isSelected = job.qboCustomerId === selected;
                  const isCurrent = job.qboCustomerId === qboCustomerId;
                  const takenByAnother =
                    job.importedProjectId != null && job.importedProjectId !== projectId;
                  return (
                    <li key={job.qboCustomerId}>
                      <button
                        type="button"
                        onClick={() => setSelected(job.qboCustomerId)}
                        disabled={takenByAnother || linkMutation.isPending}
                        className={`flex w-full items-start gap-3 px-3 py-2 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                          isSelected ? "bg-primary/10" : "hover:bg-elev-3"
                        }`}
                      >
                        <span className="mt-0.5 size-4 shrink-0 text-primary">
                          {isSelected ? <Check className="size-4" /> : null}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium text-foreground">
                            {job.displayName}
                          </span>
                          <span className="block truncate text-xs text-muted-foreground">
                            id {job.qboCustomerId}
                            {job.projectNumber ? ` · nº ${job.projectNumber}` : " · sin número"}
                            {isCurrent ? " · enlazado ahora" : ""}
                            {takenByAnother
                              ? ` · ya es del proyecto #${job.importedProjectId}`
                              : ""}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {filtered.length > visible.length && (
            <p className="text-xs text-muted-foreground">
              Se muestran {visible.length} de {filtered.length} jobs. Afina la búsqueda para
              ver el resto.
            </p>
          )}

          {selectedJob &&
            projectNumber &&
            normalize(selectedJob.projectNumber ?? "") !== normalize(projectNumber) && (
              <p className="flex items-start gap-2 rounded-lg border border-line bg-elev-3 p-3 text-xs text-muted-foreground">
                <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-500" />
                <span>
                  El nombre de este job no lleva el número {projectNumber}. Se puede enlazar
                  igual —hay jobs sin número—, pero comprueba que sea el correcto.
                </span>
              </p>
            )}

          <DialogFooter>
            <Button variant="outline" onClick={close} disabled={linkMutation.isPending}>
              Cancelar
            </Button>
            <Button onClick={submit} disabled={!selected || linkMutation.isPending}>
              {linkMutation.isPending ? (
                <Loader2 className="size-4 mr-2 animate-spin" />
              ) : (
                <Link2 className="size-4 mr-2" />
              )}
              {isRelink ? "Cambiar vínculo" : "Enlazar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
