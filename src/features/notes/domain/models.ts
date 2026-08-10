export type NoteEntityKind = "lead" | "project" | "contact" | "company";

/** A folder groups pages and has no document of its own. */
export type NoteKind = "page" | "folder";

export interface NoteTag {
  id: number;
  name: string;
  color: string;
}

/**
 * Denormalized on the page rather than resolved client-side: listing users needs the
 * `users:read` permission, which members don't have.
 */
export interface NoteAuthor {
  id: number;
  name: string | null;
  email: string;
  picture: string | null;
}

/**
 * Who can reach a note from inside the CRM.
 *
 * Being published to the web is deliberately not a value here — that lives on a share
 * link, so a note can be published and private at the same time, and unpublishing does
 * not change who at Maros can read it.
 */
export type NoteVisibility = "private" | "team";

/**
 * What the signed-in user may do with a note, weakest first.
 *
 * `commenter` is granted and stored but behaves exactly like `viewer` until a comments
 * UI exists — a declared gap rather than a level invented later on top of live data.
 */
export type NoteAccessLevel = "none" | "viewer" | "commenter" | "editor" | "owner";

const ACCESS_RANK: Record<NoteAccessLevel, number> = {
  none: 0,
  viewer: 1,
  commenter: 2,
  editor: 3,
  owner: 4,
};

export function hasNoteAccess(actual: NoteAccessLevel, required: NoteAccessLevel): boolean {
  return ACCESS_RANK[actual] >= ACCESS_RANK[required];
}

export interface NotePageSummary {
  id: number;
  parentId: number | null;
  kind: NoteKind;
  title: string;
  icon: string | null;
  position: number;
  /** Personal to the signed-in user, not a property of the page itself. */
  isFavorite: boolean;
  visibility: NoteVisibility;
  /** Carries a direct grant — the tree badges these without asking per row. */
  isShared: boolean;
  /** Has a live public link right now. */
  isPublished: boolean;
  entityKind: NoteEntityKind | null;
  entityId: number | null;
  ownerId: number | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  lastEditedBy: NoteAuthor | null;
  tags: NoteTag[];
}

export interface NotePage extends NotePageSummary {
  content: Record<string, unknown>;
  /**
   * Only the open page carries this. Resolving it for a whole tree would mean one grant
   * lookup per row, so list views deliberately go without.
   */
  myAccess: NoteAccessLevel;
}

export type NotePageId = number;

export type NotePageDraft = Readonly<{
  title?: string;
  icon?: string;
  kind?: NoteKind;
  parentId?: number | null;
  entityKind?: NoteEntityKind;
  entityId?: number;
}>;

/** Both null clears the link; otherwise they travel together. */
export type NoteEntityLink = Readonly<{
  entityKind: NoteEntityKind | null;
  entityId: number | null;
}>;

export type NotePagePatch = Readonly<{
  title?: string;
  icon?: string;
}>;

export interface NoteTreeNode extends NotePageSummary {
  children: NoteTreeNode[];
}

export interface NoteMoveResult {
  id: number;
  parentId: number | null;
  position: number;
  /**
   * The move took the page out of a folder that carried grants, so people who reached
   * it through that folder no longer can. Surfaced to the user — losing access silently
   * is how someone ends up unable to open a note nobody remembers moving.
   */
  accessChanged: boolean;
}

// ---------------------------------------------------------------------------
// Sharing
// ---------------------------------------------------------------------------

export type NoteShareSubjectType = "user" | "role";
export type NoteShareAccess = "viewer" | "commenter" | "editor";

export interface NoteShare {
  id: number;
  subjectType: NoteShareSubjectType;
  subjectId: number;
  access: NoteShareAccess;
  expiresAt: string | null;
  createdAt: string;
  /**
   * Title of the ancestor the grant is written on, or null when it belongs to this
   * page. An inherited grant is read-only here: changing it would silently alter access
   * for every other page in that subtree.
   */
  inheritedFrom: string | null;
  subject: {
    name: string | null;
    email: string | null;
    picture: string | null;
  };
}

export interface NoteShareLink {
  id: number;
  /** First characters of the token — enough to tell two links apart, useless alone. */
  tokenHint: string;
  hasPassword: boolean;
  includeChildren: boolean;
  allowIndexing: boolean;
  showAuthor: boolean;
  expiresAt: string | null;
  revokedAt: string | null;
  isActive: boolean;
  viewCount: number;
  lastViewedAt: string | null;
  createdAt: string;
  createdById: number | null;
  /**
   * Present only in the response that created or rotated the link. The token is stored
   * as a SHA-256 and cannot be recovered afterwards, so a link whose URL was lost gets
   * rotated, never re-read.
   */
  url?: string;
}

/** Everything the share dialog renders, in one request. */
export interface NoteAccessPanel {
  pageId: number;
  myAccess: NoteAccessLevel;
  visibility: NoteVisibility;
  ownerId: number | null;
  shares: NoteShare[];
  links: NoteShareLink[];
}

export interface NoteLinkDailyViews {
  day: string;
  views: number;
}

export interface NoteLinkStats {
  linkId: number;
  totalViews: number;
  /** Counted from salted IP hashes: unique readers without storing an address. */
  uniqueVisitors: number;
  lastViewedAt: string | null;
  byDay: NoteLinkDailyViews[];
  recent: Array<{ viewedAt: string; userAgent: string | null; referer: string | null }>;
}

/** A live public link as seen by a workspace administrator. It deliberately excludes its token. */
export interface NoteAdminLink extends NoteShareLink {
  page: { id: number; title: string; icon: string | null } | null;
  createdBy: { id: number; name: string | null; email: string } | null;
}

export type NoteLinkDraft = Readonly<{
  password?: string;
  includeChildren?: boolean;
  allowIndexing?: boolean;
  showAuthor?: boolean;
  expiresAt?: string;
}>;

export type NoteLinkPatch = Readonly<{
  password?: string | null;
  includeChildren?: boolean;
  allowIndexing?: boolean;
  showAuthor?: boolean;
  expiresAt?: string | null;
}>;

/**
 * What a share link exposes. Notice what is missing: no owner, no entity link, no
 * emails, no favorites. It is built from an allow-list on the server, not by omitting
 * fields from the internal DTO.
 */
export interface PublicNotePage {
  id: number;
  title: string;
  icon: string | null;
  kind: NoteKind;
  content: Record<string, unknown>;
  updatedAt: string;
  author: { name: string | null; picture: string | null } | null;
  tags: Array<{ name: string; color: string }>;
}

export interface PublicNoteResponse {
  page: PublicNotePage;
  allowIndexing: boolean;
  includeChildren: boolean;
}

export interface PublicNoteTreeNode {
  id: number;
  parentId: number | null;
  title: string;
  icon: string | null;
  kind: NoteKind;
  position: number;
}

export interface NoteSearchHit {
  id: number;
  title: string;
  icon: string | null;
  parentId: number | null;
  updatedAt: string;
  rank: number;
}

export function emptyNoteDoc(): Record<string, unknown> {
  return { type: "doc", content: [] };
}
