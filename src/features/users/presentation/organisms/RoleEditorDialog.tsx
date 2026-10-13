"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, RefreshCw } from "lucide-react";
import type { AppRole, PermissionGroup } from "@/features/users/domain";
import type { Permission } from "@/shared/auth/permissions";
import { useInstantPermissionCatalog } from "../hooks/data/useInstantPermissionCatalog";
import { useRoleMutations } from "../hooks/mutations/useRoleMutations";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Omit to create a new role. */
  role?: AppRole;
};

export function RoleEditorDialog({ open, onOpenChange, role }: Props) {
  const {
    catalog,
    isPending: isCatalogPending,
    isFetching: isCatalogFetching,
    error: catalogError,
    refetch: refetchCatalog,
  } = useInstantPermissionCatalog();
  const { createMutation, updateMutation } = useRoleMutations();

  const [name, setName] = useState(role?.name ?? "");
  const [description, setDescription] = useState(role?.description ?? "");
  const [selected, setSelected] = useState<Set<Permission>>(
    new Set(role?.permissions ?? [])
  );

  // Reset local state whenever a different role is opened for editing.
  useEffect(() => {
    setName(role?.name ?? "");
    setDescription(role?.description ?? "");
    setSelected(new Set(role?.permissions ?? []));
  }, [role, open]);

  const isSystem = role?.isSystem ?? false;
  const isPending = createMutation.isPending || updateMutation.isPending;
  const hasPermissionOptions = catalog.groups.some((group) => group.permissions.length > 0);
  const catalogStillLoading =
    isCatalogPending || (isCatalogFetching && !hasPermissionOptions);

  function togglePermission(permission: Permission, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(permission);
      else next.delete(permission);
      return next;
    });
  }

  async function handleSubmit() {
    const permissions = Array.from(selected);
    try {
      if (role) {
        await updateMutation.mutateAsync({ id: role.id, patch: { description, permissions } });
      } else {
        await createMutation.mutateAsync({ name, description, permissions });
      }
      onOpenChange(false);
    } catch {
      // useEntityMutation already surfaced a toast; keep the dialog open so
      // the user can fix the name conflict / bad input and retry.
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">
            {role ? `Editar ${role.name}` : "Crear rol"}
          </DialogTitle>
          <DialogDescription>
            {isSystem
              ? "El nombre de este rol integrado es fijo, pero sus permisos se pueden cambiar."
              : "Elige un nombre y los permisos que tendrá este rol."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role-name">Nombre</Label>
            <Input
              id="role-name"
              value={name}
              disabled={isSystem}
              onChange={(e) => setName(e.target.value)}
              placeholder="p. ej., Ventas"
              className="border-line-strong"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role-description">Descripción</Label>
            <Input
              id="role-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Opcional"
              className="border-line-strong"
            />
          </div>

          <div className="space-y-3">
            <Label>Permisos</Label>
            {catalogError && (
              <Alert variant="destructive" className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <AlertTitle>
                    {hasPermissionOptions
                      ? "No se pudieron actualizar los permisos"
                      : "No se pudieron cargar los permisos"}
                  </AlertTitle>
                  <AlertDescription>
                    {hasPermissionOptions
                      ? "Las opciones cargadas siguen disponibles."
                      : "No puedes guardar cambios hasta que cargue el catálogo de permisos."}
                  </AlertDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 border-destructive/50 text-foreground hover:bg-destructive/10"
                  disabled={isCatalogFetching}
                  onClick={() => void refetchCatalog()}
                >
                  {isCatalogFetching ? <Loader2 className="animate-spin" /> : <RefreshCw />}
                  {isCatalogFetching ? "Reintentando…" : "Reintentar"}
                </Button>
              </Alert>
            )}
            {catalogStillLoading && (
              <div role="status" aria-label="Cargando permisos" className="space-y-2">
                <span className="sr-only">Cargando permisos…</span>
                <Skeleton className="h-20 w-full rounded-lg" />
                <Skeleton className="h-20 w-full rounded-lg" />
              </div>
            )}
            {!catalogStillLoading && !catalogError && !hasPermissionOptions && (
              <Alert variant="destructive" className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <AlertTitle>No hay opciones de permisos disponibles</AlertTitle>
                  <AlertDescription>
                    No puedes guardar este rol hasta que se configure el catálogo de permisos.
                  </AlertDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 border-destructive/50 text-foreground hover:bg-destructive/10"
                  disabled={isCatalogFetching}
                  onClick={() => void refetchCatalog()}
                >
                  {isCatalogFetching ? <Loader2 className="animate-spin" /> : <RefreshCw />}
                  {isCatalogFetching ? "Actualizando…" : "Actualizar"}
                </Button>
              </Alert>
            )}
            {catalog.groups.map((group: PermissionGroup) => (
              <div key={group.key} className="rounded-lg border border-line bg-elev-3 p-3">
                <div className="mb-2 text-sm font-medium">{group.label}</div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {group.permissions.map((permission) => (
                    <label
                      key={permission}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <Checkbox
                        checked={selected.has(permission)}
                        onCheckedChange={(checked) =>
                          togglePermission(permission, checked === true)
                        }
                      />
                      {permission}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending || !name.trim() || catalogStillLoading || !hasPermissionOptions}
          >
            {role ? "Guardar cambios" : "Crear rol"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
