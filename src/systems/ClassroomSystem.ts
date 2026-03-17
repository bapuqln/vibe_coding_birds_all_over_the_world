import lessonsData from "../data/lessons.json";
import type { Lesson, LessonStep } from "../types";

const lessons = lessonsData as Lesson[];

export function getAllLessons(): Lesson[] {
  return lessons;
}

export function getLessonById(id: string): Lesson | undefined {
  return lessons.find((l) => l.id === id);
}

export function getLessonStep(lessonId: string, stepIndex: number): LessonStep | undefined {
  const lesson = getLessonById(lessonId);
  if (!lesson) return undefined;
  return lesson.steps[stepIndex];
}

export function getLessonStepCount(lessonId: string): number {
  const lesson = getLessonById(lessonId);
  return lesson?.steps.length ?? 0;
}
