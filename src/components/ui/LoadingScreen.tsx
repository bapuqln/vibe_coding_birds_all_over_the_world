import { useEffect, useState } from "react";
import { useAppStore } from "../../store";

export function LoadingScreen() {
  const globeReady = useAppStore((s) => s.globeReady);
  const modelsReady = useAppStore((s) => s.modelsReady);
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (globeReady && modelsReady) {
      setFading(true);
      const timer = setTimeout(() => setVisible(false), 700);
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

  return (
    <div
      className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-[#050a18] transition-opacity duration-700"
      style={{ opacity: fading ? 0 : 1 }}
    >
      <div className="animate-pulse text-center">
        <p className="text-5xl">🌍</p>
        <h2 className="mt-4 text-2xl font-bold text-white/90">万羽拾音</h2>
        <p className="mt-2 text-sm text-white/50">
          Loading the world of birds...
        </p>
      </div>
    </div>
  );
}
