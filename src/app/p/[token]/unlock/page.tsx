import type { Metadata } from "next";
import { PublicNoteUnlockForm } from "@/features/notes/presentation/pages/PublicNoteUnlockForm";

export const dynamic = "force-dynamic";

/** Never indexed, whatever the link says: a password prompt has nothing to rank for. */
export const metadata: Metadata = {
  title: "Protected note",
  robots: { index: false, follow: false },
};

export default async function PublicNoteUnlockPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <PublicNoteUnlockForm token={token} />;
}
