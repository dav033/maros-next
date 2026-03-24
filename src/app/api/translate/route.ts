import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

interface TranslationRequest {
  text: string;
  targetLanguage: "en" | "es";
  sourceLanguage?: "en" | "es";
}

async function translateWithRetry(
  text: string,
  targetLanguage: "en" | "es",
  sourceLanguage: "en" | "es",
  apiKey: string,
  maxRetries = 2,
  initialDelay = 10000 // 10 segundos inicial
): Promise<string> {
  let lastError: any = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        // Delay exponencial: 10s, 20s
        const delay =
          initialDelay * Math.pow(2, attempt - 1) + Math.random() * 5000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      const headers: Record<string, string> = {
        Authorization: `Bearer ${apiKey}`,
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

      if (isRateLimit) {
        if (!isLastAttempt) {
          continue;
        }
      }

      if (!isRateLimit || isLastAttempt) {
        throw error;
      }
    }
  }

  throw lastError || new Error("Failed to translate after multiple retries");
}

export async function POST(request: NextRequest) {
  let originalText = "";

  try {
    const body: TranslationRequest = await request.json();
    const { text, targetLanguage, sourceLanguage } = body;
    originalText = text;

    if (!text || !text.trim()) {
      return NextResponse.json({ translatedText: text }, { status: 200 });
    }

    const apiKey = process.env.OPENAI_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Translation service is not configured" },
        { status: 500 }
      );
    }

    const sourceLang =
      sourceLanguage || (targetLanguage === "en" ? "es" : "en");

    const translatedText = await translateWithRetry(
      text,
      targetLanguage,
      sourceLang,
      apiKey
    );

    return NextResponse.json({ translatedText }, { status: 200 });
  } catch (error: any) {
    const statusCode = error.response?.status || 500;

    if (error.response?.status === 429) {
      const errorMessage =
        error.response?.data?.error?.message ||
        error.message ||
        "Unknown rate limit error";
      const rateLimitHeaders = {
        "x-ratelimit-limit-requests":
          error.response?.headers?.["x-ratelimit-limit-requests"],
        "x-ratelimit-limit-tokens":
          error.response?.headers?.["x-ratelimit-limit-tokens"],
        "x-ratelimit-remaining-requests":
          error.response?.headers?.["x-ratelimit-remaining-requests"],
        "x-ratelimit-remaining-tokens":
          error.response?.headers?.["x-ratelimit-remaining-tokens"],
        "x-ratelimit-reset-requests":
          error.response?.headers?.["x-ratelimit-reset-requests"],
        "x-ratelimit-reset-tokens":
          error.response?.headers?.["x-ratelimit-reset-tokens"],
      };

      return NextResponse.json(
        {
          translatedText: originalText,
          warning:
            "Translation service is currently rate-limited. Original text returned.",
          rateLimitInfo: {
            message: errorMessage,
            headers: rateLimitHeaders,
          },
        },
        { status: 200 }
      );
    }

    const errorMessage = error.message || "Failed to translate text";

    return NextResponse.json(
      { error: errorMessage, details: error.response?.data },
      { status: statusCode }
    );
  }
}
