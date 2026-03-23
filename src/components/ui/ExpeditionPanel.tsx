import { useEffect } from "react";
import { useAppStore } from "../../store";
import expeditionsData from "../../data/expeditions.json";
import type { Expedition } from "../../types";

const expeditions = expeditionsData as Expedition[];

export function ExpeditionPanel() {
  const isOpen = useAppStore((s) => s.expeditionPanelOpen);
  const setOpen = useAppStore((s) => s.setExpeditionPanelOpen);
  const progress = useAppStore((s) => s.expeditions);
  const language = useAppStore((s) => s.language);
  const setActivePanel = useAppStore((s) => s.setActivePanel);

  if (!isOpen) return null;

  const completedCount = progress.filter((p) => p.completed).length;

  return (
    <div
      className="pointer-events-auto fixed inset-0 flex items-center justify-center"
      onClick={() => {
        setOpen(false);
        setActivePanel(null);
      }}
    >
      <div
        className="glass-card relative mx-4 flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "scaleFade 250ms ease-out" }}
      >
        <div className="flex items-center justify-between border-b border-black/10 p-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              {language === "zh" ? "鸟类探险" : "Bird Expeditions"}
            </h2>
            <p className="text-sm text-gray-500">
              {completedCount}/{expeditions.length}{" "}
              {language === "zh" ? "已完成" : "Complete"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setActivePanel(null);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-gray-500 hover:bg-black/10"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500"
              style={{
                width: `${(completedCount / expeditions.length) * 100}%`,
              }}
            />
          </div>

          <div className="space-y-3">
            {expeditions.map((exp) => {
              const prog = progress.find((p) => p.expeditionId === exp.id);
              const current = prog?.current || 0;
              const completed = prog?.completed || false;
              const pct = Math.min((current / exp.goal) * 100, 100);

              return (
                <div
                  key={exp.id}
                  className={`rounded-2xl border p-4 transition-all ${
                    completed
                      ? "border-green-300 bg-green-50"
                      : "border-gray-200 bg-white"
                  }`}
                  style={{ minHeight: 56 }}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-xl">{exp.badge}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">
                        {language === "zh" ? exp.titleZh : exp.titleEn}
                      </p>
                      <p className="text-xs text-gray-500">
                        {language === "zh"
                          ? exp.descriptionZh
                          : exp.descriptionEn}
                      </p>
                    </div>
                    {completed && (
                      <span className="text-lg">✅</span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          completed
                            ? "bg-green-500"
                            : "bg-blue-500"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-600">
                      {current}/{exp.goal}
                    </span>
                  </div>
                  {completed && (
                    <p className="mt-1 text-xs font-medium text-green-600">
                      🏅 {exp.reward}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ExpeditionNotification() {
  const notificationId = useAppStore((s) => s.expeditionNotification);
  const dismiss = useAppStore((s) => s.dismissExpeditionNotification);
  const language = useAppStore((s) => s.language);

  useEffect(() => {
    if (!notificationId) return;
    const t = setTimeout(dismiss, 3000);
    return () => clearTimeout(t);
  }, [notificationId, dismiss]);

  if (!notificationId) return null;

  const exp = expeditions.find((e) => e.id === notificationId);
  if (!exp) return null;

  return (
    <div className="pointer-events-auto fixed bottom-32 left-1/2 -translate-x-1/2">
      <div
        className="glass-card flex items-center gap-3 px-6 py-4"
        style={{ animation: "scaleFade 250ms ease-out" }}
      >
        <span className="text-3xl">{exp.badge}</span>
        <div>
          <p className="text-sm font-bold text-gray-800">
            {language === "zh" ? "探险完成！" : "Mission Complete!"}
          </p>
          <p className="text-xs text-gray-600">
            {language === "zh" ? exp.titleZh : exp.titleEn}
          </p>
          <p className="text-xs font-medium text-green-600">
            🏅 {exp.reward}
          </p>
        </div>
        <div className="expedition-confetti" />
      </div>
    </div>
  );
}
