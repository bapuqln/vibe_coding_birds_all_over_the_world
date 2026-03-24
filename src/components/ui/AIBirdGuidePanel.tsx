import { useState } from "react";
import { useAppStore } from "../../store";
import { getGuideAnswer, getQuestionPrompts } from "../../features/BirdGuideService";
import { ResponseRenderer } from "./ResponseRenderer";

export function AIBirdGuidePanel() {
  const open = useAppStore((s) => s.aiGuideOpen);
  const answer = useAppStore((s) => s.aiGuideAnswer);
  const setOpen = useAppStore((s) => s.setAiGuideOpen);
  const setQuestion = useAppStore((s) => s.setAiGuideQuestion);
  const setAnswer = useAppStore((s) => s.setAiGuideAnswer);
  const selectedBirdId = useAppStore((s) => s.selectedBirdId);
  const language = useAppStore((s) => s.language);

  const [inputValue, setInputValue] = useState("");
  const [ctaPressed, setCtaPressed] = useState(false);

  const prompts = getQuestionPrompts(selectedBirdId, language);

  const handleAsk = (q: string) => {
    setQuestion(q);
    const result = getGuideAnswer(q, selectedBirdId ?? undefined, language);
    setAnswer(result);
    setCtaPressed(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      handleAsk(inputValue.trim());
      setInputValue("");
    }
  };

  const handleNarrate = (text: string) => {
    if (!text || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.lang = language === "zh" ? "zh-CN" : "en-US";
    window.speechSynthesis.speak(utterance);
  };

  const handleClose = () => {
    setOpen(false);
    setAnswer(null);
    setQuestion(null);
    setCtaPressed(false);
  };

  if (!open) return null;

  const askLabel =
    language === "zh" ? "向鸟类向导提问" : "Ask the Bird Guide";

  return (
    <div
      className="pointer-events-auto fixed"
      style={{
        left: "var(--safe-area)",
        bottom: 100,
        maxWidth: 360,
        zIndex: "var(--z-card)",
      }}
    >
      <div className="glass-panel p-4 text-white">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="text-2xl"
              style={{ animation: "guideFloat 2s ease-in-out infinite" }}
            >
              🦉
            </span>
            <span className="text-sm font-bold">
              {language === "zh" ? "鸟类向导" : "Bird Guide"}
            </span>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-white/60 hover:text-white"
            aria-label={language === "zh" ? "关闭" : "Close"}
          >
            ✕
          </button>
        </div>

        <button
          type="button"
          onClick={() => setCtaPressed(true)}
          className="mb-3 w-full rounded-2xl border border-amber-400/40 bg-linear-to-r from-amber-500/30 to-orange-500/25 py-3 text-sm font-bold text-white shadow-lg transition hover:from-amber-500/40 hover:to-orange-500/35"
          style={{ minHeight: 56 }}
        >
          ✨ {askLabel}
        </button>

        {(answer || ctaPressed) && (
          <ResponseRenderer text={answer ?? ""}>
            {(displayedText, isTyping) =>
              displayedText ? (
                <div className="mb-3 rounded-xl bg-white/10 p-3 text-sm leading-relaxed">
                  {displayedText}
                  {isTyping && <span className="animate-pulse">▌</span>}
                  {!isTyping && answer && (
                    <button
                      type="button"
                      onClick={() => handleNarrate(answer)}
                      className="ml-2 inline-flex min-h-[44px] items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs hover:bg-white/20"
                    >
                      🔊 {language === "zh" ? "朗读" : "Listen"}
                    </button>
                  )}
                </div>
              ) : null
            }
          </ResponseRenderer>
        )}

        <div className="mb-2 flex flex-wrap gap-1.5">
          {prompts.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleAsk(p)}
              className="rounded-full bg-white/10 px-3 py-1 text-xs transition hover:bg-white/20"
              style={{ minHeight: 36 }}
            >
              {p}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={
              language === "zh" ? "问我关于鸟类的问题..." : "Ask me about birds..."
            }
            className="min-h-[44px] flex-1 rounded-full bg-white/10 px-3 py-1.5 text-xs text-white placeholder-white/40 outline-none focus:bg-white/15"
          />
          <button
            type="submit"
            className="min-h-[44px] shrink-0 rounded-full bg-white/20 px-4 text-xs font-semibold transition hover:bg-white/30"
          >
            {language === "zh" ? "问" : "Ask"}
          </button>
        </form>
      </div>
    </div>
  );
}
