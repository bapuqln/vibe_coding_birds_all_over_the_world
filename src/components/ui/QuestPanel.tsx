import { useEffect, useMemo } from "react";
import { useAppStore } from "../../store";
import questsData from "../../data/quests.json";
import birdsData from "../../data/birds.json";
import type { Bird, Quest } from "../../types";

const quests = questsData as Quest[];
const birds = birdsData as Bird[];

export function QuestPanel() {
  const questsOpen = useAppStore((s) => s.questsOpen);
  const setQuestsOpen = useAppStore((s) => s.setQuestsOpen);
  const language = useAppStore((s) => s.language);
  const questProgress = useAppStore((s) => s.questProgress);
  const totalPoints = useAppStore((s) => s.totalPoints);
  const collectedBirds = useAppStore((s) => s.collectedBirds);
  const selectedBirdId = useAppStore((s) => s.selectedBirdId);
  const updateQuestProgress = useAppStore((s) => s.updateQuestProgress);
  const completeQuest = useAppStore((s) => s.completeQuest);

  const discoveredBirdIds = useMemo(() => {
    const ids = new Set(collectedBirds.map((b) => b.birdId));
    if (selectedBirdId) ids.add(selectedBirdId);
    return ids;
  }, [collectedBirds, selectedBirdId]);

  useEffect(() => {
    for (const quest of quests) {
      const progress = questProgress.find((q) => q.questId === quest.id);
      if (progress?.completed) continue;

      let current = 0;
      if (quest.type === "collect_count") {
        current = collectedBirds.length;
      } else if (quest.type === "find_region") {
        current = birds.filter(
          (b) => b.region === quest.target && discoveredBirdIds.has(b.id),
        ).length;
      } else if (quest.type === "discover_bird") {
        current = discoveredBirdIds.has(quest.target as string) ? 1 : 0;
      }

      const prevCurrent = progress?.current ?? 0;
      if (current !== prevCurrent) {
        updateQuestProgress(quest.id, current);
      }

      const targetNum =
        quest.type === "discover_bird" ? 1 : (quest.target as number);
      if (current >= targetNum && !progress?.completed) {
        completeQuest(quest.id, quest.reward);
      }
    }
  }, [collectedBirds, discoveredBirdIds, questProgress, updateQuestProgress, completeQuest]);

  if (!questsOpen) return null;

  const getQuestTarget = (quest: Quest): number => {
    if (quest.type === "discover_bird") return 1;
    if (quest.type === "find_region") {
      return birds.filter((b) => b.region === quest.target).length;
    }
    return quest.target as number;
  };

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center p-4">
      <button
        type="button"
        onClick={() => setQuestsOpen(false)}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        aria-label={language === "zh" ? "关闭" : "Close"}
      />

      <div className="relative max-h-[85vh] w-full max-w-md overflow-hidden rounded-[20px] bg-white/95 shadow-2xl backdrop-blur-xl">
        <header className="flex items-center justify-between border-b border-amber-100 bg-amber-50/80 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-amber-900">
              {language === "zh" ? "🎯 探索任务" : "🎯 Quests"}
            </h2>
            <p className="text-xs text-amber-600">
              {language === "zh" ? `积分: ${totalPoints}` : `Points: ${totalPoints}`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setQuestsOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-200/60 text-amber-700 hover:bg-amber-300"
            aria-label={language === "zh" ? "关闭" : "Close"}
          >
            ✕
          </button>
        </header>

        <div className="max-h-[calc(85vh-4rem)] overflow-y-auto overscroll-contain p-4">
          <div className="space-y-3">
            {quests.map((quest) => {
              const progress = questProgress.find((q) => q.questId === quest.id);
              const current = progress?.current ?? 0;
              const target = getQuestTarget(quest);
              const isComplete = progress?.completed ?? false;
              const pct = Math.min((current / target) * 100, 100);

              return (
                <div
                  key={quest.id}
                  className={`rounded-xl border p-4 transition-all ${
                    isComplete
                      ? "border-green-200 bg-green-50/80"
                      : "border-gray-100 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{quest.badge}</span>
                        <h3 className="font-semibold text-gray-800">
                          {language === "zh" ? quest.titleZh : quest.titleEn}
                        </h3>
                        {isComplete && <span className="text-green-500">✓</span>}
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        {language === "zh" ? quest.descriptionZh : quest.descriptionEn}
                      </p>
                    </div>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
                      +{quest.reward}
                    </span>
                  </div>

                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        {current}/{target}
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
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
