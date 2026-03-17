import knowledgeBase from "../data/bird-knowledge.json";
import type { GuideQuestion } from "../types";

const questions = knowledgeBase as GuideQuestion[];

export function findAnswer(query: string, birdId?: string, lang: "zh" | "en" = "en"): string {
  const lower = query.toLowerCase();
  const tokens = lower.split(/\s+/);

  let bestMatch: GuideQuestion | null = null;
  let bestScore = 0;

  for (const q of questions) {
    if (birdId && q.birdId && q.birdId !== birdId) continue;

    let score = 0;
    for (const pattern of q.pattern) {
      if (lower.includes(pattern.toLowerCase())) {
        score += 2;
      }
      for (const token of tokens) {
        if (pattern.toLowerCase().includes(token) && token.length > 2) {
          score += 1;
        }
      }
    }

    if (birdId && q.birdId === birdId) score += 3;
    if (!q.birdId) score += 0.5;

    if (score > bestScore) {
      bestScore = score;
      bestMatch = q;
    }
  }

  if (bestMatch && bestScore > 1) {
    return lang === "zh" ? bestMatch.answerZh : bestMatch.answerEn;
  }

  return lang === "zh"
    ? "这是一个很好的问题！鸟类世界充满了奇妙的秘密。试着问我关于鸟类的习性、食物或栖息地的问题吧！"
    : "That's a great question! The world of birds is full of wonderful secrets. Try asking me about bird behavior, food, or habitats!";
}

export function getQuestionPrompts(birdId: string | null, lang: "zh" | "en" = "en"): string[] {
  if (!birdId) {
    return lang === "zh"
      ? ["鸟类为什么会飞？", "最大的鸟是什么？", "鸟类为什么唱歌？", "鸟类如何迁徙？"]
      : ["Why can birds fly?", "What is the biggest bird?", "Why do birds sing?", "How do birds migrate?"];
  }

  const birdQuestions = questions.filter((q) => q.birdId === birdId);
  if (birdQuestions.length > 0) {
    const prompts = birdQuestions.slice(0, 4).map((q) =>
      lang === "zh" ? q.answerZh.slice(0, 20) + "..." : q.pattern[0] + "?"
    );
    return prompts;
  }

  return lang === "zh"
    ? ["这只鸟吃什么？", "它住在哪里？", "它有什么特别的？", "它会迁徙吗？"]
    : ["What does this bird eat?", "Where does it live?", "What makes it special?", "Does it migrate?"];
}
