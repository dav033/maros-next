"use client";

import { RolesList } from "../organisms/RolesList";

export function RolesSettingsPageView() {
  return (
    <div className="mx-auto min-w-0 max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <h1 className="font-display text-2xl font-semibold">Roles</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Los roles Administrador y Miembro están integrados y no se pueden eliminar, pero
        sus permisos sí se pueden ajustar.
      </p>
      <RolesList />
    </div>
  );
}
