import type { AIProvider } from "../types";

const AI_TIMEOUT_MS = 10_000;

export class OpenAIProvider implements AIProvider {
  id = "openai";

  isAvailable(): boolean {
    const key = import.meta.env.VITE_OPENAI_API_KEY;
    return typeof key === "string" && key.trim().length > 0;
  }

  async generate(
    systemPrompt: string,
    userPrompt: string,
  ): Promise<{ text: string; textZh: string } | null> {
    const key = import.meta.env.VITE_OPENAI_API_KEY;
    if (!key?.trim()) return null;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.6,
          max_tokens: 400,
        }),
        signal: controller.signal,
      });

      if (!res.ok) return null;

      const data = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const raw = data.choices?.[0]?.message?.content?.trim();
      if (!raw) return null;

      try {
        const parsed = JSON.parse(raw) as { text?: string; textZh?: string };
        if (
          typeof parsed.text === "string" &&
          parsed.text.length > 0 &&
          typeof parsed.textZh === "string" &&
          parsed.textZh.length > 0
        ) {
          return { text: parsed.text, textZh: parsed.textZh };
        }
      } catch {
        // JSON parse failed — use raw text as both languages
      }

      return { text: raw, textZh: raw };
    } catch {
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }
}

const defaultProvider = new OpenAIProvider();

export function getAIProvider(): AIProvider {
  return defaultProvider;
}
