export const managedFileKeys = {
  all: ["managed-files"] as const,
  owner: (ownerKind: "task" | "workspace", ownerId: number) => [...managedFileKeys.all, ownerKind, ownerId] as const,
  file: (id: number) => [...managedFileKeys.all, "file", id] as const,
};
