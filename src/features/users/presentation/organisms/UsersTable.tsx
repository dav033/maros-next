"use client";

import { Ban, Send, UserPlus } from "lucide-react";
import { useState } from "react";
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

const STATUS_LABEL: Record<UserStatus, string> = {
  invited: "Invited",
  active: "Active",
  disabled: "Disabled",
};

const STATUS_VARIANT: Record<UserStatus, "secondary" | "outline" | "destructive"> = {
  invited: "secondary",
  active: "outline",
  disabled: "destructive",
};

function formatLastLogin(value: string | null): string {
  if (!value) return "Never";
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/** Null unless the user is still sitting on a pending invitation. */
function invitationNote(user: AppUser): string | null {
  if (user.status !== "invited" || !user.invitationExpiresAt) return null;
  const expiresAt = new Date(user.invitationExpiresAt);
  if (expiresAt.getTime() <= Date.now()) return "Link expired";
  return `Expires ${expiresAt.toLocaleDateString(undefined, { dateStyle: "medium" })}`;
}

export function UsersTable() {
  const { user: me } = useCurrentUser();
  const { users, isLoading } = useInstantUsersList();
  const { roles } = useInstantRolesList();
  const { updateMutation, resendInviteMutation, revokeInviteMutation } =
    useUserMutations();
  const [inviting, setInviting] = useState(false);
  const [pendingRevoke, setPendingRevoke] = useState<AppUser | null>(null);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading users…</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setInviting(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Invitar
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Active</TableHead>
            <TableHead>Last login</TableHead>
            <TableHead className="w-24" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const isSelf = user.id === me?.id;
            const note = invitationNote(user);
            return (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-2 font-medium">
                    {user.name ?? user.email}
                    {user.userType === "client" && (
                      <Badge variant="outline">Client</Badge>
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
                    <SelectTrigger className="w-40 border-line-strong">
                      <SelectValue placeholder="No role" />
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
                      disabled={isSelf || updateMutation.isPending}
                      onCheckedChange={(checked) =>
                        updateMutation.mutate({ id: user.id, patch: { isActive: checked } })
                      }
                    />
                    {isSelf && <Badge variant="outline">You</Badge>}
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
                        disabled={resendInviteMutation.isPending}
                        onClick={() => resendInviteMutation.mutate(user.id)}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Cancelar invitación"
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
