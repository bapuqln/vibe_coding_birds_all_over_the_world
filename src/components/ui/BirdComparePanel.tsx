import type { CSSProperties } from "react";
import birdsData from "../../data/birds.json";
import { useAppStore } from "../../store";
import type { Bird, Language, SizeCategory } from "../../types";

const birds = birdsData as Bird[];

type CompareStore = {
  compareBirdA: string | null;
  compareBirdB: string | null;
  compareMode: boolean;
  setCompareMode: (mode: boolean) => void;
  setCompareBirdA: (id: string | null) => void;
  setCompareBirdB: (id: string | null) => void;
};

const WEIGHT_GRAMS: Record<SizeCategory, number> = {
  tiny: 50,
  small: 200,
  medium: 1000,
  large: 5000,
};

function findBird(id: string | null): Bird | undefined {
  if (!id) return undefined;
  return birds.find((b) => b.id === id);
}

function weightGrams(size?: SizeCategory): number | null {
  if (!size) return null;
  return WEIGHT_GRAMS[size] ?? null;
}

function formatWeightGrams(g: number): string {
  if (g >= 1000) return `${g / 1000} kg`;
  return `${g} g`;
}

function highlightWinner(
  a: number | null,
  b: number | null,
  side: "a" | "b",
): CSSProperties | undefined {
  if (a == null || b == null) return undefined;
  if (a === b) return undefined;
  if (side === "a" && a > b) return { color: "#22c55e", fontWeight: "bold" };
  if (side === "b" && b > a) return { color: "#22c55e", fontWeight: "bold" };
  return undefined;
}

function habitatLabel(h: Bird["habitatType"], lang: Language): string {
  if (!h) return "—";
  const map: Record<NonNullable<Bird["habitatType"]>, { zh: string; en: string }> = {
    rainforest: { zh: "雨林", en: "Rainforest" },
    wetlands: { zh: "湿地", en: "Wetlands" },
    coast: { zh: "海岸", en: "Coast" },
    grassland: { zh: "草原", en: "Grassland" },
    forest: { zh: "森林", en: "Forest" },
    polar: { zh: "极地", en: "Polar" },
    mountains: { zh: "山地", en: "Mountains" },
    desert: { zh: "沙漠", en: "Desert" },
    ocean: { zh: "海洋", en: "Ocean" },
    tundra: { zh: "苔原", en: "Tundra" },
  };
  const entry = map[h];
  return entry ? (lang === "zh" ? entry.zh : entry.en) : h;
}

export function BirdComparePanel() {
  const language = useAppStore((s) => s.language);
  const compareBirdA = useAppStore(
    (s) => (s as typeof s & CompareStore).compareBirdA ?? null,
  );
  const compareBirdB = useAppStore(
    (s) => (s as typeof s & CompareStore).compareBirdB ?? null,
  );
  const compareMode = useAppStore(
    (s) => Boolean((s as typeof s & CompareStore).compareMode),
  );
  const setCompareMode = useAppStore(
    (s) => (s as typeof s & CompareStore).setCompareMode,
  );
  const setCompareBirdA = useAppStore(
    (s) => (s as typeof s & CompareStore).setCompareBirdA,
  );
  const setCompareBirdB = useAppStore(
    (s) => (s as typeof s & CompareStore).setCompareBirdB,
  );

  const handleClose = () => {
    setCompareMode(false);
    setCompareBirdA(null);
    setCompareBirdB(null);
  };

  if (!compareMode) return null;
  if (!compareBirdA && !compareBirdB) return null;

  const title = language === "zh" ? "鸟类对比" : "Bird Compare";
  const closeLabel = language === "zh" ? "关闭" : "Close";

  const onlyOne =
    (compareBirdA && !compareBirdB) || (!compareBirdA && compareBirdB);
  const prompt =
    language === "zh" ? "再选一只鸟来对比吧！" : "Select another bird to compare";

  if (onlyOne) {
    return (
      <div
        className="pointer-events-auto fixed inset-0 flex items-center justify-center p-4"
        style={{ zIndex: "var(--z-modal)" }}
        onClick={handleClose}
      >
        <div
          className="glass-panel relative mx-auto w-full max-w-125 rounded-[20px] p-0 text-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
          style={{ animation: "scaleFade 250ms ease-out" }}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <h2 className="text-lg font-bold">{title}</h2>
            <button
              type="button"
              onClick={handleClose}
              className="flex min-h-14 min-w-14 items-center justify-center rounded-full bg-white/10 text-lg text-white/80 transition hover:bg-white/20 hover:text-white"
              aria-label={closeLabel}
            >
              ✕
            </button>
          </div>
          <div className="px-5 py-10 text-center text-base leading-relaxed text-white/90">
            {prompt}
          </div>
        </div>
      </div>
    );
  }

  const birdA = findBird(compareBirdA);
  const birdB = findBird(compareBirdB);
  if (!birdA || !birdB) {
    return (
      <div
        className="pointer-events-auto fixed inset-0 flex items-center justify-center p-4"
        style={{ zIndex: "var(--z-modal)" }}
        onClick={handleClose}
      >
        <div
          className="glass-panel relative mx-auto w-full max-w-125 rounded-[20px] p-0 text-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
          style={{ animation: "scaleFade 250ms ease-out" }}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <h2 className="text-lg font-bold">{title}</h2>
            <button
              type="button"
              onClick={handleClose}
              className="flex min-h-14 min-w-14 items-center justify-center rounded-full bg-white/10 text-lg text-white/80 transition hover:bg-white/20 hover:text-white"
              aria-label={closeLabel}
            >
              ✕
            </button>
          </div>
          <div className="px-5 py-8 text-center text-sm text-white/80">
            {language === "zh" ? "找不到鸟类数据" : "Bird data not found"}
          </div>
        </div>
      </div>
    );
  }

  const nameA = language === "zh" ? birdA.nameZh : birdA.nameEn;
  const nameB = language === "zh" ? birdB.nameZh : birdB.nameEn;

  const wA = birdA.wingspanCm ?? null;
  const wB = birdB.wingspanCm ?? null;
  const wtA = weightGrams(birdA.sizeCategory);
  const wtB = weightGrams(birdB.sizeCategory);
  const spdA = birdA.flightSpeed ?? null;
  const spdB = birdB.flightSpeed ?? null;

  const lbl = {
    wingspan: language === "zh" ? "翼展" : "Wingspan",
    weight: language === "zh" ? "体重" : "Weight",
    habitat: language === "zh" ? "栖息地" : "Habitat",
    diet: language === "zh" ? "食物" : "Diet",
    speed: language === "zh" ? "飞行速度" : "Flight speed",
    lifespan: language === "zh" ? "寿命" : "Lifespan",
  };

  return (
    <div
      className="pointer-events-auto fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: "var(--z-modal)" }}
      onClick={handleClose}
    >
      <div
        className="glass-panel relative mx-auto max-h-[90vh] w-full max-w-125 overflow-y-auto overscroll-contain rounded-[20px] p-0 text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "scaleFade 250ms ease-out" }}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
          <h2 className="text-lg font-bold">{title}</h2>
          <button
            type="button"
            onClick={handleClose}
            className="flex min-h-14 min-w-14 items-center justify-center rounded-full bg-white/10 text-lg text-white/80 transition hover:bg-white/20 hover:text-white"
            aria-label={closeLabel}
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 p-4">
          <div className="flex flex-col items-center gap-2 text-center">
            <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-tight sm:text-base">
              {nameA}
            </h3>
            <div
              className="flex items-end justify-center"
              style={{
                height: 140,
                width: "100%",
              }}
            >
              <img
                src={birdA.photoUrl}
                alt=""
                className="rounded-2xl border border-white/20 object-cover shadow-md"
                style={{
                  maxHeight: 140,
                  width: `${wA && wB ? Math.round((wA / Math.max(wA, wB)) * 100) : 100}%`,
                  maxWidth: 140,
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-tight sm:text-base">
              {nameB}
            </h3>
            <div
              className="flex items-end justify-center"
              style={{
                height: 140,
                width: "100%",
              }}
            >
              <img
                src={birdB.photoUrl}
                alt=""
                className="rounded-2xl border border-white/20 object-cover shadow-md"
                style={{
                  maxHeight: 140,
                  width: `${wA && wB ? Math.round((wB / Math.max(wA, wB)) * 100) : 100}%`,
                  maxWidth: 140,
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </div>
        </div>

        {wA != null && wB != null && (
          <div className="px-4 pb-2">
            <div className="mb-1 text-center text-[10px] font-semibold tracking-wide text-white/50">
              {language === "zh" ? "翼展比例" : "Wingspan Ratio"}
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 rounded-full bg-amber-400/60" style={{ width: `${(wA / Math.max(wA, wB)) * 100}%`, transition: "width 0.3s ease" }} />
              <div className="h-3 rounded-full bg-cyan-400/60" style={{ width: `${(wB / Math.max(wA, wB)) * 100}%`, transition: "width 0.3s ease" }} />
            </div>
          </div>
        )}

        <div className="space-y-3 border-t border-white/10 px-4 pb-5 pt-2">
          <StatRow
            label={lbl.wingspan}
            left={
              wA != null ? `${wA} cm` : "—"
            }
            right={
              wB != null ? `${wB} cm` : "—"
            }
            leftStyle={highlightWinner(wA, wB, "a")}
            rightStyle={highlightWinner(wA, wB, "b")}
          />
          <StatRow
            label={lbl.weight}
            left={wtA != null ? formatWeightGrams(wtA) : "—"}
            right={wtB != null ? formatWeightGrams(wtB) : "—"}
            leftStyle={highlightWinner(wtA, wtB, "a")}
            rightStyle={highlightWinner(wtA, wtB, "b")}
          />
          <StatRow
            label={lbl.habitat}
            left={habitatLabel(birdA.habitatType, language)}
            right={habitatLabel(birdB.habitatType, language)}
          />
          <StatRow
            label={lbl.diet}
            left={birdA.diet?.trim() || "—"}
            right={birdB.diet?.trim() || "—"}
          />
          <StatRow
            label={lbl.speed}
            left={spdA != null ? `${spdA} km/h` : "—"}
            right={spdB != null ? `${spdB} km/h` : "—"}
            leftStyle={highlightWinner(spdA, spdB, "a")}
            rightStyle={highlightWinner(spdA, spdB, "b")}
          />
          <StatRow
            label={lbl.lifespan}
            left={birdA.lifespan ?? "—"}
            right={birdB.lifespan ?? "—"}
          />
        </div>
      </div>
    </div>
  );
}

function StatRow({
  label,
  left,
  right,
  leftStyle,
  rightStyle,
}: {
  label: string;
  left: string;
  right: string;
  leftStyle?: CSSProperties;
  rightStyle?: CSSProperties;
}) {
  return (
    <div className="rounded-xl bg-white/5 px-2 py-2 sm:px-3">
      <div className="mb-1.5 text-center text-xs font-semibold tracking-wide text-white/55">
        {label}
      </div>
      <div className="grid grid-cols-2 gap-2 text-center text-sm leading-snug sm:text-base">
        <span style={leftStyle} className="wrap-break-word text-white/95">
          {left}
        </span>
        <span style={rightStyle} className="wrap-break-word text-white/95">
          {right}
        </span>
      </div>
    </div>
  );
}
