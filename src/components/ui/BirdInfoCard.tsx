import { useEffect, useRef, useCallback, useMemo, useState } from "react";
import { useAppStore } from "../../store";
import birdsData from "../../data/birds.json";
import type { Bird, DietType, Language, Rarity, SizeCategory } from "../../types";
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
  const collectBird = useAppStore((s) => s.collectBird);
  const collectedBirds = useAppStore((s) => s.collectedBirds);
  const markStoryBirdDiscovered = useAppStore((s) => s.markStoryBirdDiscovered);

  const cardRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [showSparkle, setShowSparkle] = useState(false);

  const bird = useMemo(
    () => (selectedBirdId ? birdMap.get(selectedBirdId) ?? null : null),
    [selectedBirdId],
  );

  const isOpen = bird !== null;
  const isCollected = useMemo(
    () => collectedBirds.some((b) => b.birdId === selectedBirdId),
    [collectedBirds, selectedBirdId],
  );

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

  const handleCollect = useCallback(() => {
    if (!selectedBirdId || isCollected) return;
    collectBird(selectedBirdId);
    if (bird?.storyTheme) {
      markStoryBirdDiscovered(bird.storyTheme, selectedBirdId);
    }
    setShowSparkle(true);
    setTimeout(() => setShowSparkle(false), 1500);
  }, [selectedBirdId, isCollected, collectBird, bird, markStoryBirdDiscovered]);

  const funFact = bird
    ? language === "zh" ? bird.funFactZh : bird.funFactEn
    : "";

  return (
    <div
      className={`pointer-events-auto fixed inset-0 z-20 transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      onClick={handleBackdropClick}
      aria-hidden={!isOpen}
    >
      {/* Center-bottom modal panel */}
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-label={bird ? `${bird.nameEn} - ${bird.nameZh}` : ""}
        className={`
          absolute bottom-0 left-1/2 -translate-x-1/2
          w-full max-w-lg
          max-h-[60vh]
          rounded-t-3xl
          bg-white/95 shadow-2xl backdrop-blur-xl
          overflow-y-auto
          transition-transform duration-500
          ease-[cubic-bezier(0.34,1.56,0.64,1)]
          ${isOpen ? "translate-y-0" : "translate-y-full"}

          min-[900px]:bottom-4 min-[900px]:left-1/2 min-[900px]:-translate-x-1/2
          min-[900px]:rounded-3xl min-[900px]:max-h-[70vh]
          min-[900px]:max-w-md
        `}
      >
        {bird && (
          <div className="flex flex-col">
            {/* Photo area */}
            <div className="relative h-44 w-full overflow-hidden rounded-t-3xl bg-linear-to-br from-sky-300 via-teal-200 to-emerald-300 min-[900px]:h-48">
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

              {/* Rarity badge */}
              {bird.rarity && bird.rarity !== "common" && (
                <div className="absolute left-4 top-3">
                  <RarityBadge rarity={bird.rarity} language={language} />
                </div>
              )}
            </div>

            {/* Close button */}
            <button
              ref={closeButtonRef}
              onClick={handleClose}
              aria-label={language === "zh" ? "关闭" : "Close"}
              className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-base text-white backdrop-blur-sm transition-all hover:scale-110 hover:bg-black/50 active:scale-95"
            >
              ✕
            </button>

            {/* Content */}
            <div className="px-5 pb-5 pt-4">
              {/* Names */}
              <div className="mb-3">
                <h2 className="text-xl font-bold leading-tight text-gray-900">
                  {bird.nameZh}
                </h2>
                <p className="mt-0.5 text-xs tracking-wide text-gray-400">
                  {bird.pinyin}
                </p>
                <p className="mt-0.5 text-base font-semibold text-gray-600">
                  {bird.nameEn}
                </p>
              </div>

              {/* Fun fact */}
              <div className="rounded-2xl bg-amber-50/80 p-3 ring-1 ring-amber-200/50">
                <p className="text-xs font-semibold text-amber-700">
                  {language === "zh" ? "🌟 你知道吗？" : "🌟 Did you know?"}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-700">
                  {funFact}
                </p>
              </div>

              {/* Region + Habitat */}
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 ring-1 ring-sky-200/50">
                  {REGION_EMOJI[bird.region] || "📍"}{" "}
                  {language === "zh" ? regionNameZh(bird.region) : regionNameEn(bird.region)}
                </span>
                {bird.habitatType && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200/50">
                    {language === "zh" ? habitatNameZh(bird.habitatType) : bird.habitatType}
                  </span>
                )}
                {bird.lifespan && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 ring-1 ring-rose-200/50">
                    ⏳ {bird.lifespan}
                  </span>
                )}
              </div>

              {/* Size + Diet + Wingspan in compact layout */}
              <div className="mt-3 grid grid-cols-2 gap-2">
                {bird.sizeCategory && (
                  <div className="rounded-xl bg-sky-50/80 p-2.5 ring-1 ring-sky-200/50">
                    <p className="text-[10px] font-semibold text-sky-700">
                      {language === "zh" ? "📏 体型" : "📏 Size"}
                    </p>
                    <SizeBar category={bird.sizeCategory} language={language} />
                  </div>
                )}
                {bird.dietType && (
                  <div className="rounded-xl bg-emerald-50/80 p-2.5 ring-1 ring-emerald-200/50">
                    <p className="text-[10px] font-semibold text-emerald-700">
                      {language === "zh" ? "🍽️ 食性" : "🍽️ Diet"}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="text-base">{DIET_EMOJI[bird.dietType]}</span>
                      <span className="text-xs text-emerald-800">
                        {language === "zh"
                          ? DIET_LABELS[bird.dietType].zh
                          : DIET_LABELS[bird.dietType].en}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Wingspan */}
              {bird.wingspanCm && (
                <div className="mt-2 rounded-xl bg-violet-50/80 p-2.5 ring-1 ring-violet-200/50">
                  <p className="text-[10px] font-semibold text-violet-700">
                    {language === "zh" ? "🦅 翼展" : "🦅 Wingspan"}
                  </p>
                  <WingspanBar
                    wingspanCm={bird.wingspanCm}
                    habitatType={bird.habitatType}
                    language={language}
                  />
                </div>
              )}

              {/* Action buttons */}
              <div className="mt-4 flex gap-2">
                {/* Collect button */}
                <button
                  type="button"
                  onClick={handleCollect}
                  disabled={isCollected}
                  className={`relative flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all active:scale-95 ${
                    isCollected
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-500 text-white hover:bg-amber-600"
                  }`}
                >
                  {isCollected ? (
                    <>✓ {language === "zh" ? "已收集" : "Collected"}</>
                  ) : (
                    <>{language === "zh" ? "⭐ 收集" : "⭐ Collect"}</>
                  )}
                  {showSparkle && <CollectSparkle />}
                </button>

                {/* Sound button */}
                <button
                  type="button"
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 text-lg text-sky-700 transition-all hover:bg-sky-200 active:scale-95"
                  aria-label={language === "zh" ? "播放声音" : "Play sound"}
                >
                  {audioStatus === "playing" ? "🔊" : "🔈"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CollectSparkle() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="absolute h-1.5 w-1.5 rounded-full"
          style={{
            left: `${20 + Math.random() * 60}%`,
            top: `${20 + Math.random() * 60}%`,
            backgroundColor: ["#fbbf24", "#f59e0b", "#fcd34d", "#fde68a"][i % 4],
            animation: `sparkle ${0.5 + Math.random() * 0.5}s ease-out ${Math.random() * 0.3}s forwards`,
          }}
        />
      ))}
      <style>{`
        @keyframes sparkle {
          0% { transform: scale(0) rotate(0deg); opacity: 1; }
          100% { transform: scale(2) rotate(180deg) translateY(-20px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function RarityBadge({ rarity, language }: { rarity: Rarity; language: Language }) {
  const config: Record<Rarity, { label: string; labelZh: string; bg: string; icon: string }> = {
    common: { label: "Common", labelZh: "普通", bg: "bg-gray-500/70", icon: "" },
    rare: { label: "Rare", labelZh: "稀有", bg: "bg-blue-500/80", icon: "💎" },
    legendary: { label: "Legendary", labelZh: "传说", bg: "bg-amber-500/80", icon: "👑" },
  };
  const c = config[rarity];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full ${c.bg} px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm`}>
      {c.icon} {language === "zh" ? c.labelZh : c.label}
    </span>
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
    asia: "亚洲", europe: "欧洲", africa: "非洲",
    "north-america": "北美洲", "south-america": "南美洲",
    oceania: "大洋洲", antarctica: "南极洲",
  };
  return map[region] || region;
}

function regionNameEn(region: string): string {
  const map: Record<string, string> = {
    asia: "Asia", europe: "Europe", africa: "Africa",
    "north-america": "North America", "south-america": "South America",
    oceania: "Oceania", antarctica: "Antarctica",
  };
  return map[region] || region;
}

function habitatNameZh(habitat: string): string {
  const map: Record<string, string> = {
    rainforest: "热带雨林", wetlands: "湿地", coast: "海岸",
    grassland: "草原", forest: "森林", polar: "极地",
  };
  return map[habitat] || habitat;
}

const DIET_EMOJI: Record<DietType, string> = {
  insects: "🐛", fish: "🐟", seeds: "🌾",
  fruit: "🍎", meat: "🥩", omnivore: "🍽️",
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
  tiny: { zh: "微型", en: "Tiny", icon: "🐦" },
  small: { zh: "小型", en: "Small", icon: "🕊" },
  medium: { zh: "中型", en: "Medium", icon: "🦆" },
  large: { zh: "大型", en: "Large", icon: "🦅" },
};

function SizeBar({ category, language }: { category: SizeCategory; language: Language }) {
  const label = SIZE_LABELS[category];
  return (
    <div className="mt-1 flex items-center gap-1.5">
      <span className="text-base">{label.icon}</span>
      <span className="text-xs text-sky-800">
        {language === "zh" ? label.zh : label.en}
      </span>
    </div>
  );
}
