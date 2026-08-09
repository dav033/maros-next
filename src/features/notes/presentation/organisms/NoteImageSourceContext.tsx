"use client";

import { createContext, useContext, useMemo } from "react";

export interface NoteImageSource {
  url: string | undefined;
  isLoading: boolean;
}

/**
 * How an image node turns its stored S3 key into something a browser can load.
 *
 * The editor resolves keys through an authenticated server action that signs a URL.
 * The public reader cannot: it has no session, and signing arbitrary keys for anonymous
 * callers is exactly the hole the API's allow-list closes. So the reader supplies its
 * own resolver, pointing at a route that only serves keys belonging to that link's own
 * document.
 *
 * `null` means "no override" — NoteImageView falls back to the authenticated path.
 */
const NoteImageSourceContext = createContext<((src: string) => NoteImageSource) | null>(
  null
);

export function useNoteImageSourceOverride() {
  return useContext(NoteImageSourceContext);
}

/**
 * Serves every image of a published note through the reader's own origin.
 *
 * Going straight to the API would leak its host into the public page and, for a
 * password-protected link, could not carry the unlock proof at all — an <img> tag
 * cannot set headers.
 */
export function PublicNoteImageSource({
  token,
  children,
}: {
  token: string;
  children: React.ReactNode;
}) {
  const resolve = useMemo(
    () => (src: string) => {
      if (/^https?:\/\//.test(src) || src.startsWith("data:")) {
        return { url: src, isLoading: false };
      }
      return {
        url: `/p/${encodeURIComponent(token)}/img/${encodeURIComponent(src)}`,
        isLoading: false,
      };
    },
    [token]
  );

  return (
    <NoteImageSourceContext.Provider value={resolve}>
      {children}
    </NoteImageSourceContext.Provider>
  );
}
