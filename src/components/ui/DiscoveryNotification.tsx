import { useEffect, useCallback } from "react";
import { useAppStore } from "../../store";
import birdsData from "../../data/birds.json";
import type { Bird } from "../../types";

const birds = birdsData as Bird[];
const birdMap = new Map(birds.map((b) => [b.id, b]));

export function DiscoveryNotification() {
  const notificationBirdId = useAppStore((s) => s.discoveryNotification);
  const language = useAppStore((s) => s.language);
  const dismiss = useAppStore((s) => s.dismissDiscoveryNotification);

  const bird = notificationBirdId ? birdMap.get(notificationBirdId) ?? null : null;
  const isVisible = bird !== null;

  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(dismiss, 3000);
    return () => clearTimeout(timer);
  }, [isVisible, dismiss]);

  const handleClick = useCallback(() => dismiss(), [dismiss]);

  if (!isVisible || !bird) return null;

  return (
    <div
      className="pointer-events-auto fixed left-1/2 top-6 z-25 -translate-x-1/2"
      onClick={handleClick}
      style={{
        animation: "discoverySlideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        borderRadius: 16,
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.2)",
        padding: "12px 20px",
        cursor: "pointer",
        maxWidth: 360,
      }}>
        <DiscoveryIcon />
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#f59e0b", margin: 0 }}>
            {language === "zh" ? "发现新鸟类！" : "New bird discovered!"}
          </p>
          <p style={{ fontSize: 15, fontWeight: 600, color: "#111827", margin: "2px 0 0" }}>
            {language === "zh" ? bird.nameZh : bird.nameEn}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes discoverySlideIn {
          0% { opacity: 0; transform: translateX(-50%) translateY(-20px) scale(0.9); }
          100% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

function DiscoveryIcon() {
  return (
    <div style={{
      width: 40,
      height: 40,
      borderRadius: 12,
      background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 20,
      flexShrink: 0,
      animation: "discoveryPulse 0.6s ease-in-out 0.3s",
    }}>
      🎉
      <style>{`
        @keyframes discoveryPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}
