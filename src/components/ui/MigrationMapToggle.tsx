import { useAppStore } from "../../store";

export function MigrationMapToggle() {
  const showAllRoutes = useAppStore((s) => s.showAllRoutes);
  const setShowAllRoutes = useAppStore((s) => s.setShowAllRoutes);
  const language = useAppStore((s) => s.language);

  return (
    <button
      onClick={() => setShowAllRoutes(!showAllRoutes)}
      className={`
        fixed bottom-36 right-4 z-30
        flex items-center gap-1.5
        rounded-full px-4 py-2.5
        text-sm font-semibold shadow-lg
        transition-all duration-200
        min-h-12 min-w-12
        ${
          showAllRoutes
            ? "bg-amber-500 text-white ring-2 ring-amber-300"
            : "bg-white/90 text-gray-700 ring-1 ring-gray-200/50 backdrop-blur-sm hover:bg-white"
        }
      `}
      aria-label={language === "zh" ? "显示全部路线" : "Show all routes"}
    >
      <span className="text-base">🗺️</span>
      <span className="hidden sm:inline">
        {language === "zh" ? "全部路线" : "All Routes"}
      </span>
    </button>
  );
}
