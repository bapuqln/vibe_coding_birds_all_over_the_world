import { useAppStore } from "../../store";
import { exportProgressJson, downloadDataUrl } from "../../utils/shareCard";

export function SharePanel() {
  const sharePanelOpen = useAppStore((s) => s.sharePanelOpen);
  const setSharePanelOpen = useAppStore((s) => s.setSharePanelOpen);
  const recentScreenshots = useAppStore((s) => s.recentScreenshots);
  const language = useAppStore((s) => s.language);
  const discoveredBirds = useAppStore((s) => s.discoveredBirds);
  const collectedBirds = useAppStore((s) => s.collectedBirds);
  const achievements = useAppStore((s) => s.achievements);
  const expeditions = useAppStore((s) => s.expeditions);
  const completedMissionCount = useAppStore((s) => s.completedMissionCount);
  const listenCount = useAppStore((s) => s.listenCount);

  if (!sharePanelOpen) return null;

  const handleExportProgress = () => {
    exportProgressJson({
      exportDate: new Date().toISOString(),
      discoveredBirds,
      collectedBirds,
      achievements,
      expeditions,
      statistics: {
        totalDiscovered: discoveredBirds.length,
        totalCollected: collectedBirds.length,
        completedMissions: completedMissionCount,
        soundsListened: listenCount,
      },
    });
  };

  const handleDownloadScreenshot = (dataUrl: string, index: number) => {
    downloadDataUrl(dataUrl, `bird-globe-screenshot-${index + 1}.png`);
  };

  return (
    <div
      className="pointer-events-auto fixed inset-0 flex items-center justify-center"
      style={{ zIndex: "var(--z-modal)" }}
    >
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => setSharePanelOpen(false)}
      />
      <div
        className="relative mx-4 max-h-[80vh] w-full max-w-md overflow-y-auto rounded-2xl p-6"
        style={{
          background: "rgba(10,20,40,0.92)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">
            {language === "zh" ? "📤 分享与导出" : "📤 Share & Export"}
          </h2>
          <button
            onClick={() => setSharePanelOpen(false)}
            className="rounded-full px-3 py-1 text-sm text-white/60 hover:bg-white/10"
          >
            ✕
          </button>
        </div>

        <button
          onClick={handleExportProgress}
          className="mb-4 w-full rounded-xl bg-blue-500/20 px-4 py-3 text-left text-sm text-white transition-colors hover:bg-blue-500/30"
          style={{ minHeight: 56 }}
        >
          <div className="font-medium">
            {language === "zh" ? "📊 导出探索进度" : "📊 Export Progress"}
          </div>
          <div className="mt-0.5 text-xs text-white/50">
            {language === "zh"
              ? `已发现 ${discoveredBirds.length} 只鸟类`
              : `${discoveredBirds.length} birds discovered`}
          </div>
        </button>

        {recentScreenshots.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-medium text-white/70">
              {language === "zh" ? "最近截图" : "Recent Screenshots"}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {recentScreenshots.map((url, i) => (
                <button
                  key={i}
                  onClick={() => handleDownloadScreenshot(url, i)}
                  className="overflow-hidden rounded-lg transition-transform hover:scale-105"
                >
                  <img
                    src={url}
                    alt={`Screenshot ${i + 1}`}
                    className="h-24 w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {recentScreenshots.length === 0 && (
          <p className="text-center text-sm text-white/40">
            {language === "zh"
              ? "还没有截图。使用右侧的📸按钮截图！"
              : "No screenshots yet. Use the 📸 button to capture!"}
          </p>
        )}
      </div>
    </div>
  );
}
