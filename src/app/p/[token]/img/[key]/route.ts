import { NextResponse } from "next/server";
import { fetchPublicNoteImage } from "@/features/notes/infra/public/publicNoteClient";

export const dynamic = "force-dynamic";

/**
 * Serves one image of a published note from this origin.
 *
 * Pointing `<img src>` straight at the API would put its host in the public HTML and,
 * for a password-protected link, could not work at all — an image request cannot carry
 * the unlock header. Proxying solves both.
 *
 * The authorisation decision is not made here: the API only signs keys that appear in a
 * document this very link publishes, and answers 404 for anything else. This route just
 * forwards the token and the unlock proof.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string; key: string }> }
) {
  const { token, key } = await params;

  const upstream = await fetchPublicNoteImage(token, decodeURIComponent(key));
  if (!upstream.ok || !upstream.body) {
    return new NextResponse(null, { status: 404 });
  }

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "application/octet-stream",
      // private: this is a document somebody chose to share with specific people, not
      // something a shared cache should keep a copy of.
      "Cache-Control": "private, max-age=300",
    },
  });
}
