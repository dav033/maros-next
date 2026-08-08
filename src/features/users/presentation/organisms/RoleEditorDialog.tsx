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
  const { catalog } = useInstantPermissionCatalog();
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
          <DialogTitle>{role ? `Edit ${role.name}` : "New role"}</DialogTitle>
          <DialogDescription>
            {isSystem
              ? "Built-in role — name is fixed, but its permissions can still be changed."
              : "Choose a name and the permissions this role grants."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role-name">Name</Label>
            <Input
              id="role-name"
              value={name}
              disabled={isSystem}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sales"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role-description">Description</Label>
            <Input
              id="role-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional"
            />
          </div>

          <div className="space-y-3">
            <Label>Permissions</Label>
            {catalog.groups.map((group: PermissionGroup) => (
              <div key={group.key} className="rounded-md border border-border/60 p-3">
                <div className="mb-2 text-sm font-medium">{group.label}</div>
                <div className="grid grid-cols-2 gap-2">
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
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || !name.trim()}>
            {role ? "Save changes" : "Create role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
