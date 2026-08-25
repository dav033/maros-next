"use client";

import type { ManagedFile } from "../infra/ManagedFilesHttpRepository";

export function ManagedAttachmentsSection({ files, onOpen, onRemove }: { files: ManagedFile[]; onOpen?: (file: ManagedFile) => void; onRemove?: (file: ManagedFile) => void }) {
  if (files.length === 0) return <p className="text-sm text-muted-foreground">No files attached.</p>;
  return (
    <ul className="space-y-2" aria-label="Managed attachments">
      {files.map((file) => (
        <li key={file.id} className="flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm">
          <button type="button" className="min-w-0 truncate text-left underline-offset-2 hover:underline" onClick={() => onOpen?.(file)}>{file.fileName}</button>
          <span className="text-xs text-muted-foreground">{file.status}</span>
          <button type="button" onClick={() => onRemove?.(file)}>Remove</button>
        </li>
      ))}
    </ul>
  );
}
