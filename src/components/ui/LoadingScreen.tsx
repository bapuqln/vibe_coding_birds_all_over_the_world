import { useEffect, useState } from "react";
import { useAppStore } from "../../store";

export function LoadingScreen() {
  const globeReady = useAppStore((s) => s.globeReady);
  const modelsReady = useAppStore((s) => s.modelsReady);
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 500);
    const t2 = setTimeout(() => setStage(2), 1500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    if (globeReady) setStage((s) => Math.max(s, 2));
  }, [globeReady]);

  useEffect(() => {
    if (globeReady && modelsReady) {
      setStage(3);
      const timer = setTimeout(() => {
        setFading(true);
        setTimeout(() => setVisible(false), 700);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [globeReady, modelsReady]);

  useEffect(() => {
    const safety = setTimeout(() => {
      setFading(true);
      setTimeout(() => setVisible(false), 700);
    }, 8000);
    return () => clearTimeout(safety);
  }, []);

  if (!visible) return null;

  const progress = stage === 0 ? 10 : stage === 1 ? 40 : stage === 2 ? 75 : 100;

  const STAGES = [
    { en: "Preparing...", zh: "准备中..." },
    { en: "Loading Earth...", zh: "加载地球..." },
    { en: "Loading Birds...", zh: "加载鸟类..." },
    { en: "Ready!", zh: "准备就绪！" },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050a18] transition-opacity duration-700"
      style={{ opacity: fading ? 0 : 1 }}
    >
      <div className="text-center">
        <p className="text-5xl">🌍</p>
        <h2 className="mt-4 text-2xl font-bold text-white/90">万羽拾音</h2>
        <p className="mt-1 text-xs text-white/40">Kids Bird Globe</p>

        <div className="mx-auto mt-6 h-1.5 w-48 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-amber-400 transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="mt-3 text-sm text-white/50">
          {STAGES[stage]?.en ?? "Loading..."}
        </p>
      </div>
    </div>
  );
}
