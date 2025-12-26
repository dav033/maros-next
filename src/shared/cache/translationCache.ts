/**
 * Simple in-memory cache for translations
 * In production, consider using Redis or a similar solution
 */

interface CacheEntry {
  translatedText: string;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

function getCacheKey(
  text: string,
  sourceLanguage: "en" | "es",
  targetLanguage: "en" | "es"
): string {
  return `${text}:${sourceLanguage}:${targetLanguage}`;
}

export function getCachedTranslation(
  text: string,
  sourceLanguage: "en" | "es",
  targetLanguage: "en" | "es"
): string | null {
  const key = getCacheKey(text, sourceLanguage, targetLanguage);
  const entry = cache.get(key);

  if (!entry) {
    return null;
  }

  // Check if entry is expired
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }

  return entry.translatedText;
}

export function setCachedTranslation(
  text: string,
  sourceLanguage: "en" | "es",
  targetLanguage: "en" | "es",
  translatedText: string
): void {
  const key = getCacheKey(text, sourceLanguage, targetLanguage);
  cache.set(key, {
    translatedText,
    timestamp: Date.now(),
  });
}

// Optional: Clear cache function for testing or manual invalidation
export function clearTranslationCache(): void {
  cache.clear();
}



