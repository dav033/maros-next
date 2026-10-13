"use client";

import { Ban, Loader2, RefreshCw, Send, UserPlus } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { useCurrentUser } from "@/shared/auth/CurrentUserProvider";
import type { AppUser, UserStatus } from "@/features/users/domain";
import { useInstantUsersList } from "../hooks/data/useInstantUsersList";
import { useInstantRolesList } from "../hooks/data/useInstantRolesList";
import { useUserMutations } from "../hooks/mutations/useUserMutations";
import { InviteUserDialog } from "./InviteUserDialog";
import { LeadTypeScopeControl } from "./LeadTypeScopeControl";

const STATUS_LABEL: Record<UserStatus, string> = {
  invited: "Invitado",
  active: "Activo",
  disabled: "Desactivado",
};

const STATUS_VARIANT: Record<UserStatus, "secondary" | "outline" | "destructive"> = {
  invited: "secondary",
  active: "outline",
  disabled: "destructive",
};

function formatLastLogin(value: string | null): string {
  if (!value) return "Nunca";
  return new Date(value).toLocaleString("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/** Null unless the user is still sitting on a pending invitation. */
function invitationNote(user: AppUser): string | null {
  if (user.status !== "invited" || !user.invitationExpiresAt) return null;
  const expiresAt = new Date(user.invitationExpiresAt);
  if (expiresAt.getTime() <= Date.now()) return "Enlace vencido";
  return `Vence ${expiresAt.toLocaleDateString("es-CO", { dateStyle: "medium" })}`;
}

export function UsersTable() {
  const { user: me } = useCurrentUser();
  const { users, isLoading, isFetching, error, refetch } = useInstantUsersList();
  const { roles } = useInstantRolesList();
  const { updateMutation, resendInviteMutation, revokeInviteMutation } =
    useUserMutations();
  const [inviting, setInviting] = useState(false);
  const [pendingRevoke, setPendingRevoke] = useState<AppUser | null>(null);

  if (isLoading || (isFetching && users.length === 0)) {
    return (
      <div role="status" aria-label="Cargando usuarios" className="space-y-3">
        <span className="sr-only">Cargando usuarios…</span>
        <div className="flex justify-end">
          <Skeleton className="h-9 w-28" />
        </div>
        <div className="space-y-3 rounded-lg border border-line p-3">
          <Skeleton className="h-10 w-full" />
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-14 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const loadError = error ? (
    <Alert variant="destructive" className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <AlertTitle>
          {users.length > 0 ? "No se pudieron actualizar los usuarios" : "No se pudieron cargar los usuarios"}
        </AlertTitle>
        <AlertDescription>
          {users.length > 0
            ? "Se conservan los usuarios cargados anteriormente. Intenta actualizar de nuevo."
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

  if (error && users.length === 0) {
    return loadError;
  }

  return (
    <div className="space-y-4">
      {loadError}
      <div className="flex justify-end">
        <Button onClick={() => setInviting(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Invitar
        </Button>
      </div>

      <Table className="min-w-[980px]">
        <TableHeader>
          <TableRow>
            <TableHead>Usuario</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Tipos de lead</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acceso</TableHead>
            <TableHead>Último acceso</TableHead>
            <TableHead className="w-24">Invitación</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                Todavía no hay usuarios. Invita a la primera persona para darle acceso.
              </TableCell>
            </TableRow>
          ) : users.map((user) => {
            const isSelf = user.id === me?.id;
            const note = invitationNote(user);
            return (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-2 font-medium">
                    {user.name ?? user.email}
                    {user.userType === "external" && (
                      <Badge variant="outline">Externo</Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">{user.email}</div>
                </TableCell>
                <TableCell>
                  <Select
                    value={user.role ? String(user.role.id) : undefined}
                    disabled={isSelf || updateMutation.isPending}
                    onValueChange={(value) =>
                      updateMutation.mutate({ id: user.id, patch: { roleId: Number(value) } })
                    }
                  >
                    <SelectTrigger
                      className="w-40 border-line-strong"
                      aria-label={`Rol de ${user.name ?? user.email}`}
                    >
                      <SelectValue placeholder="Sin rol" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={String(role.id)}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  {/* Un externo ya esta acotado a su empresa o contacto; anadirle
                      un ambito por tipo encima mezclaria dos restricciones
                      distintas sin que se vea cual manda. */}
                  {user.userType === "external" ? (
                    <span className="text-xs text-muted-foreground">—</span>
                  ) : (
                    <LeadTypeScopeControl
                      value={user.scopedLeadTypes}
                      disabled={isSelf || updateMutation.isPending}
                      onChange={(scopedLeadTypes) =>
                        updateMutation.mutate({ id: user.id, patch: { scopedLeadTypes } })
                      }
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[user.status]}>
                    {STATUS_LABEL[user.status]}
                  </Badge>
                  {note && (
                    <div className="mt-1 text-xs text-muted-foreground">{note}</div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={user.isActive}
                      aria-label={`${user.isActive ? "Desactivar" : "Activar"} acceso de ${user.name ?? user.email}`}
                      disabled={isSelf || updateMutation.isPending}
                      onCheckedChange={(checked) =>
                        updateMutation.mutate({ id: user.id, patch: { isActive: checked } })
                      }
                    />
                    {isSelf && <Badge variant="outline">Tú</Badge>}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatLastLogin(user.lastLoginAt)}
                </TableCell>
                <TableCell>
                  {user.status === "invited" && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Reenviar invitación"
                        aria-label={`Reenviar invitación a ${user.name ?? user.email}`}
                        disabled={resendInviteMutation.isPending}
                        onClick={() => resendInviteMutation.mutate(user.id)}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Cancelar invitación"
                        aria-label={`Cancelar invitación a ${user.name ?? user.email}`}
                        disabled={revokeInviteMutation.isPending}
                        onClick={() => setPendingRevoke(user)}
                      >
                        <Ban className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <InviteUserDialog open={inviting} onOpenChange={setInviting} />

      <AlertDialog
        open={Boolean(pendingRevoke)}
        onOpenChange={(open) => !open && setPendingRevoke(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              ¿Cancelar la invitación de {pendingRevoke?.email}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              El enlace deja de funcionar y la cuenta queda desactivada. Si después
              quieres darle acceso, vuelve a activarla con el interruptor.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingRevoke) revokeInviteMutation.mutate(pendingRevoke.id);
                setPendingRevoke(null);
              }}
            >
              Cancelar invitación
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
