import { formatDistanceToNow } from "date-fns";

/** "2 hours ago", "3 days ago", etc. Falls back to the raw ISO string on a bad date. */
export function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return formatDistanceToNow(date, { addSuffix: true });
}
