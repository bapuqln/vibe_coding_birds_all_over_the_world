import { useMemo } from "react";
import { useAppStore } from "../../store";
import birdsData from "../../data/birds.json";
import type { Bird } from "../../types";

const birds = birdsData as Bird[];

export function BirdRadar() {
  const radarOpen = useAppStore((s) => s.radarOpen);
  const activeRegion = useAppStore((s) => s.activeRegion);
  const language = useAppStore((s) => s.language);
  const setSelectedBird = useAppStore((s) => s.setSelectedBird);
  const setRadarOpen = useAppStore((s) => s.setRadarOpen);

  const visibleBirds = useMemo(() => {
    if (activeRegion) return birds.filter((b) => b.region === activeRegion);
    return birds;
  }, [activeRegion]);

  if (!radarOpen) {
    return (
      <button
        type="button"
        onClick={() => setRadarOpen(true)}
        className="fixed left-4 top-20 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/65 text-base text-white shadow-lg backdrop-blur-lg transition-all hover:scale-105 active:scale-95"
        aria-label={language === "zh" ? "鸟类雷达" : "Bird Radar"}
      >
        📡
      </button>
    );
  }

  return (
    <div className="fixed left-4 top-20 z-10">
      <div className="relative h-36 w-36 overflow-hidden rounded-full border-2 border-green-400/30 bg-black/70 shadow-xl backdrop-blur-lg">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-px w-full bg-green-400/20" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-full w-px bg-green-400/20" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-16 w-16 rounded-full border border-green-400/15" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-28 w-28 rounded-full border border-green-400/10" />
        </div>

        <div className="absolute inset-0 animate-[radarSweep_3s_linear_infinite]">
          <div
            className="absolute left-1/2 top-1/2 h-1/2 w-1/2 origin-bottom-left"
            style={{
              background: "conic-gradient(from 0deg, transparent 0deg, rgba(74,222,128,0.3) 30deg, transparent 60deg)",
            }}
          />
        </div>

        {visibleBirds.map((bird, i) => {
          const angle = (i / visibleBirds.length) * Math.PI * 2;
          const dist = 25 + (bird.id.charCodeAt(0) % 20);
          const x = 50 + Math.cos(angle) * dist;
          const y = 50 + Math.sin(angle) * dist;
          return (
            <button
              key={bird.id}
              type="button"
              onClick={() => {
                setSelectedBird(bird.id);
                setRadarOpen(false);
              }}
              className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.6)] transition-all hover:scale-150"
              style={{ left: `${x}%`, top: `${y}%` }}
              title={language === "zh" ? bird.nameZh : bird.nameEn}
            />
          );
        })}

        <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_8px_white]" />

        <button
          type="button"
          onClick={() => setRadarOpen(false)}
          className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-[10px] text-white/70 hover:text-white"
          aria-label={language === "zh" ? "关闭" : "Close"}
        >
          ✕
        </button>
      </div>

      <p className="mt-1 text-center text-[10px] font-medium text-green-400/80">
        {language === "zh"
          ? `${visibleBirds.length} 只鸟`
          : `${visibleBirds.length} birds`}
      </p>

      <style>{`
        @keyframes radarSweep {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
