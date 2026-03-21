import { useMemo, useState, useEffect, useRef } from "react";
import { useAppStore } from "../../store";
import birdsData from "../../data/birds.json";
import type { Bird } from "../../types";

const birds = birdsData as Bird[];

const REGIONS = [
  { id: "asia", zh: "亚洲", en: "AS", emoji: "🏯", color: "#3b82f6" },
  { id: "europe", zh: "欧洲", en: "EU", emoji: "🏰", color: "#8b5cf6" },
  { id: "africa", zh: "非洲", en: "AF", emoji: "🌍", color: "#f59e0b" },
  { id: "north-america", zh: "北美", en: "NA", emoji: "🗽", color: "#ef4444" },
  { id: "south-america", zh: "南美", en: "SA", emoji: "🌿", color: "#22c55e" },
  { id: "oceania", zh: "大洋", en: "OC", emoji: "🐨", color: "#14b8a6" },
  { id: "antarctica", zh: "南极", en: "AN", emoji: "🧊", color: "#06b6d4" },
];

const TIPS_ZH = [
  "试试探索南美洲吧！那里有很多色彩缤纷的鸟类。",
  "去非洲看看吧！那里有许多独特的鸟类等你发现。",
  "亚洲有很多美丽的鸟类，快去探索吧！",
  "欧洲的鸟类也很有趣，去看看吧！",
  "大洋洲有很多独特的鸟类，快去发现吧！",
  "北美洲有很多壮观的鸟类等你发现！",
  "南极洲的企鹅在等你！去探索吧！",
  "试试聆听鸟鸣声，每种鸟的叫声都不一样！",
  "给你发现的鸟拍张照片吧！",
  "完成每日任务可以获得徽章哦！",
];

const TIPS_EN = [
  "Try exploring South America. Many colorful birds live there!",
  "Explore Africa! Many unique birds are waiting for you.",
  "Asia has beautiful birds to discover. Go explore!",
  "European birds are fascinating. Take a look!",
  "Oceania has unique birds. Go discover them!",
  "North America has amazing birds waiting for you!",
  "Penguins are waiting in Antarctica! Go explore!",
  "Try listening to bird sounds. Each bird sounds different!",
  "Take a photo of the birds you discover!",
  "Complete daily missions to earn badges!",
];

export function BottomDiscoveryPanel() {
  const discoveredBirds = useAppStore((s) => s.discoveredBirds);
  const language = useAppStore((s) => s.language);
  const selectedBirdId = useAppStore((s) => s.selectedBirdId);

  const totalBirds = birds.length;
  const discoveredCount = discoveredBirds.length;
  const pct = totalBirds > 0 ? (discoveredCount / totalBirds) * 100 : 0;

  const [tipIndex, setTipIndex] = useState(0);
  const [tipFading, setTipFading] = useState(false);
  const tipTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    tipTimerRef.current = setInterval(() => {
      setTipFading(true);
      setTimeout(() => {
        setTipIndex((prev) => (prev + 1) % TIPS_ZH.length);
        setTipFading(false);
      }, 300);
    }, 8000);
    return () => {
      if (tipTimerRef.current) clearInterval(tipTimerRef.current);
    };
  }, []);

  const continentProgress = useMemo(() => {
    const discoveredSet = new Set(discoveredBirds);
    return REGIONS.map((region) => {
      const regionBirds = birds.filter((b) => b.region === region.id);
      const found = regionBirds.filter((b) => discoveredSet.has(b.id)).length;
      return { ...region, found, total: regionBirds.length };
    });
  }, [discoveredBirds]);

  const currentTip = language === "zh" ? TIPS_ZH[tipIndex] : TIPS_EN[tipIndex];

  if (selectedBirdId) return null;

  return (
    <div
      className="pointer-events-auto fixed glass-panel"
      style={{
        bottom: "var(--safe-area)",
        left: "50%",
        transform: "translateX(-50%)",
        width: "min(440px, calc(100% - 240px))",
        padding: "12px 16px",
        animation: "panelSlideUp var(--panel-duration) var(--panel-ease)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>
          {language === "zh" ? "🌍 世界鸟类探索" : "🌍 World Bird Discovery"}
        </span>
        <span style={{ fontSize: 14, fontWeight: 700, color: "white" }}>
          {discoveredCount} / {totalBirds}
        </span>
      </div>

      <div style={{
        height: 6,
        borderRadius: 3,
        background: "rgba(255,255,255,0.12)",
        overflow: "hidden",
      }}>
        <div style={{
          height: "100%",
          borderRadius: 3,
          background: "linear-gradient(90deg, #fbbf24, #f59e0b, #f97316)",
          width: `${pct}%`,
          transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: "0 0 8px rgba(251, 191, 36, 0.4)",
        }} />
      </div>

      <div style={{ marginTop: 8, display: "flex", gap: 3, flexWrap: "wrap" }}>
        {continentProgress.map((cp) => {
          const regionPct = cp.total > 0 ? (cp.found / cp.total) * 100 : 0;
          return (
            <div
              key={cp.id}
              style={{
                flex: "1 1 auto",
                minWidth: 36,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>
                {language === "zh" ? cp.zh : cp.en}
              </span>
              <div style={{
                width: "100%",
                height: 3,
                borderRadius: 2,
                background: "rgba(255,255,255,0.08)",
                overflow: "hidden",
              }}>
                <div style={{
                  height: "100%",
                  borderRadius: 2,
                  background: cp.color,
                  width: `${regionPct}%`,
                  transition: "width 0.6s ease",
                  opacity: 0.8,
                }} />
              </div>
            </div>
          );
        })}
      </div>

      {discoveredCount > 0 && (
        <div
          style={{
            marginTop: 8,
            padding: "5px 10px",
            borderRadius: 10,
            background: "rgba(251, 191, 36, 0.12)",
            border: "1px solid rgba(251, 191, 36, 0.15)",
            transition: "opacity 0.3s ease",
            opacity: tipFading ? 0 : 1,
          }}
        >
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", margin: 0, lineHeight: 1.4 }}>
            💡 {currentTip}
          </p>
        </div>
      )}
    </div>
  );
}
