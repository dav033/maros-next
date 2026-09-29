/**
 * Hands a query from anywhere in the notes UI to the ⌘K palette.
 *
 * The workspace has two searches that look identical and are not: the filter on the
 * home list only matches titles and labels in the tree already in memory, while the
 * palette runs full text on the server. Someone looking for a word they know they
 * typed into a note hits "No matching pages" from the first one and has no reason to
 * suspect the second exists. A tiny event bus lets that dead end re-ask the question
 * of the search that can actually answer it, without threading a ref through the
 * layout to a palette mounted in a sibling subtree.
 */
const NOTE_SEARCH_EVENT = "maros:notes:search";

export function requestNoteContentSearch(query: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<string>(NOTE_SEARCH_EVENT, { detail: query }),
  );
}

export function onNoteContentSearch(handler: (query: string) => void) {
  if (typeof window === "undefined") return () => {};
  const listener = (event: Event) => {
    handler((event as CustomEvent<string>).detail ?? "");
  };
  window.addEventListener(NOTE_SEARCH_EVENT, listener);
  return () => window.removeEventListener(NOTE_SEARCH_EVENT, listener);
}
