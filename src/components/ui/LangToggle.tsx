import { useAppStore } from "../../store";

export function LangToggle() {
  const language = useAppStore((s) => s.language);
  const toggleLanguage = useAppStore((s) => s.toggleLanguage);

  return (
    <button
      onClick={toggleLanguage}
      aria-label={language === "zh" ? "Switch to English" : "切换到中文"}
      className="pointer-events-auto fixed right-4 top-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-sm font-bold text-white shadow-lg backdrop-blur-md transition-all hover:scale-110 hover:bg-white/30 active:scale-95"
    >
      {language === "zh" ? (
        <span>EN</span>
      ) : (
        <span>中</span>
      )}
    </button>
  );
}
