import type { Metadata } from "next";
import { CalendarX } from "lucide-react";

export const metadata: Metadata = {
  title: "Link expired",
  robots: { index: false, follow: false },
};

/**
 * Its own page rather than a silent 404. The reader had a real link; telling them it
 * aged out is both true and actionable, and reveals nothing they did not already have.
 */
export default function PublicNoteExpiredPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-3 px-6 text-center">
      <CalendarX className="h-10 w-10 text-muted-foreground" />
      <h1 className="text-xl font-semibold">This link has expired</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        The note is still there — the link just reached the end of the period it was
        shared for. Ask whoever sent it to you for a new one.
      </p>
    </div>
  );
}
