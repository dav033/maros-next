export function getOpenAiApiKey(): string | undefined {
  return process.env.OPENAI_KEY || process.env.OPENAI_API_KEY;
}
