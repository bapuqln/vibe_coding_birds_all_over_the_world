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
  const discoveredBirds = useAppStore((s) => s.discoveredBirds);

  const bird = notificationBirdId ? birdMap.get(notificationBirdId) ?? null : null;
  const isVisible = bird !== null;

  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(dismiss, 4000);
    return () => clearTimeout(timer);
  }, [isVisible, dismiss]);

  const handleClick = useCallback(() => dismiss(), [dismiss]);

  if (!isVisible || !bird) return null;

  const totalBirds = birds.length;
  const discoveredCount = discoveredBirds.length;

  return (
    <div
      className="pointer-events-auto fixed left-1/2 -translate-x-1/2"
      onClick={handleClick}
      style={{
        top: "var(--safe-area)",
        animation: "discoveryBounceIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      <StarParticles />
      <ConfettiBurst />

      <div style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 12,
        borderRadius: 20,
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.2), 0 0 40px rgba(251, 191, 36, 0.2)",
        padding: "14px 22px",
        cursor: "pointer",
        maxWidth: 380,
      }}>
        <DiscoveryIcon />
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#f59e0b", margin: 0, letterSpacing: "0.02em" }}>
            {language === "zh" ? "🎉 发现新鸟类！" : "🎉 New Bird Discovered!"}
          </p>
          <p style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: "3px 0 0" }}>
            {language === "zh" ? bird.nameZh : bird.nameEn}
          </p>
          <p style={{ fontSize: 11, color: "#6b7280", margin: "2px 0 0" }}>
            {language === "zh"
              ? `已发现 ${discoveredCount} / ${totalBirds} 种鸟类`
              : `Birds Found: ${discoveredCount} / ${totalBirds}`}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes discoveryBounceIn {
          0% { opacity: 0; transform: translateX(-50%) translateY(-30px) scale(0.8); }
          60% { opacity: 1; transform: translateX(-50%) translateY(5px) scale(1.03); }
          100% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

function StarParticles() {
  const stars = Array.from({ length: 16 }, (_, i) => {
    const angle = (i / 16) * Math.PI * 2;
    const distance = 60 + Math.random() * 40;
    const size = 4 + Math.random() * 6;
    const delay = Math.random() * 0.3;
    const duration = 0.8 + Math.random() * 0.5;
    const colors = ["#fbbf24", "#f59e0b", "#fcd34d", "#fde68a", "#fb923c", "#facc15"];
    return { angle, distance, size, delay, duration, color: colors[i % colors.length] };
  });

  return (
    <div style={{
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
      overflow: "visible",
    }}>
      {stars.map((star, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: star.size,
            height: star.size,
            marginLeft: -star.size / 2,
            marginTop: -star.size / 2,
            animation: `starBurst ${star.duration}s ease-out ${star.delay}s forwards`,
            ["--star-x" as string]: `${Math.cos(star.angle) * star.distance}px`,
            ["--star-y" as string]: `${Math.sin(star.angle) * star.distance}px`,
          }}
        >
          <svg viewBox="0 0 24 24" width={star.size} height={star.size} fill={star.color}>
            <path d="M12 2l2.4 7.2H22l-6 4.8 2.4 7.2L12 16.4l-6.4 4.8 2.4-7.2-6-4.8h7.6z" />
          </svg>
        </div>
      ))}
      <style>{`
        @keyframes starBurst {
          0% {
            transform: translate(0, 0) scale(0) rotate(0deg);
            opacity: 1;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translate(var(--star-x), var(--star-y)) scale(1.2) rotate(180deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

function ConfettiBurst() {
  const pieces = Array.from({ length: 24 }, (_, i) => {
    const x = -120 + Math.random() * 240;
    const colors = ["#ef4444", "#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#ec4899", "#14b8a6"];
    return {
      x,
      delay: Math.random() * 0.4,
      duration: 1.2 + Math.random() * 0.8,
      color: colors[i % colors.length],
      width: 4 + Math.random() * 4,
      height: 8 + Math.random() * 6,
      rotation: Math.random() * 360,
    };
  });

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible" }}>
      {pieces.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: p.width,
            height: p.height,
            borderRadius: 2,
            backgroundColor: p.color,
            animation: `confettiFall ${p.duration}s ease-out ${p.delay}s forwards`,
            ["--cx" as string]: `${p.x}px`,
            ["--cr" as string]: `${p.rotation}deg`,
          }}
        />
      ))}
      <style>{`
        @keyframes confettiFall {
          0% {
            transform: translate(0, 0) rotate(0deg) scale(0);
            opacity: 1;
          }
          20% {
            transform: translate(calc(var(--cx) * 0.3), -40px) rotate(calc(var(--cr) * 0.5)) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(var(--cx), 120px) rotate(var(--cr)) scale(0.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

function DiscoveryIcon() {
  return (
    <div style={{
      width: 44,
      height: 44,
      borderRadius: 14,
      background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 22,
      flexShrink: 0,
      animation: "discoveryIconBounce 0.8s ease-in-out 0.2s",
      boxShadow: "0 4px 12px rgba(251, 191, 36, 0.4)",
    }}>
      🐦
      <style>{`
        @keyframes discoveryIconBounce {
          0%, 100% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.2) rotate(-10deg); }
          50% { transform: scale(1.3) rotate(5deg); }
          75% { transform: scale(1.1) rotate(-3deg); }
        }
      `}</style>
    </div>
  );
}
