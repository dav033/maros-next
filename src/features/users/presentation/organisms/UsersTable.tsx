"use client";

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
import { useCurrentUser } from "@/shared/auth/CurrentUserProvider";
import { useInstantUsersList } from "../hooks/data/useInstantUsersList";
import { useInstantRolesList } from "../hooks/data/useInstantRolesList";
import { useUserMutations } from "../hooks/mutations/useUserMutations";

function formatLastLogin(value: string | null): string {
  if (!value) return "Never";
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function UsersTable() {
  const { user: me } = useCurrentUser();
  const { users, isLoading } = useInstantUsersList();
  const { roles } = useInstantRolesList();
  const { updateMutation } = useUserMutations();

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading users…</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Last login</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => {
          const isSelf = user.id === me?.id;
          return (
            <TableRow key={user.id}>
              <TableCell>
                <div className="font-medium">{user.name ?? user.email}</div>
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
                  <SelectTrigger className="w-40">
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
                <div className="flex items-center gap-2">
                  <Switch
                    checked={user.isActive}
                    disabled={isSelf || updateMutation.isPending}
                    onCheckedChange={(checked) =>
                      updateMutation.mutate({ id: user.id, patch: { isActive: checked } })
                    }
                  />
                  {!user.isActive && <Badge variant="secondary">Deactivated</Badge>}
                  {isSelf && <Badge variant="outline">You</Badge>}
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatLastLogin(user.lastLoginAt)}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
