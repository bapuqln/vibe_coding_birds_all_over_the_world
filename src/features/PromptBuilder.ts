import { getBirdById } from "../systems/BirdSystem";

/**
 * Builds enriched context for guide answers from optional bird metadata.
 */
export function buildPrompt(question: string, birdId?: string): string {
  const parts: string[] = [];

  parts.push(`Child's question: ${question.trim()}`);

  if (birdId) {
    const bird = getBirdById(birdId);
    if (bird) {
      parts.push(
        [
          `Focused bird id: ${bird.id}`,
          `Names: ${bird.nameEn} / ${bird.nameZh} (${bird.scientificName})`,
          bird.habitatType ? `Habitat type: ${bird.habitatType}` : "",
          bird.region ? `Region: ${bird.region}` : "",
          bird.diet ? `Diet notes: ${bird.diet}` : "",
          bird.funFactEn ? `Fun fact (EN): ${bird.funFactEn}` : "",
          bird.funFactZh ? `Fun fact (ZH): ${bird.funFactZh}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
      );
    } else {
      parts.push(`Focused bird id: ${birdId} (no catalog entry — answer generally).`);
    }
  }

  return parts.join("\n\n");
}
