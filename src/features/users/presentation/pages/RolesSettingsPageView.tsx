"use client";

import { RolesList } from "../organisms/RolesList";

export function RolesSettingsPageView() {
  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <h1 className="text-2xl font-semibold">Roles</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Admin and Member are built in and cannot be deleted, but their permissions can
        still be adjusted.
      </p>
      <RolesList />
    </div>
  );
}
