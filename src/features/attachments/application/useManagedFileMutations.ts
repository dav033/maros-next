"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ManagedFilesHttpRepository } from "../infra/ManagedFilesHttpRepository";
import { managedFileKeys } from "./managedFileKeys";

export function useManagedFileMutations(repository = new ManagedFilesHttpRepository()) {
  const queryClient = useQueryClient();
  const invalidateOwner = (ownerKind: "task" | "workspace", ownerId: number) =>
    queryClient.invalidateQueries({ queryKey: managedFileKeys.owner(ownerKind, ownerId) });

  const complete = useMutation({ mutationFn: ({ id, ownerKind, ownerId }: { id: number; ownerKind: "task" | "workspace"; ownerId: number }) => repository.complete(id).then((file) => { invalidateOwner(ownerKind, ownerId); return file; }) });
  const retry = useMutation({ mutationFn: ({ id, ownerKind, ownerId }: { id: number; ownerKind: "task" | "workspace"; ownerId: number }) => repository.retry(id).then((intent) => { invalidateOwner(ownerKind, ownerId); return intent; }) });
  const remove = useMutation({ mutationFn: ({ id, ownerKind, ownerId }: { id: number; ownerKind: "task" | "workspace"; ownerId: number }) => repository.remove(id).then(() => { invalidateOwner(ownerKind, ownerId); }) });
  return { complete, retry, remove };
}
