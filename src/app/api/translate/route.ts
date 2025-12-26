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
      // Agregar delay antes de cada intento (excepto el primero)
      if (attempt > 0) {
        // Delay exponencial: 10s, 20s
        const delay =
          initialDelay * Math.pow(2, attempt - 1) + Math.random() * 5000;
        console.warn(
          `Rate limit hit, waiting ${Math.round(delay / 1000)}s before retry (attempt ${attempt + 1}/${maxRetries})`
        );
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
          timeout: 30000, // 30 segundos timeout
        }
      );

      return response.data.choices[0]?.message?.content?.trim() || text;
    } catch (error: any) {
      lastError = error;
      const isRateLimit = error.response?.status === 429;
      const isLastAttempt = attempt === maxRetries - 1;

      if (isRateLimit) {
        // Registrar información detallada del rate limit
        const errorMessage =
          error.response?.data?.error?.message ||
          error.message ||
          "Unknown error";
        const errorType = error.response?.data?.error?.type || "unknown";
        const errorCode = error.response?.data?.error?.code || "unknown";

        // Headers de rate limit
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

        // Determinar el tipo de rate limit
        let limitType = "unknown";
        if (
          errorMessage.toLowerCase().includes("quota") ||
          errorMessage.toLowerCase().includes("billing")
        ) {
          limitType = "quota/billing";
        } else if (rateLimitHeaders["x-ratelimit-remaining-requests"] === "0") {
          limitType = "requests_per_minute";
        } else if (rateLimitHeaders["x-ratelimit-remaining-tokens"] === "0") {
          limitType = "tokens_per_minute";
        } else {
          limitType = "general_rate_limit";
        }

        console.error("OpenAI Rate Limit Error Details:", {
          attempt: attempt + 1,
          errorMessage: errorMessage,
          errorType: errorType,
          errorCode: errorCode,
          limitType: limitType,
          rateLimitHeaders: rateLimitHeaders,
          fullErrorResponse: error.response?.data,
        });

        if (!isLastAttempt) {
          // Continuar al siguiente intento
          continue;
        }
      }

      // Si no es rate limit o es el último intento, lanzar el error
      if (!isRateLimit || isLastAttempt) {
        throw error;
      }
    }
  }

  // Si llegamos aquí, todos los intentos fallaron con rate limit
  if (lastError) {
    const errorMessage =
      lastError.response?.data?.error?.message ||
      lastError.message ||
      "Unknown error";
    const rateLimitHeaders = {
      "x-ratelimit-limit-requests":
        lastError.response?.headers?.["x-ratelimit-limit-requests"],
      "x-ratelimit-limit-tokens":
        lastError.response?.headers?.["x-ratelimit-limit-tokens"],
      "x-ratelimit-remaining-requests":
        lastError.response?.headers?.["x-ratelimit-remaining-requests"],
      "x-ratelimit-remaining-tokens":
        lastError.response?.headers?.["x-ratelimit-remaining-tokens"],
    };

    console.error("All retry attempts failed with rate limit. Final details:", {
      errorMessage: errorMessage,
      rateLimitHeaders: rateLimitHeaders,
    });
  }

  throw lastError || new Error("Failed to translate after multiple retries");
}

export async function POST(request: NextRequest) {
  let originalText = "";

  try {
    const body: TranslationRequest = await request.json();
    const { text, targetLanguage, sourceLanguage } = body;
    originalText = text; // Guardar para usar en el catch

    if (!text || !text.trim()) {
      return NextResponse.json({ translatedText: text }, { status: 200 });
    }

    const apiKey = process.env.OPENAI_KEY;

    if (!apiKey) {
      console.warn("OPENAI_API_KEY is not configured");
      return NextResponse.json(
        { error: "Translation service is not configured" },
        { status: 500 }
      );
    }

    // Si no hay sourceLanguage, intentar detectarlo o asumir que es el opuesto
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

    // Si es rate limit después de todos los reintentos, registrar detalles y retornar el texto original
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

      console.warn(
        "Rate limit exceeded after all retries. Final error details:",
        {
          errorMessage: errorMessage,
          errorType: error.response?.data?.error?.type,
          errorCode: error.response?.data?.error?.code,
          rateLimitHeaders: rateLimitHeaders,
          fullErrorResponse: error.response?.data,
        }
      );

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

    // Para otros errores, registrar también
    console.error("Error translating text:", {
      statusCode: statusCode,
      errorMessage: error.message,
      errorDetails: error.response?.data,
      stack: error.stack,
    });

    const errorMessage = error.message || "Failed to translate text";

    return NextResponse.json(
      { error: errorMessage, details: error.response?.data },
      { status: statusCode }
    );
  }
}
