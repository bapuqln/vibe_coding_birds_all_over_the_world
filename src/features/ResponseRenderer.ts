/**
 * Typing animation for guide text — ms per character by default.
 */
export function createTypingAnimation(text: string, speed = 24) {
  let index = 0;
  let complete = false;
  let running = false;
  let raf: number | null = null;
  let lastTs = 0;
  const msPerChar = Math.max(4, speed);

  function tick(ts: number) {
    if (!running) return;
    if (lastTs === 0) lastTs = ts;
    const elapsed = ts - lastTs;
    const chars = Math.floor(elapsed / msPerChar);
    if (chars > 0) {
      lastTs = ts;
      index = Math.min(text.length, index + chars);
      if (index >= text.length) {
        complete = true;
        running = false;
        raf = null;
        return;
      }
    }
    raf = requestAnimationFrame(tick);
  }

  return {
    getText: () => text.slice(0, index),
    isComplete: () => complete,
    start: () => {
      if (complete) return;
      running = true;
      lastTs = 0;
      if (raf == null) raf = requestAnimationFrame(tick);
    },
    stop: () => {
      running = false;
      if (raf != null) {
        cancelAnimationFrame(raf);
        raf = null;
      }
      index = text.length;
      complete = true;
    },
  };
}
