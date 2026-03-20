import { useAppStore } from "../../store";
import birdsData from "../../data/birds.json";
import type { Bird } from "../../types";

const birds = birdsData as Bird[];
const birdMap = new Map(birds.map((b) => [b.id, b]));

const RARITY_BADGE: Record<string, string> = {
  common: "",
  rare: "💎",
  legendary: "👑",
};

export function MyBirdsPanel() {
  const isCollectionOpen = useAppStore((s) => s.isCollectionOpen);
  const setCollectionOpen = useAppStore((s) => s.setCollectionOpen);
  const collectedBirds = useAppStore((s) => s.collectedBirds);
  const language = useAppStore((s) => s.language);
  const setSelectedBird = useAppStore((s) => s.setSelectedBird);

  if (!isCollectionOpen) return null;

  const handleBirdClick = (birdId: string) => {
    setSelectedBird(birdId);
    setCollectionOpen(false);
  };

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center p-4">
      <button
        type="button"
        onClick={() => setCollectionOpen(false)}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        aria-label={language === "zh" ? "关闭" : "Close"}
      />

      <div className="relative max-h-[85vh] w-full max-w-lg overflow-hidden rounded-[20px] bg-white/95 shadow-2xl backdrop-blur-xl">
        <header className="flex items-center justify-between border-b border-amber-100 bg-amber-50/80 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-amber-900">
              {language === "zh" ? "🐦 我的鸟类" : "🐦 My Birds"}
            </h2>
            <p className="text-xs text-amber-600">
              {language === "zh"
                ? `已收集 ${collectedBirds.length}/${birds.length}`
                : `Collected ${collectedBirds.length}/${birds.length}`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCollectionOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-200/60 text-amber-700 transition-colors hover:bg-amber-300"
            aria-label={language === "zh" ? "关闭" : "Close"}
          >
            ✕
          </button>
        </header>

        <div className="max-h-[calc(85vh-4rem)] overflow-y-auto overscroll-contain p-4">
          {collectedBirds.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-4xl">🔍</p>
              <p className="mt-3 text-sm text-gray-500">
                {language === "zh"
                  ? "还没有收集到鸟类，快去探索吧！"
                  : "No birds collected yet. Start exploring!"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {collectedBirds.map(({ birdId }) => {
                const bird = birdMap.get(birdId);
                if (!bird) return null;
                return (
                  <button
                    key={birdId}
                    type="button"
                    onClick={() => handleBirdClick(birdId)}
                    className="group flex flex-col items-center gap-1.5 rounded-xl border border-amber-100 bg-white p-2 shadow-sm transition-all hover:border-amber-300 hover:shadow-md active:scale-95"
                  >
                    <div className="relative h-16 w-16 overflow-hidden rounded-lg">
                      <img
                        src={bird.photoUrl}
                        alt={bird.nameEn}
                        className="h-full w-full object-cover"
                      />
                      {bird.rarity && RARITY_BADGE[bird.rarity] && (
                        <span className="absolute right-0.5 top-0.5 text-xs">
                          {RARITY_BADGE[bird.rarity]}
                        </span>
                      )}
                    </div>
                    <span className="max-w-full truncate text-[11px] font-medium text-gray-700">
                      {language === "zh" ? bird.nameZh : bird.nameEn}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
