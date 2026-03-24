import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

interface BatchTranslationRequest {
  texts: string[];
  targetLanguage: "en" | "es";
  sourceLanguage?: "en" | "es";
}

async function translateWithRetry(
  text: string,
  targetLanguage: "en" | "es",
  sourceLanguage: "en" | "es",
  apiKey: string,
  maxRetries = 5,
  initialDelay = 3000
): Promise<string> {
  let lastError: any = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        // Delay exponencial: 3s, 6s, 12s, 24s, 48s
        const delay =
          initialDelay * Math.pow(2, attempt - 1) + Math.random() * 2000;
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

export async function POST(request: NextRequest) {
  try {
    const body: BatchTranslationRequest = await request.json();
    const { texts, targetLanguage, sourceLanguage } = body;

    if (!texts || texts.length === 0) {
      return NextResponse.json({ translatedTexts: texts }, { status: 200 });
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

    const translatedTexts: string[] = [];
    const delayBetweenRequests = 2000;

    for (let i = 0; i < texts.length; i++) {
      const text = texts[i];

      if (!text || !text.trim()) {
        translatedTexts.push(text);
        continue;
      }

      try {
        const translated = await translateWithRetry(
          text,
          targetLanguage,
          sourceLang,
          apiKey
        );
        translatedTexts.push(translated);

        if (i < texts.length - 1) {
          await new Promise((resolve) =>
            setTimeout(resolve, delayBetweenRequests)
          );
        }
      } catch (error: any) {
        // Si falla (incluyendo rate limit tras todos los reintentos), usar texto original
        translatedTexts.push(text);

        if (error.response?.status === 429) {
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      }
    }

    return NextResponse.json({ translatedTexts }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        error:
          error.response?.status === 429
            ? "Rate limit exceeded. Please try again in a moment."
            : "Failed to translate texts",
        details: error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}
