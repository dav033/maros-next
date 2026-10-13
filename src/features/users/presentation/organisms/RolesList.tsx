"use client";

import { useState } from "react";
import { Loader2, Pencil, Plus, RefreshCw, ShieldCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { AppRole } from "@/features/users/domain";
import { useInstantRolesList } from "../hooks/data/useInstantRolesList";
import { useRoleMutations } from "../hooks/mutations/useRoleMutations";
import { RoleEditorDialog } from "./RoleEditorDialog";

export function RolesList() {
  const { roles, isLoading, isFetching, error, refetch } = useInstantRolesList();
  const { deleteMutation } = useRoleMutations();
  const [editing, setEditing] = useState<AppRole | null>(null);
  const [creating, setCreating] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<AppRole | null>(null);

  if (isLoading || (isFetching && roles.length === 0)) {
    return (
      <div role="status" aria-label="Cargando roles" className="space-y-3">
        <span className="sr-only">Cargando roles…</span>
        <div className="flex justify-end">
          <Skeleton className="h-9 w-28" />
        </div>
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  const loadError = error ? (
    <Alert variant="destructive" className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <AlertTitle>
          {roles.length > 0 ? "No se pudieron actualizar los roles" : "No se pudieron cargar los roles"}
        </AlertTitle>
        <AlertDescription>
          {roles.length > 0
            ? "Los roles cargados siguen disponibles. Intenta actualizarlos de nuevo."
            : "No hay datos disponibles. Comprueba tu conexión e inténtalo de nuevo."}
        </AlertDescription>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="shrink-0 border-destructive/50 text-foreground hover:bg-destructive/10"
        disabled={isFetching}
        onClick={() => void refetch()}
      >
        {isFetching ? <Loader2 className="animate-spin" /> : <RefreshCw />}
        {isFetching ? "Reintentando…" : "Reintentar"}
      </Button>
    </Alert>
  ) : null;

  if (error && roles.length === 0) return loadError;

  return (
    <div className="space-y-4">
      {loadError}
      {roles.length > 0 && (
        <div className="flex justify-end">
          <Button onClick={() => setCreating(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Crear rol
          </Button>
        </div>
      )}

      {roles.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line-strong bg-elev-2 px-5 py-10 text-center">
          <h2 className="font-medium">Aún no hay roles</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Crea un rol para definir a qué partes de Maros puede acceder cada persona.
          </p>
          <Button className="mt-4" onClick={() => setCreating(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Crear rol
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {roles.map((role) => (
            <div
              key={role.id}
              className="flex min-w-0 flex-col gap-3 rounded-lg border border-line bg-elev-2 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 font-medium">
                  {role.name}
                  {role.isSystem && (
                    <Badge variant="outline" className="gap-1">
                      <ShieldCheck className="h-3 w-3" />
                      Integrado
                    </Badge>
                  )}
                </div>
                {role.description && (
                  <p className="break-words text-sm text-muted-foreground">{role.description}</p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  {role.permissions.length} {role.permissions.length === 1 ? "permiso" : "permisos"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1 self-end sm:self-auto">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Editar rol ${role.name}`}
                  onClick={() => setEditing(role)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={role.isSystem}
                  title={role.isSystem ? "Los roles integrados no se pueden eliminar" : "Eliminar rol"}
                  aria-label={`Eliminar rol ${role.name}`}
                  onClick={() => setPendingDelete(role)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <RoleEditorDialog open={creating} onOpenChange={setCreating} />
      {editing && (
        <RoleEditorDialog
          open={Boolean(editing)}
          onOpenChange={(open) => !open && setEditing(null)}
          role={editing}
        />
      )}

      <AlertDialog open={Boolean(pendingDelete)} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              ¿Eliminar el rol «{pendingDelete?.name}»?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Solo se puede eliminar si ninguna persona tiene este rol asignado. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingDelete) deleteMutation.mutate(pendingDelete.id);
                setPendingDelete(null);
              }}
            >
              Eliminar rol
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
