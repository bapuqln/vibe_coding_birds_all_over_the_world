import { useAppStore } from "../../store";

const TIME_ICONS: Record<string, string> = {
  dawn: "🌅",
  morning: "☀️",
  afternoon: "🌤️",
  dusk: "🌇",
  night: "🌙",
};

const TIME_LABELS_ZH: Record<string, string> = {
  dawn: "黎明",
  morning: "上午",
  afternoon: "下午",
  dusk: "黄昏",
  night: "夜晚",
};

const TIME_LABELS_EN: Record<string, string> = {
  dawn: "Dawn",
  morning: "Morning",
  afternoon: "Afternoon",
  dusk: "Dusk",
  night: "Night",
};

export function TimeIndicator() {
  const timeOfDay = useAppStore((s) => s.timeOfDay);
  const language = useAppStore((s) => s.language);

  const icon = TIME_ICONS[timeOfDay] ?? "☀️";
  const label = language === "zh"
    ? TIME_LABELS_ZH[timeOfDay] ?? timeOfDay
    : TIME_LABELS_EN[timeOfDay] ?? timeOfDay;

  return (
    <div
      className="pointer-events-none fixed flex items-center gap-1.5 rounded-full px-3 py-1.5"
      style={{
        top: "var(--safe-area)",
        right: 80,
        background: "rgba(0,0,0,0.35)",
        backdropFilter: "blur(8px)",
        zIndex: "var(--z-sidebar)",
      }}
    >
      <span className="text-base">{icon}</span>
      <span className="text-xs font-medium text-white/80">{label}</span>
    </div>
  );
}
