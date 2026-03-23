import { useState, useEffect, useRef } from "react";
import { useAppStore } from "../../store";
import { findAnswer, getQuestionPrompts } from "../../systems/AIGuideSystem";

export function AIBirdGuidePanel() {
  const open = useAppStore((s) => s.aiGuideOpen);
  const answer = useAppStore((s) => s.aiGuideAnswer);
  const setOpen = useAppStore((s) => s.setAiGuideOpen);
  const setQuestion = useAppStore((s) => s.setAiGuideQuestion);
  const setAnswer = useAppStore((s) => s.setAiGuideAnswer);
  const selectedBirdId = useAppStore((s) => s.selectedBirdId);
  const language = useAppStore((s) => s.language);

  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const timerRef = useRef<number | null>(null);

  const prompts = getQuestionPrompts(selectedBirdId, language);

  useEffect(() => {
    if (!answer) {
      setDisplayedText("");
      setIsTyping(false);
      return;
    }
    setIsTyping(true);
    setDisplayedText("");
    let idx = 0;
    const tick = () => {
      if (idx < answer.length) {
        setDisplayedText(answer.slice(0, idx + 1));
        idx++;
        timerRef.current = window.setTimeout(tick, 30);
      } else {
        setIsTyping(false);
      }
    };
    timerRef.current = window.setTimeout(tick, 30);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [answer]);

  const handleAsk = (q: string) => {
    setQuestion(q);
    const result = findAnswer(q, selectedBirdId ?? undefined, language);
    setAnswer(result);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      handleAsk(inputValue.trim());
      setInputValue("");
    }
  };

  const handleNarrate = () => {
    if (!answer || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(answer);
    utterance.rate = 0.9;
    utterance.lang = language === "zh" ? "zh-CN" : "en-US";
    window.speechSynthesis.speak(utterance);
  };

  if (!open) return null;

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
            onClick={() => { setOpen(false); setAnswer(null); setQuestion(null); }}
            className="text-white/60 hover:text-white"
          >
            ✕
          </button>
        </div>

        {displayedText && (
          <div className="mb-3 rounded-xl bg-white/10 p-3 text-sm leading-relaxed">
            {displayedText}
            {isTyping && <span className="animate-pulse">▌</span>}
            {!isTyping && answer && (
              <button
                onClick={handleNarrate}
                className="ml-2 inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-xs hover:bg-white/20"
              >
                🔊 {language === "zh" ? "朗读" : "Listen"}
              </button>
            )}
          </div>
        )}

        <div className="mb-2 flex flex-wrap gap-1.5">
          {prompts.map((p, i) => (
            <button
              key={i}
              onClick={() => handleAsk(p)}
              className="rounded-full bg-white/10 px-3 py-1 text-xs transition hover:bg-white/20"
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
            placeholder={language === "zh" ? "问我关于鸟类的问题..." : "Ask me about birds..."}
            className="flex-1 rounded-full bg-white/10 px-3 py-1.5 text-xs text-white placeholder-white/40 outline-none focus:bg-white/15"
          />
          <button
            type="submit"
            className="rounded-full bg-white/20 px-3 py-1.5 text-xs transition hover:bg-white/30"
          >
            {language === "zh" ? "问" : "Ask"}
          </button>
        </form>
      </div>
    </div>
  );
}
