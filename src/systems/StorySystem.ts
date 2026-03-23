import storiesData from "../data/stories-adventure.json";
import type { StoryAdventure } from "../types";

const stories = storiesData as StoryAdventure[];

export function getAllStories(): StoryAdventure[] {
  return stories;
}

export function getStoryById(id: string): StoryAdventure | undefined {
  return stories.find((s) => s.id === id);
}

export function getStoryStep(storyId: string, stepIndex: number) {
  const story = getStoryById(storyId);
  if (!story || stepIndex < 0 || stepIndex >= story.steps.length) return null;
  return story.steps[stepIndex];
}

export function getStoryStepCount(storyId: string): number {
  return getStoryById(storyId)?.steps.length ?? 0;
}
