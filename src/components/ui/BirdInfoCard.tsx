import { useEffect, useRef, useCallback, useMemo } from "react";
import { useAppStore } from "../../store";
import birdsData from "../../data/birds.json";
import type { Bird, DietType, Language, SizeCategory } from "../../types";
import { WingspanBar } from "./WingspanBar";

const birds = birdsData as Bird[];
const birdMap = new Map(birds.map((b) => [b.id, b]));

const REGION_EMOJI: Record<string, string> = {
  asia: "🏯",
  europe: "🏰",
  africa: "🌍",
  "north-america": "🗽",
  "south-america": "🌿",
  oceania: "🐨",
  antarctica: "🧊",
};

export function BirdInfoCard() {
  const selectedBirdId = useAppStore((s) => s.selectedBirdId);
  const language = useAppStore((s) => s.language);
  const audioStatus = useAppStore((s) => s.audioStatus);
  const setSelectedBird = useAppStore((s) => s.setSelectedBird);

  const cardRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const bird = useMemo(
    () => (selectedBirdId ? birdMap.get(selectedBirdId) ?? null : null),
    [selectedBirdId],
  );

  const isOpen = bird !== null;

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      requestAnimationFrame(() => closeButtonRef.current?.focus());
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setSelectedBird(null);
  }, [setSelectedBird]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, handleClose]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        handleClose();
      }
    },
    [handleClose],
  );

  const funFact = bird
    ? language === "zh"
      ? bird.funFactZh
      : bird.funFactEn
    : "";

  return (
    <div
      className={`pointer-events-auto fixed inset-0 z-50 transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      onClick={handleBackdropClick}
      aria-hidden={!isOpen}
    >
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-label={bird ? `${bird.nameEn} - ${bird.nameZh}` : ""}
        className={`
          absolute
          transition-transform duration-500
          ease-[cubic-bezier(0.34,1.56,0.64,1)]

          bottom-0 left-0 right-0
          max-h-[75vh] w-full
          rounded-t-[28px]

          md:bottom-auto md:left-auto md:right-4 md:top-4
          md:h-auto md:max-h-[calc(100vh-2rem)] md:w-96
          md:rounded-[28px]

          bg-white/95 shadow-2xl backdrop-blur-xl
          overflow-y-auto

          ${
            isOpen
              ? "translate-y-0 md:translate-x-0"
              : "translate-y-full md:translate-x-[120%] md:translate-y-0"
          }
        `}
      >
        {bird && (
          <div className="flex flex-col">
            {/* Photo area with gradient fallback */}
            <div className="relative h-52 w-full overflow-hidden rounded-t-[28px] bg-linear-to-br from-sky-300 via-teal-200 to-emerald-300 md:h-60 md:rounded-t-[28px]">
              <img
                src={bird.photoUrl}
                alt={bird.nameEn}
                loading="lazy"
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />

              {/* Audio indicator */}
              <div className="absolute bottom-3 left-4 flex items-center gap-2 rounded-full bg-black/30 px-3 py-1.5 text-white backdrop-blur-sm">
                <AudioIndicator status={audioStatus} />
              </div>
            </div>

            {/* Close button */}
            <button
              ref={closeButtonRef}
              onClick={handleClose}
              aria-label={language === "zh" ? "关闭" : "Close"}
              className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-black/30 text-lg text-white backdrop-blur-sm transition-all hover:scale-110 hover:bg-black/50 active:scale-95"
            >
              ✕
            </button>

            {/* Content */}
            <div className="px-5 pb-6 pt-5 md:px-6">
              {/* Names */}
              <div className="mb-4">
                <h2 className="text-[1.6rem] font-bold leading-tight text-gray-900">
                  {bird.nameZh}
                </h2>
                <p className="mt-0.5 text-sm tracking-wide text-gray-400">
                  {bird.pinyin}
                </p>
                <p className="mt-1 text-lg font-semibold text-gray-600">
                  {bird.nameEn}
                </p>
              </div>

              {/* Fun fact card */}
              <div className="rounded-2xl bg-amber-50/80 p-4 ring-1 ring-amber-200/50">
                <p className="text-sm font-semibold text-amber-700">
                  {language === "zh" ? "🌟 你知道吗？" : "🌟 Did you know?"}
                </p>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-gray-700">
                  {funFact}
                </p>
              </div>

              {/* Size comparison */}
              {bird.sizeCategory && (
                <div className="mt-4 rounded-2xl bg-sky-50/80 p-4 ring-1 ring-sky-200/50">
                  <p className="text-sm font-semibold text-sky-700">
                    {language === "zh" ? "📏 体型" : "📏 Size"}
                  </p>
                  <SizeBar category={bird.sizeCategory} language={language} />
                </div>
              )}

              {/* Diet display */}
              {bird.dietType && (
                <div className="mt-4 rounded-2xl bg-emerald-50/80 p-4 ring-1 ring-emerald-200/50">
                  <p className="text-sm font-semibold text-emerald-700">
                    {language === "zh" ? "🍽️ 食性" : "🍽️ Diet"}
                  </p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="text-xl">{DIET_EMOJI[bird.dietType]}</span>
                    <span className="text-sm text-emerald-800">
                      {language === "zh"
                        ? DIET_LABELS[bird.dietType].zh
                        : DIET_LABELS[bird.dietType].en}
                    </span>
                  </div>
                </div>
              )}

              {/* Wingspan bar */}
              {bird.wingspanCm && (
                <div className="mt-4 rounded-2xl bg-violet-50/80 p-4 ring-1 ring-violet-200/50">
                  <p className="text-sm font-semibold text-violet-700">
                    {language === "zh" ? "🦅 翼展" : "🦅 Wingspan"}
                  </p>
                  <WingspanBar
                    wingspanCm={bird.wingspanCm}
                    habitatType={bird.habitatType}
                    language={language}
                  />
                </div>
              )}

              {/* Extra info */}
              {bird.lifespan && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 ring-1 ring-rose-200/50">
                    ⏳ {bird.lifespan}
                  </span>
                </div>
              )}

              {/* Region tag */}
              <div className="mt-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3.5 py-1.5 text-xs font-semibold text-sky-700 ring-1 ring-sky-200/50">
                  {REGION_EMOJI[bird.region] || "📍"}{" "}
                  {language === "zh"
                    ? regionNameZh(bird.region)
                    : regionNameEn(bird.region)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AudioIndicator({ status }: { status: string }) {
  if (status === "loading") {
    return (
      <span className="flex items-center gap-1.5 text-sm">
        <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        <span className="text-xs opacity-80">Loading...</span>
      </span>
    );
  }

  if (status === "playing") {
    return (
      <span className="flex items-center gap-1">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="inline-block w-0.75 rounded-full bg-white"
            style={{
              animation: `audioBar 0.4s ease-in-out ${i * 0.1}s infinite alternate`,
            }}
          />
        ))}
        <style>{`
          @keyframes audioBar {
            from { height: 4px; }
            to { height: 14px; }
          }
        `}</style>
      </span>
    );
  }

  if (status === "error") {
    return <span className="text-sm opacity-70">🔇</span>;
  }

  return null;
}

function regionNameZh(region: string): string {
  const map: Record<string, string> = {
    asia: "亚洲",
    europe: "欧洲",
    africa: "非洲",
    "north-america": "北美洲",
    "south-america": "南美洲",
    oceania: "大洋洲",
    antarctica: "南极洲",
  };
  return map[region] || region;
}

function regionNameEn(region: string): string {
  const map: Record<string, string> = {
    asia: "Asia",
    europe: "Europe",
    africa: "Africa",
    "north-america": "North America",
    "south-america": "South America",
    oceania: "Oceania",
    antarctica: "Antarctica",
  };
  return map[region] || region;
}

const DIET_EMOJI: Record<DietType, string> = {
  insects: "🐛",
  fish: "🐟",
  seeds: "🌾",
  fruit: "🍎",
  meat: "🥩",
  omnivore: "🍽️",
};

const DIET_LABELS: Record<DietType, { zh: string; en: string }> = {
  insects: { zh: "昆虫", en: "Insects" },
  fish: { zh: "鱼类", en: "Fish" },
  seeds: { zh: "种子", en: "Seeds" },
  fruit: { zh: "水果", en: "Fruit" },
  meat: { zh: "肉食", en: "Meat" },
  omnivore: { zh: "杂食", en: "Omnivore" },
};

const SIZE_LABELS: Record<SizeCategory, { zh: string; en: string; icon: string }> = {
  tiny: { zh: "微型（麻雀）", en: "Tiny (Sparrow)", icon: "🐦" },
  small: { zh: "小型（鸽子）", en: "Small (Pigeon)", icon: "🕊" },
  medium: { zh: "中型（鸭子）", en: "Medium (Duck)", icon: "🦆" },
  large: { zh: "大型（鹰）", en: "Large (Eagle)", icon: "🦅" },
};

const SIZE_WIDTHS: Record<SizeCategory, string> = {
  tiny: "25%",
  small: "50%",
  medium: "75%",
  large: "100%",
};

function SizeBar({ category, language }: { category: SizeCategory; language: Language }) {
  const label = SIZE_LABELS[category];
  return (
    <div className="mt-2">
      <div className="flex items-center gap-2">
        <span className="text-base">{label.icon}</span>
        <span className="text-sm text-sky-800">
          {language === "zh" ? label.zh : label.en}
        </span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-sky-100">
        <div
          className="h-full rounded-full bg-sky-400 transition-all duration-500"
          style={{ width: SIZE_WIDTHS[category] }}
        />
      </div>
    </div>
  );
}
