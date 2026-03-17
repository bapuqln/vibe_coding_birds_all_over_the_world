import { useEffect } from "react";
import { useAppStore } from "../../store";

export function ScreenshotFlash() {
  const screenshotFlash = useAppStore((s) => s.screenshotFlash);
  const setScreenshotFlash = useAppStore((s) => s.setScreenshotFlash);

  useEffect(() => {
    if (screenshotFlash) {
      const timer = setTimeout(() => setScreenshotFlash(false), 300);
      return () => clearTimeout(timer);
    }
  }, [screenshotFlash, setScreenshotFlash]);

  if (!screenshotFlash) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0"
      style={{
        zIndex: "var(--z-overlay)",
        background: "rgba(255,255,255,0.7)",
        animation: "fadeOut 0.3s ease-out forwards",
      }}
    />
  );
}
