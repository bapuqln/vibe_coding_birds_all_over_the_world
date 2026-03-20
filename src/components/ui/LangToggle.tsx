import { useAppStore } from "../../store";

export function LangToggle() {
  const language = useAppStore((s) => s.language);
  const toggleLanguage = useAppStore((s) => s.toggleLanguage);

  return (
    <button
      onClick={toggleLanguage}
      aria-label={language === "zh" ? "Switch to English" : "切换到中文"}
      className="pointer-events-auto fixed right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/65 text-sm font-bold text-white shadow-lg backdrop-blur-lg transition-all hover:scale-110 hover:bg-black/75 active:scale-95"
    >
      {language === "zh" ? "EN" : "中"}
    </button>
  );
}
