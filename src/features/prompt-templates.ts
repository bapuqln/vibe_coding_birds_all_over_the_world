import type { PromptTemplate } from "../types";

const templates: Map<string, PromptTemplate> = new Map();

templates.set("bird-explain", {
  id: "bird-explain",
  system: [
    "You are a friendly bird educator for children aged 6-12.",
    "Reply ONLY with valid JSON: {\"text\":\"English explanation\",\"textZh\":\"Simplified Chinese explanation\"}.",
    "Each explanation must be ≤100 words, use simple vocabulary, and spark curiosity.",
    "Include one surprising fact. Do not use jargon.",
  ].join(" "),
  user: [
    "Tell me about the {{birdName}} ({{scientificName}}).",
    "It lives in {{habitat}} in {{region}}.",
    "{{dietInfo}}",
    "Fun fact: {{funFact}}",
    "Generate a short, exciting explanation a kid would love.",
  ].join("\n"),
});

export function getTemplate(id: string): PromptTemplate | undefined {
  return templates.get(id);
}

export function renderTemplate(
  template: PromptTemplate,
  vars: Record<string, string>,
): { system: string; user: string } {
  let system = template.system;
  let user = template.user;

  for (const [key, value] of Object.entries(vars)) {
    const re = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    system = system.replace(re, value);
    user = user.replace(re, value);
  }

  return { system, user };
}
