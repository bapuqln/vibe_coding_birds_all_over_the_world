import { continentLabels, oceanLabels } from "./labels";

export { default as birdsData } from "./birds.json";
export { default as weatherData } from "./weather.json";
export { default as migrationsData } from "./migrations.json";
export { default as achievementsData } from "./achievements.json";
export { default as missionsData } from "./missions.json";
export { default as questsData } from "./quests.json";
export { default as storiesData } from "./stories.json";
export { default as storiesAdventureData } from "./stories-adventure.json";
export { default as expeditionsData } from "./expeditions.json";
export { default as birdKnowledgeData } from "./bird-knowledge.json";
export { default as biomesData } from "./biomes.json";
export { default as lessonsData } from "./lessons.json";
export { getModelPath, ALL_MODEL_PATHS } from "./birdModels";

export const LABELS = {
  continents: continentLabels,
  oceans: oceanLabels,
} as const;
