import { useAppStore } from "../../store";
import birdsData from "../../data/birds.json";
import type { Bird } from "../../types";
import { createSpawnedBird } from "../../systems/SandboxSystem";

const birds = birdsData as Bird[];
const uniqueBirdTypes = birds.reduce<Bird[]>((acc, b) => {
  if (!acc.find((x) => x.nameEn === b.nameEn)) acc.push(b);
  return acc;
}, []).slice(0, 20);

export function SandboxToolbar() {
  const active = useAppStore((s) => s.sandboxModeActive);
  const setActive = useAppStore((s) => s.setSandboxModeActive);
  const spawnedBirds = useAppStore((s) => s.spawnedBirds);
  const addSpawned = useAppStore((s) => s.addSpawnedBird);
  const clearAll = useAppStore((s) => s.clearSpawnedBirds);
  const timeHour = useAppStore((s) => s.sandboxTimeHour);
  const setTimeHour = useAppStore((s) => s.setSandboxTimeHour);
  const weatherVisible = useAppStore((s) => s.weatherVisible);
  const setWeatherVisible = useAppStore((s) => s.setWeatherVisible);
  const language = useAppStore((s) => s.language);

  const handleSpawn = (bird: Bird) => {
    if (spawnedBirds.length >= 50) return;
    const lat = bird.lat + (Math.random() - 0.5) * 10;
    const lng = bird.lng + (Math.random() - 0.5) * 10;
    addSpawned(createSpawnedBird(bird.id, lat, lng));
  };

  if (!active) return null;

  return (
    <div
      className="pointer-events-auto fixed left-1/2 -translate-x-1/2"
      style={{ bottom: "var(--safe-area)", zIndex: "var(--z-bottom-panel)", maxWidth: "90vw" }}
    >
      <div className="glass-panel p-3 text-white">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🧪</span>
            <span className="text-xs font-bold">
              {language === "zh" ? "沙盒模式" : "Sandbox Mode"}
            </span>
            <span className="text-xs text-white/50">
              {spawnedBirds.length}/50
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={clearAll}
              className="rounded-full bg-red-500/30 px-3 py-1 text-xs hover:bg-red-500/50"
            >
              {language === "zh" ? "清除" : "Clear"}
            </button>
            <button
              onClick={() => setActive(false)}
              className="text-white/60 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Bird palette */}
        <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {uniqueBirdTypes.map((bird) => (
            <button
              key={bird.id}
              onClick={() => handleSpawn(bird)}
              className="flex shrink-0 flex-col items-center gap-0.5 rounded-lg bg-white/10 p-1.5 transition hover:bg-white/20"
              title={language === "zh" ? bird.nameZh : bird.nameEn}
            >
              <span className="text-lg">🐦</span>
              <span className="max-w-12 truncate text-[9px]">
                {language === "zh" ? bird.nameZh : bird.nameEn}
              </span>
            </button>
          ))}
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-3">
          {/* Time slider */}
          <div className="flex flex-1 items-center gap-2">
            <span className="text-sm">{timeHour < 6 || timeHour > 18 ? "🌙" : "☀️"}</span>
            <input
              type="range"
              min={0}
              max={24}
              step={0.5}
              value={timeHour}
              onChange={(e) => setTimeHour(Number(e.target.value))}
              className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-white/20 accent-blue-400"
            />
            <span className="text-xs text-white/60">{Math.floor(timeHour)}:00</span>
          </div>

          {/* Weather toggle */}
          <button
            onClick={() => setWeatherVisible(!weatherVisible)}
            className={`rounded-full px-3 py-1 text-xs transition ${
              weatherVisible ? "bg-blue-500/40" : "bg-white/10"
            } hover:bg-white/20`}
          >
            🌦️ {language === "zh" ? "天气" : "Weather"}
          </button>
        </div>
      </div>
    </div>
  );
}
