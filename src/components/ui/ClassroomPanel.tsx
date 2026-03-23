import { useAppStore } from "../../store";
import { getAllLessons, getLessonStep, getLessonStepCount } from "../../systems/ClassroomSystem";

export function ClassroomPanel() {
  const active = useAppStore((s) => s.classroomModeActive);
  const setActive = useAppStore((s) => s.setClassroomModeActive);
  const presentation = useAppStore((s) => s.presentationMode);
  const setPresentation = useAppStore((s) => s.setPresentationMode);
  const activeLessonId = useAppStore((s) => s.activeLessonId);
  const setActiveLessonId = useAppStore((s) => s.setActiveLessonId);
  const stepIndex = useAppStore((s) => s.lessonStepIndex);
  const nextStep = useAppStore((s) => s.nextLessonStep);
  const language = useAppStore((s) => s.language);

  const lessons = getAllLessons();

  if (!active) return null;

  const currentStep = activeLessonId ? getLessonStep(activeLessonId, stepIndex) : null;
  const totalSteps = activeLessonId ? getLessonStepCount(activeLessonId) : 0;
  const currentLesson = lessons.find((l) => l.id === activeLessonId);

  return (
    <div
      className="pointer-events-auto fixed"
      style={{
        right: "var(--safe-area)",
        top: "var(--safe-area)",
        maxWidth: 400,
        maxHeight: "80vh",
        overflowY: "auto",
        zIndex: "var(--z-modal)",
      }}
    >
      <div className="glass-panel p-4 text-white">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎓</span>
            <span className="text-sm font-bold">
              {language === "zh" ? "课堂模式" : "Classroom Mode"}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPresentation(!presentation)}
              className="rounded-full bg-white/10 px-3 py-1 text-xs hover:bg-white/20"
            >
              {presentation
                ? (language === "zh" ? "退出演示" : "Exit Present")
                : (language === "zh" ? "演示模式" : "Present")}
            </button>
            <button
              onClick={() => { setActive(false); setActiveLessonId(null); }}
              className="text-white/60 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>

        {!activeLessonId ? (
          <div className="space-y-2">
            <p className="mb-2 text-xs text-white/60">
              {language === "zh" ? "选择一个课程开始教学" : "Select a lesson to begin teaching"}
            </p>
            {lessons.map((lesson) => (
              <button
                key={lesson.id}
                onClick={() => setActiveLessonId(lesson.id)}
                className="w-full rounded-xl bg-white/10 p-3 text-left transition hover:bg-white/20"
              >
                <div className="text-sm font-bold">
                  {language === "zh" ? lesson.titleZh : lesson.titleEn}
                </div>
                <div className="mt-1 text-xs text-white/60">
                  {language === "zh" ? lesson.descriptionZh : lesson.descriptionEn}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold">
                {language === "zh" ? currentLesson?.titleZh : currentLesson?.titleEn}
              </span>
              <span className="text-xs text-white/60">
                {stepIndex + 1} / {totalSteps}
              </span>
            </div>

            {/* Progress dots */}
            <div className="mb-3 flex gap-1">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full ${
                    i <= stepIndex ? "bg-blue-400" : "bg-white/20"
                  }`}
                />
              ))}
            </div>

            {currentStep && (
              <div className="mb-3 rounded-xl bg-white/10 p-3">
                <p className="text-sm leading-relaxed">
                  {language === "zh" ? currentStep.narrationZh : currentStep.narrationEn}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="rounded bg-white/10 px-2 py-0.5 text-xs">
                    {currentStep.action}
                  </span>
                  {currentStep.target && (
                    <span className="text-xs text-white/60">{currentStep.target}</span>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setActiveLessonId(null)}
                className="flex-1 rounded-full bg-white/10 py-2 text-xs hover:bg-white/20"
              >
                {language === "zh" ? "返回" : "Back"}
              </button>
              {stepIndex < totalSteps - 1 ? (
                <button
                  onClick={nextStep}
                  className="flex-1 rounded-full bg-blue-500/40 py-2 text-xs font-bold hover:bg-blue-500/60"
                >
                  {language === "zh" ? "下一步" : "Next"}
                </button>
              ) : (
                <button
                  onClick={() => setActiveLessonId(null)}
                  className="flex-1 rounded-full bg-green-500/40 py-2 text-xs font-bold hover:bg-green-500/60"
                >
                  {language === "zh" ? "完成" : "Done"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
