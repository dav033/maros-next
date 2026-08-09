import { FileQuestion } from "lucide-react";

/**
 * One page for "wrong token", "revoked link" and "the note went to the trash". They
 * answer identically on the API too: telling them apart would let anyone holding an old
 * URL work out whether the note still exists.
 */
export default function PublicNoteNotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-3 px-6 text-center">
      <FileQuestion className="h-10 w-10 text-muted-foreground" />
      <h1 className="text-xl font-semibold">This link isn’t available</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        It may have been withdrawn, or the address may be incomplete. Ask whoever shared
        it with you for a new one.
      </p>
    </div>
  );
}
