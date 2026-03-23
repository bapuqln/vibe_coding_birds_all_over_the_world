import { useAppStore } from "../../store";
import expeditionsData from "../../data/expeditions.json";

export function ExpeditionProgressBar() {
  const progress = useAppStore((s) => s.expeditions);
  const language = useAppStore((s) => s.language);
  const setOpen = useAppStore((s) => s.setExpeditionPanelOpen);
  const setActivePanel = useAppStore((s) => s.setActivePanel);

  const total = expeditionsData.length;
  const completed = progress.filter((p) => p.completed).length;
  const pct = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div
      className="pointer-events-auto cursor-pointer"
      onClick={() => {
        setOpen(true);
        setActivePanel("expeditions");
      }}
      style={{ minHeight: 56, minWidth: 56 }}
    >
      <p className="mb-1 text-xs font-medium text-white/70">
        {language === "zh" ? "探险" : "Expeditions"}: {completed}/{total}
      </p>
      <div className="h-1.5 w-28 overflow-hidden rounded-full bg-white/20">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
