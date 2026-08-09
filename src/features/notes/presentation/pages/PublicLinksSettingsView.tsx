"use client";

import { useState } from "react";
import { Download, Globe, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminRevokeNoteLinkAction } from "@/notes/actions/noteSharingActions";
import type { NoteAdminLink } from "@/notes/domain";

function csvCell(value: string | number | null | undefined) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export function PublicLinksSettingsView({ initialLinks }: { initialLinks: NoteAdminLink[] }) {
  const [links, setLinks] = useState(initialLinks);
  const [revoking, setRevoking] = useState<number | null>(null);

  const exportCsv = () => {
    const rows = [
      ["Note", "Author", "Created", "Expires", "Views"],
      ...links.map((link) => [link.page?.title, link.createdBy?.email, link.createdAt, link.expiresAt, link.viewCount]),
    ];
    const blob = new Blob([rows.map((row) => row.map(csvCell).join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "maros-public-note-links.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const revoke = async (link: NoteAdminLink) => {
    if (!window.confirm(`Revoke the public link for “${link.page?.title ?? "this note"}”? This cannot be undone.`)) return;
    setRevoking(link.id);
    const result = await adminRevokeNoteLinkAction(link.id);
    setRevoking(null);
    if (result.success) setLinks((current) => current.filter((item) => item.id !== link.id));
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-8 sm:py-10">
      <div className="mb-6 flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <h1 className="flex items-center gap-2 text-2xl font-semibold"><Globe className="h-6 w-6" />Public links</h1>
          <p className="mt-1 text-sm text-muted-foreground">Active note links across the workspace. Tokens are never shown or exported.</p>
        </div>
        <Button variant="outline" className="w-full shrink-0 sm:w-auto" onClick={exportCsv} disabled={links.length === 0}><Download className="mr-2 h-4 w-4" />Export CSV</Button>
      </div>
      {links.length === 0 ? <p className="text-sm text-muted-foreground">There are no active public note links.</p> : (
        <div className="overflow-hidden rounded-lg border">
          {links.map((link) => <div key={link.id} className="flex min-w-0 items-center gap-3 border-b p-3 last:border-0 sm:gap-4 sm:p-4">
            <div className="min-w-0 flex-1"><p className="truncate font-medium">{link.page?.title || "Untitled note"}</p><p className="text-xs text-muted-foreground">{link.createdBy?.email ?? "Unknown author"} · {link.viewCount} views · {link.expiresAt ? `expires ${new Date(link.expiresAt).toLocaleDateString()}` : "never expires"}</p></div>
            <Button variant="ghost" size="icon" className="text-destructive" aria-label="Revoke public link" disabled={revoking === link.id} onClick={() => void revoke(link)}><Trash2 className="h-4 w-4" /></Button>
          </div>)}
        </div>
      )}
    </div>
  );
}
