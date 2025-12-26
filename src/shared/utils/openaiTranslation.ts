import { translateTextAction } from "@/features/reports/actions/translationActions";

interface TranslationCache {
  [key: string]: {
    en: string;
    es: string;
  };
}

// Cache global para evitar llamadas repetidas (cliente)
const translationCache: TranslationCache = {};

/**
 * Traduce un texto usando Server Actions
 * @param text - Texto a traducir
 * @param targetLanguage - Idioma objetivo ('en' o 'es')
 * @param sourceLanguage - Idioma origen (por defecto detecta automáticamente)
 * @returns Texto traducido
 */
export async function translateText(
  text: string,
  targetLanguage: 'en' | 'es',
  sourceLanguage?: 'en' | 'es'
): Promise<string> {
  if (!text || !text.trim()) {
    return text;
  }

  // Verificar cache cliente
  const cacheKey = text.trim().toLowerCase();
  if (translationCache[cacheKey] && translationCache[cacheKey][targetLanguage]) {
    return translationCache[cacheKey][targetLanguage];
  }

  try {
    const result = await translateTextAction(text, targetLanguage, sourceLanguage);
    
    if (!result.success) {
      console.error('Error translating text:', result.error);
      return text;
    }

    const translatedText = result.data;

    // Guardar en cache cliente
    if (!translationCache[cacheKey]) {
      translationCache[cacheKey] = {
        en: sourceLanguage === 'en' ? text : targetLanguage === 'en' ? translatedText : text,
        es: sourceLanguage === 'es' ? text : targetLanguage === 'es' ? translatedText : text,
      };
    } else {
      translationCache[cacheKey][targetLanguage] = translatedText;
    }

    return translatedText;
  } catch (error: any) {
    console.error('Error translating text:', error);
    return text; // Retornar texto original en caso de error
  }
}

import { translateBatchAction } from "@/features/reports/actions/translationActions";

/**
 * Traduce múltiples textos usando Server Actions
 * @param texts - Array de textos a traducir
 * @param targetLanguage - Idioma objetivo
 * @param sourceLanguage - Idioma origen
 * @returns Array de textos traducidos
 */
export async function translateMultipleTexts(
  texts: string[],
  targetLanguage: 'en' | 'es',
  sourceLanguage?: 'en' | 'es'
): Promise<string[]> {
  if (!texts || texts.length === 0) {
    return texts;
  }

  try {
    const result = await translateBatchAction(texts, targetLanguage, sourceLanguage);
    
    if (!result.success) {
      console.error('Error translating texts:', result.error);
      return texts;
    }

    const translatedTexts = result.data;

    // Guardar en cache cliente
    texts.forEach((text, idx) => {
      if (text && text.trim()) {
        const cacheKey = text.trim().toLowerCase();
        const translated = translatedTexts[idx] || text;
        
        if (!translationCache[cacheKey]) {
          translationCache[cacheKey] = {
            en: sourceLanguage === 'en' ? text : targetLanguage === 'en' ? translated : text,
            es: sourceLanguage === 'es' ? text : targetLanguage === 'es' ? translated : text,
          };
        } else {
          translationCache[cacheKey][targetLanguage] = translated;
        }
      }
    });

    return translatedTexts;
  } catch (error: any) {
    console.error('Error translating texts:', error);
    return texts; // Retornar textos originales en caso de error
  }
}

/**
 * Limpia el cache de traducciones
 */
export function clearTranslationCache(): void {
  Object.keys(translationCache).forEach((key) => delete translationCache[key]);
}

