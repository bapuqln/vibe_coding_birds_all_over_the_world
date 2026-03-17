import { useState, useEffect, useCallback, useRef } from "react";
import { useAppStore } from "../../store";

export function PerformanceMonitor() {
  const [visible, setVisible] = useState(false);
  const fps = useAppStore((s) => s.currentFps);
  const lodDistance = useAppStore((s) => s.dynamicLodDistance);

  const tapCountRef = useRef(0);
  const tapTimerRef = useRef(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("perf") === "1") setVisible(true);
  }, []);

  const handleTripleTap = useCallback(() => {
    const now = Date.now();
    if (now - tapTimerRef.current > 500) {
      tapCountRef.current = 0;
    }
    tapTimerRef.current = now;
    tapCountRef.current++;
    if (tapCountRef.current >= 3) {
      setVisible((v) => !v);
      tapCountRef.current = 0;
    }
  }, []);

  if (!visible) {
    return (
      <div
        className="pointer-events-auto fixed"
        style={{ top: 0, right: 0, width: 60, height: 60, zIndex: "var(--z-overlay)" }}
        onClick={handleTripleTap}
      />
    );
  }

  return (
    <div
      className="pointer-events-auto fixed rounded-lg px-3 py-2 font-mono text-xs"
      style={{
        top: "var(--safe-area)",
        right: "var(--safe-area)",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(8px)",
        zIndex: "var(--z-overlay)",
        color: fps >= 55 ? "#4ade80" : fps >= 40 ? "#fbbf24" : "#ef4444",
      }}
      onClick={() => setVisible(false)}
    >
      <div>FPS: {fps}</div>
      <div className="text-white/50">LOD: {lodDistance.toFixed(1)}</div>
    </div>
  );
}
