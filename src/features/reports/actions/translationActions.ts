"use server";

import axios from "axios";
import { getCachedTranslation, setCachedTranslation } from "@/shared/cache/translationCache";
import type { ActionResult } from "@/shared/actions/types";
import { success, failure } from "@/shared/actions/utils";

const API_KEY = process.env.OPENAI_KEY;

async function translateWithRetry(
  text: string,
  targetLanguage: "en" | "es",
  sourceLanguage: "en" | "es",
  maxRetries = 2,
  initialDelay = 10000
): Promise<string> {
  let lastError: any = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = initialDelay * Math.pow(2, attempt - 1) + Math.random() * 5000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      const headers: Record<string, string> = {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      };

      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `You are a professional translator. Translate the following text from ${sourceLanguage === "en" ? "English" : "Spanish"} to ${targetLanguage === "en" ? "English" : "Spanish"}. Only return the translated text, nothing else.`,
            },
            {
              role: "user",
              content: text,
            },
          ],
          temperature: 0.3,
          max_tokens: 500,
        },
        {
          headers,
          timeout: 30000,
        }
      );

      return response.data.choices[0]?.message?.content?.trim() || text;
    } catch (error: any) {
      lastError = error;
      const isRateLimit = error.response?.status === 429;
      const isLastAttempt = attempt === maxRetries - 1;

      if (isRateLimit && !isLastAttempt) {
        continue;
      }

      if (!isRateLimit || isLastAttempt) {
        throw error;
      }
    }
  }

  throw lastError || new Error("Failed to translate after multiple retries");
}

export async function translateTextAction(
  text: string,
  targetLanguage: "en" | "es",
  sourceLanguage?: "en" | "es"
): Promise<ActionResult<string>> {
  try {
    if (!text || !text.trim()) {
      return success(text);
    }

    if (!API_KEY) {
      return failure("Translation service is not configured");
    }

    const sourceLang = sourceLanguage || (targetLanguage === "en" ? "es" : "en");

    // Check cache first
    const cached = getCachedTranslation(text, sourceLang, targetLanguage);
    if (cached) {
      return success(cached);
    }

    const translatedText = await translateWithRetry(text, targetLanguage, sourceLang);

    // Cache the result
    setCachedTranslation(text, sourceLang, targetLanguage, translatedText);

    return success(translatedText);
  } catch (error: any) {
    if (error.response?.status === 429) {
      return failure("Rate limit exceeded. Please try again in a moment.");
    }
    return failure(error.message || "Failed to translate text");
  }
}

export async function translateBatchAction(
  texts: string[],
  targetLanguage: "en" | "es",
  sourceLanguage?: "en" | "es"
): Promise<ActionResult<string[]>> {
  try {
    if (!texts || texts.length === 0) {
      return success(texts);
    }

    if (!API_KEY) {
      return failure("Translation service is not configured");
    }

    const sourceLang = sourceLanguage || (targetLanguage === "en" ? "es" : "en");
    const translatedTexts: string[] = [];
    const delayBetweenRequests = 2000;

    for (let i = 0; i < texts.length; i++) {
      const text = texts[i];

      if (!text || !text.trim()) {
        translatedTexts.push(text);
        continue;
      }

      try {
        // Check cache first
        const cached = getCachedTranslation(text, sourceLang, targetLanguage);
        if (cached) {
          translatedTexts.push(cached);
          continue;
        }

        const translated = await translateWithRetry(text, targetLanguage, sourceLang);
        translatedTexts.push(translated);

        // Cache the result
        setCachedTranslation(text, sourceLang, targetLanguage, translated);

        // Add delay between requests (except for the last one)
        if (i < texts.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, delayBetweenRequests));
        }
      } catch (error: any) {
        // If rate limit after all retries, return original text but continue with others
        translatedTexts.push(text);

        if (error.response?.status === 429) {
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      }
    }

    return success(translatedTexts);
  } catch (error: any) {
    return failure(error.message || "Failed to translate texts");
  }
}

