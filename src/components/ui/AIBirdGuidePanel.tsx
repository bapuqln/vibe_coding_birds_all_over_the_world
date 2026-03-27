import { useState } from "react";
import { useAppStore } from "../../store";
import { getGuideAnswer, getQuestionPrompts } from "../../features/BirdGuideService";
import { ResponseRenderer } from "./ResponseRenderer";

const SOURCE_BADGES: Record<string, { label: string; labelZh: string; icon: string }> = {
  static: { label: "Local", labelZh: "本地", icon: "\uD83D\uDCDA" },
  cache: { label: "Cached", labelZh: "缓存", icon: "\uD83D\uDCBE" },
  ai: { label: "AI", labelZh: "AI", icon: "\uD83E\uDD16" },
};

export function AIBirdGuidePanel() {
  const open = useAppStore((s) => s.aiGuideOpen);
  const answer = useAppStore((s) => s.aiGuideAnswer);
  const setOpen = useAppStore((s) => s.setAiGuideOpen);
  const setQuestion = useAppStore((s) => s.setAiGuideQuestion);
  const setAnswer = useAppStore((s) => s.setAiGuideAnswer);
  const selectedBirdId = useAppStore((s) => s.selectedBirdId);
  const language = useAppStore((s) => s.language);

  const birdExplanation = useAppStore((s) => s.birdExplanation);
  const birdExplanationLoading = useAppStore((s) => s.birdExplanationLoading);
  const clearBirdExplanation = useAppStore((s) => s.clearBirdExplanation);
  const speakExplanation = useAppStore((s) => s.speakExplanation);
  const stopSpeaking = useAppStore((s) => s.stopSpeaking);
  const ttsStatus = useAppStore((s) => s.ttsStatus);

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

  const handleNarrate = () => {
    if (ttsStatus === "speaking") {
      stopSpeaking();
    } else {
      speakExplanation();
    }
  };

  const handleClose = () => {
    setOpen(false);
    setAnswer(null);
    setQuestion(null);
    setCtaPressed(false);
    clearBirdExplanation();
    stopSpeaking();
  };

  if (!open) return null;

  const explanationText = birdExplanation
    ? (language === "zh" ? birdExplanation.textZh : birdExplanation.text)
    : null;

  const sourceBadge = birdExplanation ? SOURCE_BADGES[birdExplanation.source] : null;

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
              {"\uD83E\uDD89"}
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
            {"\u2715"}
          </button>
        </div>

        {/* V33: AI-generated bird explanation */}
        {(birdExplanationLoading || explanationText) && (
          <div className="mb-3">
            {birdExplanationLoading && !explanationText && (
              <div className="flex items-center gap-2 rounded-xl bg-white/10 p-3 text-sm">
                <span
                  className="inline-block h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                  style={{ animation: "spin 0.6s linear infinite" }}
                />
                <span className="text-white/70">
                  {language === "zh" ? "正在生成解说..." : "Generating explanation..."}
                </span>
              </div>
            )}

            {explanationText && (
              <ResponseRenderer text={explanationText}>
                {(displayedText, isTyping) =>
                  displayedText ? (
                    <div className="rounded-xl bg-white/10 p-3 text-sm leading-relaxed">
                      {displayedText}
                      {isTyping && <span className="animate-pulse">{"\u258C"}</span>}
                      {!isTyping && (
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (ttsStatus === "speaking") {
                                stopSpeaking();
                              } else {
                                speakExplanation();
                              }
                            }}
                            className="inline-flex min-h-[44px] items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs hover:bg-white/20"
                          >
                            {ttsStatus === "speaking" ? "\u23F9" : "\uD83D\uDD0A"}{" "}
                            {ttsStatus === "speaking"
                              ? (language === "zh" ? "停止" : "Stop")
                              : (language === "zh" ? "朗读" : "Listen")}
                          </button>
                          {sourceBadge && (
                            <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-white/40">
                              {sourceBadge.icon} {language === "zh" ? sourceBadge.labelZh : sourceBadge.label}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ) : null
                }
              </ResponseRenderer>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={() => setCtaPressed(true)}
          className="mb-3 w-full rounded-2xl border border-amber-400/40 bg-linear-to-r from-amber-500/30 to-orange-500/25 py-3 text-sm font-bold text-white shadow-lg transition hover:from-amber-500/40 hover:to-orange-500/35"
          style={{ minHeight: 56 }}
        >
          {"\u2728"} {askLabel}
        </button>

        {(answer || ctaPressed) && (
          <ResponseRenderer text={answer ?? ""}>
            {(displayedText, isTyping) =>
              displayedText ? (
                <div className="mb-3 rounded-xl bg-white/10 p-3 text-sm leading-relaxed">
                  {displayedText}
                  {isTyping && <span className="animate-pulse">{"\u258C"}</span>}
                  {!isTyping && answer && (
                    <button
                      type="button"
                      onClick={handleNarrate}
                      className="ml-2 inline-flex min-h-[44px] items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs hover:bg-white/20"
                    >
                      {ttsStatus === "speaking" ? "\u23F9" : "\uD83D\uDD0A"}{" "}
                      {ttsStatus === "speaking"
                        ? (language === "zh" ? "停止" : "Stop")
                        : (language === "zh" ? "朗读" : "Listen")}
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
