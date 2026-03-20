import { useEffect, useRef } from "react";
import { useAppStore } from "../../store";
import type { TourWaypoint } from "../../types";

const WAYPOINTS: TourWaypoint[] = [
  {
    lat: -3.4653, lng: -62.2159, zoom: 1.8,
    titleZh: "亚马逊雨林", titleEn: "Amazon Rainforest",
    descriptionZh: "世界上最大的热带雨林，拥有数千种鸟类！",
    descriptionEn: "The world's largest tropical rainforest, home to thousands of bird species!",
    featuredBirdId: "toco-toucan",
    durationMs: 6000,
  },
  {
    lat: -2.0, lng: 34.0, zoom: 1.8,
    titleZh: "非洲大草原", titleEn: "African Savanna",
    descriptionZh: "广阔的草原上生活着非洲最壮观的鸟类。",
    descriptionEn: "The vast savanna is home to Africa's most spectacular birds.",
    featuredBirdId: "secretary-bird",
    durationMs: 6000,
  },
  {
    lat: -77.85, lng: 166.667, zoom: 1.8,
    titleZh: "南极洲", titleEn: "Antarctica",
    descriptionZh: "地球上最寒冷的大陆，帝企鹅的家园！",
    descriptionEn: "The coldest continent on Earth — home of the Emperor Penguin!",
    featuredBirdId: "emperor-penguin",
    durationMs: 6000,
  },
  {
    lat: 38.9, lng: -77.0, zoom: 1.8,
    titleZh: "北美洲", titleEn: "North America",
    descriptionZh: "白头海雕在这里翱翔，它是美国的国鸟！",
    descriptionEn: "The Bald Eagle soars here — America's national bird!",
    featuredBirdId: "bald-eagle",
    durationMs: 6000,
  },
];

export function GuidedTour() {
  const tourState = useAppStore((s) => s.tourState);
  const tourStep = useAppStore((s) => s.tourStep);
  const language = useAppStore((s) => s.language);
  const nextTourStep = useAppStore((s) => s.nextTourStep);
  const endTour = useAppStore((s) => s.endTour);
  const pauseTour = useAppStore((s) => s.pauseTour);
  const resumeTour = useAppStore((s) => s.resumeTour);
  const setSelectedBird = useAppStore((s) => s.setSelectedBird);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const currentWaypoint = WAYPOINTS[tourStep] ?? null;

  useEffect(() => {
    if (tourState === "intro") {
      timerRef.current = setTimeout(() => {
        nextTourStep();
      }, 3000);
      return () => clearTimeout(timerRef.current);
    }

    if (tourState === "touring" && currentWaypoint) {
      if (currentWaypoint.featuredBirdId) {
        setSelectedBird(currentWaypoint.featuredBirdId);
      }

      timerRef.current = setTimeout(() => {
        if (tourStep >= WAYPOINTS.length - 1) {
          endTour();
          setSelectedBird(null);
        } else {
          setSelectedBird(null);
          setTimeout(() => nextTourStep(), 500);
        }
      }, currentWaypoint.durationMs);

      return () => clearTimeout(timerRef.current);
    }
  }, [tourState, tourStep, currentWaypoint, nextTourStep, endTour, setSelectedBird]);

  if (tourState === "idle" || tourState === "complete") return null;

  if (tourState === "intro") {
    return (
      <div className="pointer-events-auto fixed inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="mx-4 max-w-sm rounded-3xl bg-white/95 p-8 text-center shadow-2xl backdrop-blur-xl">
          <p className="text-5xl">🧭</p>
          <h2 className="mt-3 text-2xl font-bold text-gray-800">
            {language === "zh" ? "欢迎，小探险家！" : "Welcome, Explorer!"}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {language === "zh"
              ? "让我们一起环游世界，发现神奇的鸟类！"
              : "Let's travel the world and discover amazing birds!"}
          </p>
          <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-gray-100">
            <div className="h-full animate-[tourProgress_3s_linear] rounded-full bg-amber-400" />
          </div>
        </div>
        <style>{`
          @keyframes tourProgress {
            from { width: 0; }
            to { width: 100%; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="pointer-events-auto fixed bottom-24 left-1/2 z-20 -translate-x-1/2 min-[900px]:bottom-auto min-[900px]:left-4 min-[900px]:top-20 min-[900px]:translate-x-0">
      <div className="w-72 rounded-[20px] bg-white/95 p-4 shadow-2xl backdrop-blur-xl">
        {currentWaypoint && (
          <>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-amber-600">
                {tourStep + 1}/{WAYPOINTS.length}
              </span>
              <div className="flex gap-1">
                {WAYPOINTS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 w-4 rounded-full ${
                      i <= tourStep ? "bg-amber-400" : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
            </div>

            <h3 className="text-base font-bold text-gray-800">
              {language === "zh" ? currentWaypoint.titleZh : currentWaypoint.titleEn}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-gray-500">
              {language === "zh"
                ? currentWaypoint.descriptionZh
                : currentWaypoint.descriptionEn}
            </p>

            <div className="mt-3 flex gap-2">
              {tourState === "paused" ? (
                <button
                  onClick={resumeTour}
                  className="flex-1 rounded-lg bg-amber-500 py-1.5 text-xs font-semibold text-white hover:bg-amber-600"
                >
                  {language === "zh" ? "继续" : "Resume"}
                </button>
              ) : (
                <button
                  onClick={pauseTour}
                  className="flex-1 rounded-lg bg-gray-100 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-200"
                >
                  {language === "zh" ? "暂停" : "Pause"}
                </button>
              )}
              <button
                onClick={() => {
                  endTour();
                  setSelectedBird(null);
                }}
                className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-200"
              >
                {language === "zh" ? "退出" : "Exit"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
