import type { KnowledgeResult } from "../types";
import { getBirdById } from "../systems/BirdSystem";
import { getTemplate, renderTemplate } from "./prompt-templates";
import { getAIProvider } from "./ai-provider";
import { getCachedExplanation, setCachedExplanation } from "./knowledge-cache";
import { findAnswer } from "../systems/AIGuideSystem";

function truncateToWordLimit(text: string, maxWords: number): string {
  const words = text.split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ") + "\u2026";
}

function buildStaticExplanation(birdId: string): { text: string; textZh: string } {
  const bird = getBirdById(birdId);
  if (!bird) {
    return {
      text: "This is a fascinating bird! Explore the globe to learn more about the amazing birds of our world.",
      textZh: "\u8FD9\u662F\u4E00\u53EA\u8FF7\u4EBA\u7684\u9E1F\uFF01\u63A2\u7D22\u5730\u7403\uFF0C\u4E86\u89E3\u66F4\u591A\u5173\u4E8E\u6211\u4EEC\u4E16\u754C\u4E0A\u795E\u5947\u9E1F\u7C7B\u7684\u77E5\u8BC6\u3002",
    };
  }

  const kbEn = findAnswer(`Tell me about ${bird.nameEn}`, birdId, "en");
  const kbZh = findAnswer(`\u544A\u8BC9\u6211\u5173\u4E8E${bird.nameZh}`, birdId, "zh");

  const defaultEn = "That's a great question! The world of birds is full of wonderful secrets. Try asking me about bird behavior, food, or habitats!";
  const defaultZh = "\u8FD9\u662F\u4E00\u4E2A\u5F88\u597D\u7684\u95EE\u9898\uFF01\u9E1F\u7C7B\u4E16\u754C\u5145\u6EE1\u4E86\u5947\u5999\u7684\u79D8\u5BC6\u3002\u8BD5\u7740\u95EE\u6211\u5173\u4E8E\u9E1F\u7C7B\u7684\u4E60\u6027\u3001\u98DF\u7269\u6216\u6816\u606F\u5730\u7684\u95EE\u9898\u5427\uFF01";

  if (kbEn !== defaultEn || kbZh !== defaultZh) {
    return { text: truncateToWordLimit(kbEn, 100), textZh: kbZh };
  }

  const en = [
    `The ${bird.nameEn} is an amazing bird found in ${bird.region}.`,
    bird.habitatType ? `It lives in ${bird.habitatType} habitats.` : "",
    bird.diet ? `It eats ${bird.diet}.` : "",
    bird.funFactEn || "",
  ].filter(Boolean).join(" ");

  const zh = [
    `${bird.nameZh}\u662F\u4E00\u79CD\u751F\u6D3B\u5728${bird.region}\u7684\u795E\u5947\u9E1F\u7C7B\u3002`,
    bird.habitatType ? `\u5B83\u6816\u606F\u5728${bird.habitatType}\u73AF\u5883\u4E2D\u3002` : "",
    bird.diet ? `\u5B83\u4EE5${bird.diet}\u4E3A\u98DF\u3002` : "",
    bird.funFactZh || "",
  ].filter(Boolean).join("");

  return { text: truncateToWordLimit(en, 100), textZh: zh };
}

function buildTemplateVars(birdId: string): Record<string, string> {
  const bird = getBirdById(birdId);
  if (!bird) {
    return {
      birdName: birdId,
      scientificName: "Unknown",
      habitat: "various habitats",
      region: "around the world",
      dietInfo: "",
      funFact: "",
    };
  }

  return {
    birdName: bird.nameEn,
    scientificName: bird.scientificName || bird.nameEn,
    habitat: bird.habitatType || "various habitats",
    region: bird.region,
    dietInfo: bird.diet ? `It eats ${bird.diet}.` : "",
    funFact: bird.funFactEn || "It is a remarkable species.",
  };
}

/**
 * Multi-layer knowledge query: L2 (cache) → L3 (AI) → L1 (static fallback).
 * Each bird triggers AI at most once; results are cached in L2.
 */
export async function queryBirdExplanation(birdId: string): Promise<KnowledgeResult> {
  if (!birdId || typeof birdId !== "string") {
    return { ...buildStaticExplanation(""), source: "static" };
  }

  try {
    const cached = getCachedExplanation(birdId);
    if (cached) {
      return { text: cached.text, textZh: cached.textZh, source: "cache" };
    }
  } catch {
    // Cache read failed — continue to L3
  }

  try {
    const provider = getAIProvider();
    if (provider.isAvailable()) {
      const template = getTemplate("bird-explain");
      if (template) {
        const vars = buildTemplateVars(birdId);
        const { system, user } = renderTemplate(template, vars);
        const result = await provider.generate(system, user);
        if (result) {
          const text = truncateToWordLimit(result.text, 100);
          const textZh = result.textZh;
          try {
            setCachedExplanation(birdId, text, textZh);
          } catch {
            // Cache write failed — non-fatal
          }
          return { text, textZh, source: "ai" };
        }
      }
    }
  } catch {
    // AI call failed — fall through to L1
  }

  const staticResult = buildStaticExplanation(birdId);
  return { ...staticResult, source: "static" };
}

export { getQuestionPrompts } from "../systems/AIGuideSystem";
export { getGuideAnswer, askQuestion } from "./BirdGuideService";
