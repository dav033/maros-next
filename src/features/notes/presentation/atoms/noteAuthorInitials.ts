import type { NoteAuthor } from "@/notes/domain";

/**
 * Two-letter avatar label: initials from the name, or the first two characters of the
 * email's local part when the account has no name yet.
 */
export function noteAuthorInitials(author: NoteAuthor): string {
  const words = (author.name ?? "").trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return author.email.slice(0, 2).toUpperCase();
}

/** "Marcos Rivera", falling back to the email when the account has no name. */
export function noteAuthorName(author: NoteAuthor): string {
  return author.name?.trim() || author.email;
}
