"use client";

import { UsersTable } from "../organisms/UsersTable";

export function UsersSettingsPageView() {
  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <h1 className="text-2xl font-semibold">Users</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Anyone with a @marosconstruction.com Google account gets access automatically on
        first login. Change their role or deactivate them here — it takes effect on their
        next request, no re-login needed.
      </p>
      <UsersTable />
    </div>
  );
}
