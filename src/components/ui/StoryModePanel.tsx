import { useEffect, useRef } from "react";
import { useAppStore } from "../../store";
import { getAllStories, getStoryById, getStoryStep, getStoryStepCount } from "../../systems/StorySystem";

export function StoryModePanel() {
  const storyModeActive = useAppStore((s) => s.storyModeActive);
  const storyPlayState = useAppStore((s) => s.storyPlayState);
  const activeStoryId = useAppStore((s) => s.activeStoryId);
  const storyStepIndex = useAppStore((s) => s.storyStepIndex);
  const completedStories = useAppStore((s) => s.completedStories);
  const language = useAppStore((s) => s.language);
  const startStoryAdventure = useAppStore((s) => s.startStoryAdventure);
  const nextStoryStep = useAppStore((s) => s.nextStoryStep);
  const pauseStoryAdventure = useAppStore((s) => s.pauseStoryAdventure);
  const resumeStoryAdventure = useAppStore((s) => s.resumeStoryAdventure);
  const exitStoryAdventure = useAppStore((s) => s.exitStoryAdventure);
  const completeStoryAdventure = useAppStore((s) => s.completeStoryAdventure);
  const setSelectedBird = useAppStore((s) => s.setSelectedBird);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stories = getAllStories();
  const activeStory = activeStoryId ? getStoryById(activeStoryId) : null;
  const currentStep = activeStoryId ? getStoryStep(activeStoryId, storyStepIndex) : null;
  const totalSteps = activeStoryId ? getStoryStepCount(activeStoryId) : 0;

  useEffect(() => {
    if (storyPlayState !== "playing" || !currentStep) return;

    if (currentStep.featuredBirdId) {
      setSelectedBird(currentStep.featuredBirdId);
    }

    if ("speechSynthesis" in window) {
      const text = language === "zh" ? currentStep.narrationZh : currentStep.narrationEn;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.lang = language === "zh" ? "zh-CN" : "en-US";
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }

    timerRef.current = setTimeout(() => {
      if (storyStepIndex + 1 >= totalSteps) {
        completeStoryAdventure();
      } else {
        nextStoryStep();
      }
    }, currentStep.durationMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      window.speechSynthesis?.cancel();
    };
  }, [storyPlayState, storyStepIndex, activeStoryId]);

  if (!storyModeActive && storyPlayState === "idle") return null;

  if (!activeStory) {
    return (
      <div
        className="pointer-events-auto fixed inset-0 flex items-center justify-center"
        style={{ zIndex: "var(--z-modal)" }}
      >
        <div
          className="mx-4 max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl p-6"
          style={{
            background: "rgba(10,20,40,0.9)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">
              {language === "zh" ? "🎬 鸟类冒险" : "🎬 Bird Adventures"}
            </h2>
            <button
              onClick={exitStoryAdventure}
              className="rounded-full px-3 py-1 text-sm text-white/60 hover:bg-white/10"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3">
            {stories.map((story) => {
              const isCompleted = completedStories.includes(story.id);
              return (
                <button
                  key={story.id}
                  onClick={() => startStoryAdventure(story.id)}
                  className="w-full rounded-xl p-4 text-left transition-all hover:scale-[1.02]"
                  style={{
                    background: isCompleted
                      ? "rgba(34,197,94,0.15)"
                      : "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    minHeight: 56,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{story.badge}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-white">
                        {language === "zh" ? story.titleZh : story.titleEn}
                      </div>
                      <div className="mt-0.5 text-xs text-white/50">
                        {language === "zh" ? story.descriptionZh : story.descriptionEn}
                      </div>
                    </div>
                    {isCompleted && <span className="text-lg">✅</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="pointer-events-auto fixed bottom-6 left-1/2 -translate-x-1/2 rounded-2xl px-6 py-4"
      style={{
        background: "rgba(10,20,40,0.85)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.1)",
        zIndex: "var(--z-modal)",
        maxWidth: 500,
        width: "90%",
      }}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-white">
          {language === "zh" ? activeStory.titleZh : activeStory.titleEn}
        </span>
        <button
          onClick={exitStoryAdventure}
          className="rounded-full px-2 py-0.5 text-xs text-white/50 hover:bg-white/10"
        >
          {language === "zh" ? "退出" : "Exit"}
        </button>
      </div>

      {currentStep && storyPlayState !== "complete" && (
        <p className="mb-3 text-sm leading-relaxed text-white/80">
          {language === "zh" ? currentStep.narrationZh : currentStep.narrationEn}
        </p>
      )}

      {storyPlayState === "complete" && (
        <div className="mb-3 text-center">
          <div className="text-3xl">{activeStory.badge}</div>
          <p className="mt-1 text-sm font-medium text-emerald-400">
            {language === "zh" ? "冒险完成！" : "Adventure Complete!"}
          </p>
        </div>
      )}

      <div className="mb-3 flex justify-center gap-1.5">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className="h-2 w-2 rounded-full transition-all"
            style={{
              background:
                i < storyStepIndex
                  ? "#22c55e"
                  : i === storyStepIndex
                    ? "#60a5fa"
                    : "rgba(255,255,255,0.2)",
            }}
          />
        ))}
      </div>

      <div className="flex justify-center gap-2">
        {storyPlayState === "playing" && (
          <button
            onClick={pauseStoryAdventure}
            className="rounded-full bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20"
            style={{ minHeight: 40 }}
          >
            {language === "zh" ? "⏸ 暂停" : "⏸ Pause"}
          </button>
        )}
        {storyPlayState === "paused" && (
          <button
            onClick={resumeStoryAdventure}
            className="rounded-full bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20"
            style={{ minHeight: 40 }}
          >
            {language === "zh" ? "▶ 继续" : "▶ Resume"}
          </button>
        )}
        {storyPlayState !== "complete" && storyStepIndex + 1 < totalSteps && (
          <button
            onClick={nextStoryStep}
            className="rounded-full bg-blue-500/30 px-4 py-2 text-sm text-white hover:bg-blue-500/50"
            style={{ minHeight: 40 }}
          >
            {language === "zh" ? "下一步 ▶" : "Next ▶"}
          </button>
        )}
        {storyPlayState === "complete" && (
          <button
            onClick={exitStoryAdventure}
            className="rounded-full bg-emerald-500/30 px-4 py-2 text-sm text-white hover:bg-emerald-500/50"
            style={{ minHeight: 40 }}
          >
            {language === "zh" ? "完成" : "Done"}
          </button>
        )}
      </div>
    </div>
  );
}
