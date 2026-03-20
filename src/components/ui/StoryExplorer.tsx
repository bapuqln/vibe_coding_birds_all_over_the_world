import { useAppStore } from "../../store";
import storiesData from "../../data/stories.json";
import birdsData from "../../data/birds.json";
import type { Bird, StoryTheme } from "../../types";

const stories = storiesData as StoryTheme[];
const birds = birdsData as Bird[];
const birdMap = new Map(birds.map((b) => [b.id, b]));

export function StoryExplorer() {
  const storyExplorerOpen = useAppStore((s) => s.storyExplorerOpen);
  const setStoryExplorerOpen = useAppStore((s) => s.setStoryExplorerOpen);
  const collectedBirds = useAppStore((s) => s.collectedBirds);
  const language = useAppStore((s) => s.language);
  const setSelectedBird = useAppStore((s) => s.setSelectedBird);

  const collectedIds = new Set(collectedBirds.map((b) => b.birdId));

  if (!storyExplorerOpen) {
    return (
      <button
        type="button"
        onClick={() => setStoryExplorerOpen(true)}
        className="fixed flex h-10 items-center gap-1.5 rounded-full bg-black/65 px-3 text-sm font-semibold text-white shadow-lg backdrop-blur-lg transition-all hover:scale-105 active:scale-95"
        style={{ left: "var(--safe-area)", top: 140 }}
        aria-label={language === "zh" ? "主题探索" : "Stories"}
      >
        <span>📚</span>
        <span className="hidden sm:inline">
          {language === "zh" ? "主题" : "Stories"}
        </span>
      </button>
    );
  }

  return (
    <div className="pointer-events-auto fixed inset-0 flex items-center justify-center p-5" style={{ zIndex: "var(--z-modal)", animation: "panelScaleFade var(--panel-duration) var(--panel-ease)" }}>
      <button
        type="button"
        onClick={() => setStoryExplorerOpen(false)}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        aria-label={language === "zh" ? "关闭" : "Close"}
      />

      <div className="relative max-h-[85vh] w-full max-w-md overflow-hidden rounded-[20px] bg-white/95 shadow-2xl backdrop-blur-xl">
        <header className="flex items-center justify-between border-b border-amber-100 bg-amber-50/80 px-5 py-4">
          <h2 className="text-lg font-bold text-amber-900">
            {language === "zh" ? "📚 主题探索" : "📚 Story Explorer"}
          </h2>
          <button
            type="button"
            onClick={() => setStoryExplorerOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-200/60 text-amber-700 hover:bg-amber-300"
            aria-label={language === "zh" ? "关闭" : "Close"}
          >
            ✕
          </button>
        </header>

        <div className="max-h-[calc(85vh-4rem)] overflow-y-auto overscroll-contain p-4">
          <div className="space-y-4">
            {stories.map((story) => {
              const discovered = story.birdIds.filter((id) => collectedIds.has(id));
              const isComplete = discovered.length >= story.birdIds.length;
              const pct = (discovered.length / story.birdIds.length) * 100;

              return (
                <div
                  key={story.id}
                  className={`rounded-xl border p-4 ${
                    isComplete
                      ? "border-green-200 bg-green-50/80"
                      : "border-gray-100 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{story.badge}</span>
                      <div>
                        <h3 className="font-bold text-gray-800">
                          {language === "zh" ? story.titleZh : story.titleEn}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {language === "zh" ? story.descriptionZh : story.descriptionEn}
                        </p>
                      </div>
                    </div>
                    {isComplete && <span className="text-xl">🏅</span>}
                  </div>

                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        {discovered.length}/{story.birdIds.length}
                      </span>
                      <span>{Math.round(pct)}%</span>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isComplete ? "bg-green-400" : "bg-amber-400"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {story.birdIds.map((birdId) => {
                      const bird = birdMap.get(birdId);
                      if (!bird) return null;
                      const isDiscovered = collectedIds.has(birdId);
                      return (
                        <button
                          key={birdId}
                          type="button"
                          onClick={() => {
                            setSelectedBird(birdId);
                            setStoryExplorerOpen(false);
                          }}
                          className={`flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs transition-all hover:scale-105 ${
                            isDiscovered
                              ? "border-green-200 bg-green-50 text-green-700"
                              : "border-gray-200 bg-gray-50 text-gray-400"
                          }`}
                        >
                          <div className="h-6 w-6 overflow-hidden rounded">
                            <img
                              src={bird.photoUrl}
                              alt=""
                              className={`h-full w-full object-cover ${
                                isDiscovered ? "" : "opacity-30 grayscale"
                              }`}
                            />
                          </div>
                          <span>
                            {isDiscovered
                              ? language === "zh" ? bird.nameZh : bird.nameEn
                              : "???"}
                          </span>
                          {isDiscovered && <span>✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
