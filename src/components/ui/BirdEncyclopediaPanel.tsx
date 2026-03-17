import { useState, useMemo } from "react";
import { useAppStore } from "../../store";
import birdsData from "../../data/birds.json";
import type { Bird } from "../../types";

const birds = birdsData as Bird[];

const REGIONS = ["asia", "europe", "africa", "north-america", "south-america", "oceania", "antarctica"];
const DIET_TYPES = ["insects", "fish", "seeds", "fruit", "meat", "omnivore"];
const WINGSPAN_RANGES = [
  { id: "small", label: "< 50cm", max: 50 },
  { id: "medium", label: "50–100cm", min: 50, max: 100 },
  { id: "large", label: "> 100cm", min: 100 },
] as const;

const REGION_LABELS: Record<string, string> = {
  asia: "🌏 Asia",
  europe: "🌍 Europe",
  africa: "🌍 Africa",
  "north-america": "🌎 N. America",
  "south-america": "🌎 S. America",
  oceania: "🌏 Oceania",
  antarctica: "🧊 Antarctica",
};

export function BirdEncyclopediaPanel() {
  const encyclopediaOpen = useAppStore((s) => s.encyclopediaOpen);
  const setEncyclopediaOpen = useAppStore((s) => s.setEncyclopediaOpen);
  const discoveredBirds = useAppStore((s) => s.discoveredBirds);
  const language = useAppStore((s) => s.language);
  const setEncyclopediaEntryBirdId = useAppStore((s) => s.setEncyclopediaEntryBirdId);
  const setSelectedBird = useAppStore((s) => s.setSelectedBird);

  const [search, setSearch] = useState("");
  const [regionFilters, setRegionFilters] = useState<string[]>([]);
  const [dietFilters, setDietFilters] = useState<string[]>([]);
  const [wingspanFilter, setWingspanFilter] = useState<string | null>(null);

  const filteredBirds = useMemo(() => {
    return birds.filter((bird) => {
      if (search) {
        const q = search.toLowerCase();
        const matchName =
          bird.nameZh.toLowerCase().includes(q) ||
          bird.nameEn.toLowerCase().includes(q) ||
          (bird.pinyin && bird.pinyin.toLowerCase().includes(q));
        if (!matchName) return false;
      }

      if (regionFilters.length > 0 && !regionFilters.includes(bird.region)) {
        return false;
      }

      if (dietFilters.length > 0 && bird.dietType && !dietFilters.includes(bird.dietType)) {
        return false;
      }

      if (wingspanFilter && bird.wingspanCm) {
        const range = WINGSPAN_RANGES.find((r) => r.id === wingspanFilter);
        if (range) {
          if ("min" in range && bird.wingspanCm < (range.min ?? 0)) return false;
          if ("max" in range && bird.wingspanCm >= range.max) return false;
        }
      }

      return true;
    });
  }, [search, regionFilters, dietFilters, wingspanFilter]);

  const toggleRegion = (r: string) => {
    setRegionFilters((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r],
    );
  };

  const toggleDiet = (d: string) => {
    setDietFilters((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
    );
  };

  if (!encyclopediaOpen) return null;

  const discovered = filteredBirds.filter((b) => discoveredBirds.includes(b.id));
  const undiscovered = filteredBirds.filter((b) => !discoveredBirds.includes(b.id));
  const sorted = [...discovered, ...undiscovered];

  return (
    <div
      className="pointer-events-auto fixed inset-0 flex items-center justify-center"
      style={{ zIndex: "var(--z-modal)" }}
    >
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => setEncyclopediaOpen(false)}
      />
      <div
        className="relative mx-4 flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl"
        style={{
          background: "rgba(10,20,40,0.94)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div className="border-b border-white/10 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">
              {language === "zh" ? "🦅 鸟类百科" : "🦅 Bird Encyclopedia"}
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/50">
                {discoveredBirds.length}/{birds.length}
              </span>
              <button
                onClick={() => setEncyclopediaOpen(false)}
                className="rounded-full px-2 py-1 text-sm text-white/60 hover:bg-white/10"
              >
                ✕
              </button>
            </div>
          </div>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={language === "zh" ? "搜索鸟类..." : "Search birds..."}
            className="mb-3 w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:ring-1 focus:ring-blue-400/50"
          />

          <div className="mb-2 flex flex-wrap gap-1.5">
            {REGIONS.map((r) => (
              <button
                key={r}
                onClick={() => toggleRegion(r)}
                className="rounded-full px-2 py-0.5 text-xs transition-colors"
                style={{
                  background: regionFilters.includes(r) ? "rgba(59,130,246,0.3)" : "rgba(255,255,255,0.08)",
                  color: regionFilters.includes(r) ? "#93c5fd" : "rgba(255,255,255,0.5)",
                }}
              >
                {REGION_LABELS[r] ?? r}
              </button>
            ))}
          </div>

          <div className="mb-2 flex flex-wrap gap-1.5">
            {DIET_TYPES.map((d) => (
              <button
                key={d}
                onClick={() => toggleDiet(d)}
                className="rounded-full px-2 py-0.5 text-xs capitalize transition-colors"
                style={{
                  background: dietFilters.includes(d) ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.08)",
                  color: dietFilters.includes(d) ? "#86efac" : "rgba(255,255,255,0.5)",
                }}
              >
                {d}
              </button>
            ))}
          </div>

          <div className="flex gap-1.5">
            {WINGSPAN_RANGES.map((w) => (
              <button
                key={w.id}
                onClick={() => setWingspanFilter(wingspanFilter === w.id ? null : w.id)}
                className="rounded-full px-2 py-0.5 text-xs transition-colors"
                style={{
                  background: wingspanFilter === w.id ? "rgba(168,85,247,0.3)" : "rgba(255,255,255,0.08)",
                  color: wingspanFilter === w.id ? "#c4b5fd" : "rgba(255,255,255,0.5)",
                }}
              >
                {w.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {sorted.map((bird) => {
              const isFound = discoveredBirds.includes(bird.id);
              return (
                <button
                  key={bird.id}
                  onClick={() => {
                    if (isFound) {
                      setEncyclopediaEntryBirdId(bird.id);
                      setSelectedBird(bird.id);
                    }
                  }}
                  className="rounded-xl p-3 text-left transition-all hover:scale-[1.02]"
                  style={{
                    background: isFound ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    opacity: isFound ? 1 : 0.5,
                    minHeight: 56,
                  }}
                >
                  <div className="mb-1 text-lg">
                    {isFound ? "🐦" : "❓"}
                  </div>
                  <div className="text-xs font-medium text-white">
                    {isFound
                      ? language === "zh" ? bird.nameZh : bird.nameEn
                      : "???"}
                  </div>
                  <div className="mt-0.5 text-[10px] text-white/40">
                    {bird.region}
                  </div>
                </button>
              );
            })}
          </div>

          {sorted.length === 0 && (
            <p className="py-8 text-center text-sm text-white/40">
              {language === "zh" ? "没有找到匹配的鸟类" : "No birds match your filters"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
