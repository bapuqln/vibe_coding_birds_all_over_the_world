import birdFacts from "../data/bird_facts.json";
import { findAnswer, getQuestionPrompts } from "../systems/AIGuideSystem";
import type { Language } from "../types";
import { buildPrompt } from "./PromptBuilder";

export { getQuestionPrompts };

type BirdFactEntry = {
  id: string;
  question: string;
  questionZh: string;
  answer: string;
  answerZh: string;
  category: string;
};

const facts = birdFacts as BirdFactEntry[];

const DEFAULT_EN =
  "That's a great question! The world of birds is full of wonderful secrets. Try asking me about bird behavior, food, or habitats!";
const DEFAULT_ZH =
  "这是一个很好的问题！鸟类世界充满了奇妙的秘密。试着问我关于鸟类的习性、食物或栖息地的问题吧！";

function findAnswerInFacts(query: string, _birdId?: string, lang: "zh" | "en" = "en"): string | null {
  void _birdId;
  const lower = query.toLowerCase().trim();
  if (!lower) return null;

  let bestMatch: BirdFactEntry | null = null;
  let bestScore = 0;

  for (const f of facts) {
    const enQ = f.question.toLowerCase();
    const zhQ = f.questionZh.toLowerCase();
    let score = 0;

    if (lower.length >= 4 && (enQ.includes(lower) || zhQ.includes(lower))) score += 4;
    if (enQ.length >= 8 && lower.includes(enQ.slice(0, 16))) score += 3;
    if (zhQ.length >= 2 && lower.includes(zhQ.slice(0, Math.min(8, zhQ.length)))) score += 3;

    for (const token of lower.split(/\s+/)) {
      if (token.length < 2) continue;
      if (enQ.includes(token)) score += 1;
      if (zhQ.includes(token)) score += 1;
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = f;
    }
  }

  if (bestMatch && bestScore >= 2) {
    return lang === "zh" ? bestMatch.answerZh : bestMatch.answer;
  }
  return null;
}

function isDefaultKnowledgeAnswer(text: string): boolean {
  return text === DEFAULT_EN || text === DEFAULT_ZH;
}

async function tryOpenAI(question: string, birdId?: string): Promise<{ answer: string; answerZh: string } | null> {
  const key = import.meta.env.VITE_OPENAI_API_KEY;
  if (!key?.trim()) return null;

  const body = {
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system" as const,
        content:
          "You are a friendly bird educator for children. Reply ONLY with valid JSON: {\"answer\":\"English reply\",\"answerZh\":\"Simplified Chinese reply\"}. Keep both short and clear.",
      },
      { role: "user" as const, content: buildPrompt(question, birdId) },
    ],
    temperature: 0.6,
    max_tokens: 400,
  };

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) return null;

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const raw = data.choices?.[0]?.message?.content?.trim();
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as { answer?: string; answerZh?: string };
    if (parsed.answer && parsed.answerZh) {
      return { answer: parsed.answer, answerZh: parsed.answerZh };
    }
  } catch {
    return { answer: raw, answerZh: raw };
  }
  return null;
}

/** Synchronous answer for the current UI language (local knowledge + bird_facts). */
export function getGuideAnswer(query: string, birdId: string | undefined, language: Language): string {
  const lang = language === "zh" ? "zh" : "en";
  const enKb = findAnswer(query, birdId, "en");
  const zhKb = findAnswer(query, birdId, "zh");
  if (!isDefaultKnowledgeAnswer(enKb) || !isDefaultKnowledgeAnswer(zhKb)) {
    return lang === "zh" ? zhKb : enKb;
  }
  const enFact = findAnswerInFacts(query, birdId, "en");
  const zhFact = findAnswerInFacts(query, birdId, "zh");
  if (enFact && zhFact) {
    return lang === "zh" ? zhFact : enFact;
  }
  return lang === "zh" ? (zhFact ?? zhKb) : (enFact ?? enKb);
}

/**
 * RAG-like orchestration: OpenAI when an API key is set; otherwise prewritten
 * answers from bird_facts.json and the main guide knowledge base.
 */
export async function askQuestion(
  question: string,
  birdId?: string,
): Promise<{ answer: string; answerZh: string }> {
  const fromApi = await tryOpenAI(question, birdId);
  if (fromApi) return fromApi;

  const enKb = findAnswer(question, birdId, "en");
  const zhKb = findAnswer(question, birdId, "zh");

  if (!isDefaultKnowledgeAnswer(enKb) || !isDefaultKnowledgeAnswer(zhKb)) {
    return { answer: enKb, answerZh: zhKb };
  }

  const enFact = findAnswerInFacts(question, birdId, "en");
  const zhFact = findAnswerInFacts(question, birdId, "zh");
  if (enFact && zhFact) {
    return { answer: enFact, answerZh: zhFact };
  }

  return {
    answer: enFact ?? enKb,
    answerZh: zhFact ?? zhKb,
  };
}
