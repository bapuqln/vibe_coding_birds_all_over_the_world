import { useAppStore } from "../../store";
import birdsData from "../../data/birds.json";
import type { Bird } from "../../types";

const birds = birdsData as Bird[];

const REGION_COLORS: Record<string, string> = {
  asia: "#f59e0b",
  europe: "#3b82f6",
  africa: "#ef4444",
  "north-america": "#22c55e",
  "south-america": "#a855f7",
  oceania: "#06b6d4",
  antarctica: "#94a3b8",
};

const DIET_ICONS: Record<string, string> = {
  insects: "🐛",
  fish: "🐟",
  seeds: "🌾",
  fruit: "🍎",
  meat: "🥩",
  omnivore: "🍽️",
};

export function BirdEntryPanel() {
  const entryBirdId = useAppStore((s) => s.encyclopediaEntryBirdId);
  const setEntryBirdId = useAppStore((s) => s.setEncyclopediaEntryBirdId);
  const language = useAppStore((s) => s.language);
  const discoveredBirds = useAppStore((s) => s.discoveredBirds);

  if (!entryBirdId) return null;

  const bird = birds.find((b) => b.id === entryBirdId);
  if (!bird) return null;

  const isDiscovered = discoveredBirds.includes(bird.id);
  const regionColor = REGION_COLORS[bird.region] ?? "#6b7280";
  const dietIcon = bird.dietType ? DIET_ICONS[bird.dietType] ?? "🍽️" : "🍽️";

  return (
    <div
      className="pointer-events-auto fixed inset-y-0 right-0 flex items-center"
      style={{ zIndex: "var(--z-card)" }}
    >
      <div
        className="mr-4 max-h-[85vh] w-80 overflow-y-auto rounded-2xl p-5"
        style={{
          background: "rgba(10,20,40,0.92)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.1)",
          animation: "slideRight 0.25s ease-out",
        }}
      >
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => setEntryBirdId(null)}
            className="rounded-full px-2 py-1 text-sm text-white/60 hover:bg-white/10"
          >
            ← {language === "zh" ? "返回" : "Back"}
          </button>
        </div>

        <div className="mb-4 text-center">
          <div
            className="mx-auto flex h-24 w-24 items-center justify-center rounded-full"
            style={{ background: `${regionColor}20`, border: `2px solid ${regionColor}40` }}
          >
            <span className="text-4xl">🐦</span>
          </div>
        </div>

        <h3 className="text-center text-lg font-bold text-white">
          {isDiscovered
            ? language === "zh" ? bird.nameZh : bird.nameEn
            : "???"}
        </h3>
        {isDiscovered && bird.scientificName && (
          <p className="text-center text-xs italic text-white/40">
            {bird.scientificName}
          </p>
        )}

        <div
          className="mt-1 text-center text-xs font-medium"
          style={{ color: regionColor }}
        >
          📍 {bird.region}
        </div>

        {isDiscovered && (
          <div className="mt-4 space-y-3">
            {bird.habitatType && (
              <div className="rounded-xl bg-white/5 p-3">
                <div className="mb-1 text-xs font-medium text-white/50">
                  {language === "zh" ? "栖息地" : "Habitat"}
                </div>
                <div className="text-sm text-white/80">🌍 {bird.habitatType}</div>
              </div>
            )}

            {bird.diet && (
              <div className="rounded-xl bg-white/5 p-3">
                <div className="mb-1 text-xs font-medium text-white/50">
                  {language === "zh" ? "饮食" : "Diet"}
                </div>
                <div className="text-sm text-white/80">{dietIcon} {bird.diet}</div>
              </div>
            )}

            {bird.wingspan && (
              <div className="rounded-xl bg-white/5 p-3">
                <div className="mb-1 text-xs font-medium text-white/50">
                  {language === "zh" ? "翼展" : "Wingspan"}
                </div>
                <div className="text-sm text-white/80">📏 {bird.wingspan}</div>
                {bird.wingspanCm && (
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-blue-400/60"
                      style={{ width: `${Math.min((bird.wingspanCm / 300) * 100, 100)}%` }}
                    />
                  </div>
                )}
              </div>
            )}

            {bird.lifespan && (
              <div className="rounded-xl bg-white/5 p-3">
                <div className="mb-1 text-xs font-medium text-white/50">
                  {language === "zh" ? "寿命" : "Lifespan"}
                </div>
                <div className="text-sm text-white/80">⏳ {bird.lifespan}</div>
              </div>
            )}

            <div className="rounded-xl bg-white/5 p-3">
              <div className="mb-1 text-xs font-medium text-white/50">
                {language === "zh" ? "趣味事实" : "Fun Fact"}
              </div>
              <div className="text-sm leading-relaxed text-white/80">
                💡 {language === "zh" ? bird.funFactZh : bird.funFactEn}
              </div>
            </div>
          </div>
        )}

        {!isDiscovered && (
          <div className="mt-6 text-center text-sm text-white/40">
            {language === "zh"
              ? "探索地球来发现这只鸟！"
              : "Explore the globe to discover this bird!"}
          </div>
        )}
      </div>
    </div>
  );
}
