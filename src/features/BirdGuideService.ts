import birdFacts from "../data/bird_facts.json";
import birdsData from "../data/birds.json";
import migrationsData from "../data/migrations.json";
import { findAnswer, getQuestionPrompts } from "../systems/AIGuideSystem";
import type { Bird, Language, MigrationRoute } from "../types";
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
const allBirds = birdsData as Bird[];
const migrations = migrationsData as MigrationRoute[];
const birdMap = new Map(allBirds.map((b) => [b.id, b]));

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

function findMigrationContext(query: string, birdId?: string, lang: "zh" | "en" = "en"): string | null {
  const lower = query.toLowerCase();
  const migrationKeywords = ["migrate", "migration", "fly", "travel", "journey", "迁徙", "飞行", "旅行", "候鸟"];
  if (!migrationKeywords.some((k) => lower.includes(k))) return null;

  if (birdId) {
    const route = migrations.find((r) => r.from === birdId || r.to === birdId);
    if (route) {
      const fromBird = birdMap.get(route.from);
      const toBird = birdMap.get(route.to);
      if (fromBird && toBird) {
        const dist = route.migrationDistanceKm ?? 0;
        return lang === "zh"
          ? `${fromBird.nameZh}会从${fromBird.nameZh}的栖息地迁徙到${toBird.nameZh}的栖息地，飞行距离约${dist}千米！这是一段令人惊叹的旅程。`
          : `The ${fromBird.nameEn} migrates from its habitat to the region of the ${toBird.nameEn}, covering about ${dist} km! That's an amazing journey.`;
      }
    }
  }

  const farthest = migrations.reduce((best, r) =>
    (r.migrationDistanceKm ?? 0) > (best.migrationDistanceKm ?? 0) ? r : best,
  );
  if (lower.includes("farthest") || lower.includes("longest") || lower.includes("最远") || lower.includes("最长")) {
    return lang === "zh"
      ? `北极燕鸥是迁徙距离最远的鸟类之一，每年在北极和南极之间往返，飞行距离超过${farthest.migrationDistanceKm}千米！`
      : `The Arctic Tern is one of the farthest-migrating birds, traveling over ${farthest.migrationDistanceKm} km between the Arctic and Antarctic each year!`;
  }

  return lang === "zh"
    ? "许多鸟类会迁徙来寻找更暖和的天气和更多的食物。例如，北极燕鸥每年从北极飞到南极再飞回来！"
    : "Many birds migrate to find warmer weather and more food. For example, the Arctic Tern travels from the Arctic to Antarctica every year!";
}

function findHabitatContext(query: string, birdId?: string, lang: "zh" | "en" = "en"): string | null {
  const lower = query.toLowerCase();
  const habitatKeywords = ["habitat", "live", "home", "where", "栖息", "住", "哪里", "家"];
  if (!habitatKeywords.some((k) => lower.includes(k))) return null;

  if (birdId) {
    const bird = birdMap.get(birdId);
    if (bird?.habitatType) {
      const habitatNames: Record<string, { zh: string; en: string }> = {
        rainforest: { zh: "热带雨林", en: "tropical rainforests" },
        wetlands: { zh: "湿地", en: "wetlands" },
        coast: { zh: "海岸", en: "coastal areas" },
        grassland: { zh: "草原", en: "grasslands" },
        forest: { zh: "森林", en: "forests" },
        polar: { zh: "极地", en: "polar regions" },
        mountains: { zh: "山地", en: "mountains" },
        desert: { zh: "沙漠", en: "deserts" },
        ocean: { zh: "海洋", en: "oceans" },
        tundra: { zh: "苔原", en: "tundra" },
      };
      const h = habitatNames[bird.habitatType];
      if (h) {
        return lang === "zh"
          ? `${bird.nameZh}生活在${h.zh}中。${bird.funFactZh}`
          : `The ${bird.nameEn} lives in ${h.en}. ${bird.funFactEn}`;
      }
    }
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

/**
 * Multi-source RAG answer: knowledge base → bird_facts → migration context → habitat context.
 */
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

  const migrationCtx = findMigrationContext(query, birdId, lang);
  if (migrationCtx) return migrationCtx;

  const habitatCtx = findHabitatContext(query, birdId, lang);
  if (habitatCtx) return habitatCtx;

  return lang === "zh" ? (zhFact ?? zhKb) : (enFact ?? enKb);
}

/**
 * RAG-like orchestration: OpenAI when an API key is set; otherwise multi-source
 * local knowledge (knowledge base + bird_facts + migration + habitat).
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

  const migEn = findMigrationContext(question, birdId, "en");
  const migZh = findMigrationContext(question, birdId, "zh");
  if (migEn && migZh) {
    return { answer: migEn, answerZh: migZh };
  }

  const habEn = findHabitatContext(question, birdId, "en");
  const habZh = findHabitatContext(question, birdId, "zh");
  if (habEn && habZh) {
    return { answer: habEn, answerZh: habZh };
  }

  return {
    answer: enFact ?? migEn ?? habEn ?? enKb,
    answerZh: zhFact ?? migZh ?? habZh ?? zhKb,
  };
}
