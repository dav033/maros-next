"use client";

import { useState } from "react";
import { Pencil, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  const { roles, isLoading } = useInstantRolesList();
  const { deleteMutation } = useRoleMutations();
  const [editing, setEditing] = useState<AppRole | null>(null);
  const [creating, setCreating] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<AppRole | null>(null);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading roles…</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setCreating(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New role
        </Button>
      </div>

      <div className="space-y-2">
        {roles.map((role) => (
          <div
            key={role.id}
            className="flex items-center justify-between rounded-md border border-border/60 p-4"
          >
            <div>
              <div className="flex items-center gap-2 font-medium">
                {role.name}
                {role.isSystem && (
                  <Badge variant="outline" className="gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    Built in
                  </Badge>
                )}
              </div>
              {role.description && (
                <p className="text-sm text-muted-foreground">{role.description}</p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                {role.permissions.length} permission{role.permissions.length === 1 ? "" : "s"}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => setEditing(role)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                disabled={role.isSystem}
                title={role.isSystem ? "Built-in roles cannot be deleted" : "Delete role"}
                onClick={() => setPendingDelete(role)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

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
            <AlertDialogTitle>Delete role "{pendingDelete?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This only works if no user is currently assigned to it. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingDelete) deleteMutation.mutate(pendingDelete.id);
                setPendingDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
