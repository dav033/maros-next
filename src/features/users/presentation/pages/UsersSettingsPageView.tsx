"use client";

import { UsersTable } from "../organisms/UsersTable";

export function UsersSettingsPageView() {
  return (
    <div className="mx-auto min-w-0 max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <h1 className="font-display text-2xl font-semibold">Usuarios</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Quienes tengan una cuenta de Google @marosconstruction.com obtienen acceso al
        iniciar sesión por primera vez. Para el resto, envía una invitación. Aquí puedes
        cambiar roles o desactivar accesos; los cambios aplican en la próxima solicitud,
        sin que tengan que iniciar sesión de nuevo.
      </p>
      <UsersTable />
    </div>
  );
}
