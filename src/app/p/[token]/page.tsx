import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { fetchPublicNote, fetchPublicNoteTree } from "@/features/notes/infra/public/publicNoteClient";
import { PublicNoteReader } from "@/features/notes/presentation/pages/PublicNoteReader";
import { extractPublicNoteSummary } from "@/features/notes/domain";

export const dynamic = "force-dynamic";

interface PublicNoteRouteProps {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ page?: string }>;
}

/**
 * Indexing is opt-in per link and off by default: publishing a quote for one customer
 * should not put it in Google. `follow: false` regardless — even a link the owner chose
 * to expose has no reason to hand crawlers the rest of the subtree.
 */
export async function generateMetadata({
  params,
}: PublicNoteRouteProps): Promise<Metadata> {
  const { token } = await params;
  const result = await fetchPublicNote(token);

  if (result.status !== "ok") {
    return { title: "Maros Construction", robots: { index: false, follow: false } };
  }

  const { page, allowIndexing } = result.data;
  const description = extractPublicNoteSummary(page.content);

  return {
    title: page.title || "Untitled",
    description,
    robots: { index: allowIndexing, follow: false },
    openGraph: {
      title: page.title || "Untitled",
      description,
      type: "article",
    },
  };
}

export default async function PublicNotePage({
  params,
  searchParams,
}: PublicNoteRouteProps) {
  const { token } = await params;
  const { page: pageParam } = await searchParams;

  const requestedPageId = pageParam ? Number(pageParam) : undefined;
  const result = await fetchPublicNote(
    token,
    Number.isInteger(requestedPageId) ? requestedPageId : undefined
  );

  if (result.status === "locked") redirect(`/p/${token}/unlock`);
  if (result.status === "expired") redirect(`/p/${token}/expired`);
  if (result.status === "not-found") notFound();

  // Only fetched when the link publishes a folder — a single published page has no
  // navigation to draw.
  const tree = result.data.includeChildren ? await fetchPublicNoteTree(token) : [];

  return <PublicNoteReader token={token} data={result.data} tree={tree} />;
}
