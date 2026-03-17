import { useEffect, useRef, useState, type ReactNode } from "react";

const DEFAULT_CHAR_MS = 30;

type ResponseRendererProps = {
  text: string;
  charDelayMs?: number;
  children: (displayedText: string, isTyping: boolean) => ReactNode;
};

/**
 * Drives character-by-character reveal for guide answers (V31).
 */
export function ResponseRenderer({
  text,
  charDelayMs = DEFAULT_CHAR_MS,
  children,
}: ResponseRendererProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!text) {
      setDisplayedText("");
      setIsTyping(false);
      return;
    }
    setIsTyping(true);
    setDisplayedText("");
    let idx = 0;
    const tick = () => {
      if (idx < text.length) {
        setDisplayedText(text.slice(0, idx + 1));
        idx++;
        timerRef.current = window.setTimeout(tick, charDelayMs);
      } else {
        setIsTyping(false);
      }
    };
    timerRef.current = window.setTimeout(tick, charDelayMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [text, charDelayMs]);

  return <>{children(displayedText, isTyping)}</>;
}
