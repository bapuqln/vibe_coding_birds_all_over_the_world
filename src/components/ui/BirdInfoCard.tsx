import { useEffect, useRef, useCallback, useMemo, useState } from "react";
import { useAppStore } from "../../store";
import birdsData from "../../data/birds.json";
import type { Bird, DietType, Language, Rarity, SizeCategory } from "../../types";
import { WingspanBar } from "./WingspanBar";
import { useNarration } from "../../hooks/useNarration";

const birds = birdsData as Bird[];
const birdMap = new Map(birds.map((b) => [b.id, b]));

const SP = { xs: 6, sm: 10, md: 16, lg: 24, xl: 32 } as const;

export function BirdInfoCard() {
  const selectedBirdId = useAppStore((s) => s.selectedBirdId);
  const language = useAppStore((s) => s.language);
  const audioStatus = useAppStore((s) => s.audioStatus);
  const setSelectedBird = useAppStore((s) => s.setSelectedBird);
  const collectBird = useAppStore((s) => s.collectBird);
  const collectedBirds = useAppStore((s) => s.collectedBirds);
  const markStoryBirdDiscovered = useAppStore((s) => s.markStoryBirdDiscovered);
  const setAudioStatus = useAppStore((s) => s.setAudioStatus);
  const discoverBird = useAppStore((s) => s.discoverBird);
  const setARViewerBird = useAppStore((s) => s.setARViewerBird);
  const capturePhoto = useAppStore((s) => s.capturePhoto);
  const updateMissionProgress = useAppStore((s) => s.updateMissionProgress);
  const checkAchievements = useAppStore((s) => s.checkAchievements);
  const incrementListenCount = useAppStore((s) => s.incrementListenCount);

  const cardRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [showSparkle, setShowSparkle] = useState(false);
  const { state: narrationState, narrationText, speak: speakNarration, stop: stopNarration, isAvailable: narrationAvailable } = useNarration();
  const [showNarrationText, setShowNarrationText] = useState(false);

  const bird = useMemo(
    () => (selectedBirdId ? birdMap.get(selectedBirdId) ?? null : null),
    [selectedBirdId],
  );

  const isOpen = bird !== null;
  const isCollected = useMemo(
    () => collectedBirds.some((b) => b.birdId === selectedBirdId),
    [collectedBirds, selectedBirdId],
  );

  useEffect(() => {
    if (isOpen && selectedBirdId && bird) {
      discoverBird(selectedBirdId);
      updateMissionProgress("discover_count");
      updateMissionProgress("find_region", bird.region);
      setTimeout(() => checkAchievements(), 100);
      previousFocusRef.current = document.activeElement as HTMLElement;
      requestAnimationFrame(() => closeButtonRef.current?.focus());
    } else {
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
        previousFocusRef.current = null;
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
        setAudioStatus("idle");
      }
    }
  }, [isOpen, selectedBirdId, setAudioStatus, discoverBird, bird, updateMissionProgress, checkAchievements]);

  const handleClose = useCallback(() => {
    stopNarration();
    setShowNarrationText(false);
    setSelectedBird(null);
  }, [setSelectedBird, stopNarration]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, handleClose]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        handleClose();
      }
    },
    [handleClose],
  );

  const handleCollect = useCallback(() => {
    if (!selectedBirdId || isCollected) return;
    collectBird(selectedBirdId);
    if (bird?.storyTheme) {
      markStoryBirdDiscovered(bird.storyTheme, selectedBirdId);
    }
    setShowSparkle(true);
    setTimeout(() => setShowSparkle(false), 1500);
  }, [selectedBirdId, isCollected, collectBird, bird, markStoryBirdDiscovered]);

  const handleListen = useCallback(() => {
    if (!bird) return;

    if (audioStatus === "playing" && audioRef.current) {
      audioRef.current.pause();
      setAudioStatus("idle");
      return;
    }

    setAudioStatus("loading");

    const query = bird.xenoCantoQuery;
    const proxyUrl = `https://xeno-canto.org/api/2/recordings?query=${encodeURIComponent(query)}&cnt=1`;

    fetch(proxyUrl)
      .then((res) => res.json())
      .then((data) => {
        const recording = data?.recordings?.[0];
        if (!recording?.file) throw new Error("No recording found");

        const audio = new Audio(recording.file);
        audioRef.current = audio;

        audio.addEventListener("canplaythrough", () => {
          setAudioStatus("playing");
          audio.play().catch(() => setAudioStatus("error"));
          incrementListenCount();
          updateMissionProgress("listen_sounds");
          setTimeout(() => checkAchievements(), 100);
        }, { once: true });

        audio.addEventListener("ended", () => {
          setAudioStatus("idle");
          audioRef.current = null;
        }, { once: true });

        audio.addEventListener("error", () => {
          setAudioStatus("error");
          audioRef.current = null;
        }, { once: true });

        audio.load();
      })
      .catch(() => {
        setAudioStatus("error");
        setTimeout(() => setAudioStatus("idle"), 2000);
      });
  }, [bird, audioStatus, setAudioStatus]);

  const funFact = bird
    ? language === "zh" ? bird.funFactZh : bird.funFactEn
    : "";

  return (
    <div
      className={`pointer-events-auto fixed inset-0 transition-opacity duration-250 ${
        isOpen ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      onClick={handleBackdropClick}
      aria-hidden={!isOpen}
    >
      {/* Desktop (>=1024px): right side panel. Tablet (768-1023): center modal. Mobile (<768): bottom sheet */}
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-label={bird ? `${bird.nameEn} - ${bird.nameZh}` : ""}
        className="bird-info-card glass-card"
        style={{
          position: "absolute",
          maxHeight: "80vh",
          overflowY: "auto",
          background: "var(--glass-bg-card)",
          backdropFilter: "blur(var(--glass-blur))",
          WebkitBackdropFilter: "blur(var(--glass-blur))",
          boxShadow: "var(--glass-shadow), 0 -2px 10px rgba(0, 0, 0, 0.06)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          transition: "transform 250ms ease-out, opacity 250ms ease-out",
        }}
      >
        {bird && (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {/* ImageHeader */}
            <div
              style={{ position: "relative", height: 180, width: "100%", overflow: "hidden", flexShrink: 0 }}
              className="bird-info-card-header bg-linear-to-br from-sky-300 via-teal-200 to-emerald-300"
            >
              <img
                src={bird.photoUrl}
                alt={bird.nameEn}
                loading="lazy"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.35), transparent)" }} />

              {bird.rarity && bird.rarity !== "common" && (
                <div style={{ position: "absolute", left: SP.md, top: SP.sm }}>
                  <RarityBadge rarity={bird.rarity} language={language} />
                </div>
              )}

              <button
                ref={closeButtonRef}
                onClick={handleClose}
                aria-label={language === "zh" ? "关闭" : "Close"}
                style={{
                  position: "absolute",
                  right: 12,
                  top: 12,
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "rgba(0,0,0,0.3)",
                  backdropFilter: "blur(4px)",
                  border: "none",
                  color: "white",
                  fontSize: 16,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "transform 0.15s",
                }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.transform = "scale(1.1)"; }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.transform = "scale(1)"; }}
              >
                ✕
              </button>
            </div>

            {/* TitleSection */}
            <div style={{ padding: `${SP.md}px ${SP.lg}px ${SP.xs}px` }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.2, color: "#111827", margin: 0, letterSpacing: "-0.01em" }}>
                {bird.nameZh}
              </h2>
              <p style={{ fontSize: 11, color: "#9ca3af", letterSpacing: "0.05em", margin: "2px 0 0", fontStyle: "italic" }}>
                {bird.pinyin}
              </p>
              <p style={{ fontSize: 16, fontWeight: 600, color: "#4b5563", margin: "2px 0 0" }}>
                {bird.nameEn}
              </p>
              {bird.scientificName && (
                <p style={{ fontSize: 12, color: "#9ca3af", margin: "2px 0 0", fontStyle: "italic" }}>
                  {bird.scientificName}
                </p>
              )}
            </div>

            {/* FunFact */}
            <div style={{ padding: `0 ${SP.lg}px`, marginTop: SP.sm }}>
              <div style={{
                borderRadius: 16,
                background: "rgba(255, 251, 235, 0.8)",
                padding: `${SP.sm}px ${SP.md}px`,
                border: "1px solid rgba(251, 191, 36, 0.25)",
              }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#b45309", margin: 0 }}>
                  {language === "zh" ? "🌟 你知道吗？" : "🌟 Did you know?"}
                </p>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: "#374151", margin: `${SP.xs}px 0 0` }}>
                  {funFact}
                </p>
              </div>
            </div>

            {/* TagRow */}
            <div style={{
              padding: `0 ${SP.lg}px`,
              marginTop: SP.md,
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
            }}>
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                borderRadius: 9999,
                background: "rgba(219, 234, 254, 0.8)",
                padding: "4px 12px",
                fontSize: 12,
                fontWeight: 600,
                color: "#1d4ed8",
                border: "1px solid rgba(59, 130, 246, 0.2)",
              }}>
                {REGION_EMOJI[bird.region] || "📍"}{" "}
                {language === "zh" ? regionNameZh(bird.region) : regionNameEn(bird.region)}
              </span>

              {bird.habitatType && (
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  borderRadius: 9999,
                  background: "rgba(220, 252, 231, 0.8)",
                  padding: "4px 12px",
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#15803d",
                  border: "1px solid rgba(34, 197, 94, 0.2)",
                }}>
                  🌿 {language === "zh" ? habitatNameZh(bird.habitatType) : bird.habitatType}
                </span>
              )}

              {bird.lifespan && (
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  borderRadius: 9999,
                  background: "rgba(255, 237, 213, 0.8)",
                  padding: "4px 12px",
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#c2410c",
                  border: "1px solid rgba(249, 115, 22, 0.2)",
                }}>
                  ⏳ {bird.lifespan}
                </span>
              )}
            </div>

            {/* InfoGrid */}
            <div style={{
              padding: `0 ${SP.lg}px`,
              marginTop: SP.md,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: SP.sm,
            }}>
              {bird.sizeCategory && (
                <div style={{
                  borderRadius: 14,
                  background: "rgba(224, 242, 254, 0.7)",
                  padding: SP.sm,
                  border: "1px solid rgba(56, 189, 248, 0.2)",
                }}>
                  <p style={{ fontSize: 10, fontWeight: 600, color: "#0369a1", margin: 0 }}>
                    {language === "zh" ? "📏 体型" : "📏 Size"}
                  </p>
                  <SizeBar category={bird.sizeCategory} language={language} />
                </div>
              )}
              {bird.dietType && (
                <div style={{
                  borderRadius: 14,
                  background: "rgba(220, 252, 231, 0.7)",
                  padding: SP.sm,
                  border: "1px solid rgba(34, 197, 94, 0.2)",
                }}>
                  <p style={{ fontSize: 10, fontWeight: 600, color: "#15803d", margin: 0 }}>
                    {language === "zh" ? "🍽️ 食性" : "🍽️ Diet"}
                  </p>
                  <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 16 }}>{DIET_EMOJI[bird.dietType]}</span>
                    <span style={{ fontSize: 12, color: "#166534" }}>
                      {language === "zh"
                        ? DIET_LABELS[bird.dietType].zh
                        : DIET_LABELS[bird.dietType].en}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Wingspan */}
            {bird.wingspanCm != null && bird.wingspanCm > 0 && (
              <div style={{ padding: `0 ${SP.lg}px`, marginTop: SP.sm }}>
                <div style={{
                  borderRadius: 14,
                  background: "rgba(237, 233, 254, 0.7)",
                  padding: SP.sm,
                  border: "1px solid rgba(139, 92, 246, 0.2)",
                }}>
                  <p style={{ fontSize: 10, fontWeight: 600, color: "#6d28d9", margin: 0 }}>
                    {language === "zh" ? "🦅 翼展" : "🦅 Wingspan"}
                  </p>
                  <WingspanBar
                    wingspanCm={bird.wingspanCm}
                    habitatType={bird.habitatType}
                    language={language}
                  />
                </div>
              </div>
            )}

            {/* ActionButtons */}
            <div style={{
              padding: `0 ${SP.lg}px`,
              marginTop: SP.lg,
              marginBottom: SP.lg,
              display: "flex",
              flexDirection: "column",
              gap: SP.sm,
            }}>
              <div style={{ display: "flex", gap: SP.sm }}>
                <button
                  type="button"
                  onClick={handleCollect}
                  disabled={isCollected}
                  style={{
                    position: "relative",
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    borderRadius: 9999,
                    padding: "12px 0",
                    fontSize: 14,
                    fontWeight: 700,
                    border: "none",
                    cursor: isCollected ? "default" : "pointer",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    background: isCollected
                      ? "linear-gradient(135deg, #dcfce7, #bbf7d0)"
                      : "linear-gradient(135deg, #f59e0b, #f97316)",
                    color: isCollected ? "#15803d" : "white",
                    boxShadow: isCollected
                      ? "0 2px 8px rgba(34, 197, 94, 0.2)"
                      : "0 4px 16px rgba(245, 158, 11, 0.3)",
                  }}
                  onMouseEnter={(e) => { if (!isCollected) (e.currentTarget as HTMLElement).style.transform = "scale(1.03)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
                >
                  {isCollected ? (
                    <>{language === "zh" ? "✓ 已收集" : "✓ Collected"}</>
                  ) : (
                    <>{language === "zh" ? "⭐ 收集" : "⭐ Collect"}</>
                  )}
                  {showSparkle && <CollectSparkle />}
                </button>

                <button
                  type="button"
                  onClick={handleListen}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    borderRadius: 9999,
                    padding: "12px 16px",
                    fontSize: 14,
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                    transition: "transform 0.2s, background 0.2s, box-shadow 0.2s",
                    background: audioStatus === "playing"
                      ? "linear-gradient(135deg, #0ea5e9, #0284c7)"
                      : "#e0f2fe",
                    color: audioStatus === "playing" ? "white" : "#0369a1",
                    boxShadow: audioStatus === "playing"
                      ? "0 4px 16px rgba(14, 165, 233, 0.3)"
                      : "0 2px 8px rgba(0, 0, 0, 0.08)",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1.03)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
                  aria-label={language === "zh" ? "播放声音" : "Listen"}
                >
                  {audioStatus === "loading" ? (
                    <span style={{
                      display: "inline-block",
                      width: 16,
                      height: 16,
                      border: "2px solid rgba(3,105,161,0.3)",
                      borderTopColor: "#0369a1",
                      borderRadius: "50%",
                      animation: "spin 0.6s linear infinite",
                    }} />
                  ) : audioStatus === "playing" ? (
                    <AudioBars />
                  ) : (
                    "🔊"
                  )}
                  <span>{language === "zh" ? "聆听" : "Listen"}</span>
                </button>
              </div>

              {/* Narration Button */}
              <button
                type="button"
                onClick={() => {
                  if (narrationState === "speaking") {
                    stopNarration();
                    setShowNarrationText(false);
                  } else if (bird) {
                    speakNarration(bird, language);
                    if (!narrationAvailable) {
                      setShowNarrationText(true);
                    }
                  }
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  borderRadius: 9999,
                  padding: "12px 0",
                  fontSize: 14,
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  background: narrationState === "speaking"
                    ? "linear-gradient(135deg, #10b981, #059669)"
                    : "linear-gradient(135deg, #14b8a6, #0d9488)",
                  color: "white",
                  boxShadow: narrationState === "speaking"
                    ? "0 4px 16px rgba(16, 185, 129, 0.4)"
                    : "0 4px 16px rgba(20, 184, 166, 0.3)",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1.03)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
                aria-label={language === "zh" ? "讲述这只鸟" : "Tell me about this bird"}
              >
                <span>{narrationState === "speaking" ? "⏹" : "🗣️"}</span>
                <span>
                  {narrationState === "speaking"
                    ? (language === "zh" ? "停止讲述" : "Stop narration")
                    : (language === "zh" ? "讲讲这只鸟" : "Tell me about this bird")}
                </span>
              </button>

              {/* Narration text fallback */}
              {showNarrationText && narrationText && (
                <div style={{
                  borderRadius: 14,
                  background: "rgba(240, 253, 250, 0.9)",
                  padding: `${SP.sm}px ${SP.md}px`,
                  border: "1px solid rgba(20, 184, 166, 0.2)",
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: "#134e4a",
                }}>
                  {narrationText}
                </div>
              )}

              <div style={{ display: "flex", gap: SP.sm }}>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedBirdId) {
                      setARViewerBird(selectedBirdId);
                    }
                  }}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    borderRadius: 9999,
                    padding: "12px 0",
                    fontSize: 14,
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
                    color: "white",
                    boxShadow: "0 4px 16px rgba(139, 92, 246, 0.3)",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1.03)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
                  aria-label={language === "zh" ? "AR查看" : "View in AR"}
                >
                  <span>📱</span>
                  <span>{language === "zh" ? "AR 查看" : "View in AR"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!bird) return;
                    const canvas = document.querySelector("canvas");
                    if (!canvas) return;
                    try {
                      const dataUrl = canvas.toDataURL("image/jpeg", 0.6);
                      capturePhoto(bird.id, bird.nameZh, bird.nameEn, dataUrl);
                      setTimeout(() => checkAchievements(), 100);
                    } catch {
                      /* canvas tainted or unavailable */
                    }
                  }}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    borderRadius: 9999,
                    padding: "12px 0",
                    fontSize: 14,
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
                    color: "white",
                    boxShadow: "0 4px 16px rgba(14, 165, 233, 0.3)",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1.03)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
                  aria-label={language === "zh" ? "拍照" : "Take Photo"}
                >
                  <span>📸</span>
                  <span>{language === "zh" ? "拍照" : "Photo"}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Desktop: right side panel */
        @media (min-width: 1024px) {
          .bird-info-card {
            right: var(--safe-area);
            top: var(--safe-area);
            bottom: var(--safe-area);
            width: 400px;
            max-width: 400px;
            border-radius: 20px;
            transform: ${isOpen ? "translateX(0)" : "translateX(120%)"};
            animation: ${isOpen ? "panelSlideRight var(--panel-duration) var(--panel-ease)" : "none"};
          }
          .bird-info-card-header {
            border-radius: 20px 20px 0 0;
          }
        }

        /* Tablet: center modal */
        @media (min-width: 768px) and (max-width: 1023px) {
          .bird-info-card {
            left: 50%;
            top: 50%;
            transform: ${isOpen ? "translate(-50%, -50%) scale(1)" : "translate(-50%, -50%) scale(0.95)"};
            width: 90%;
            max-width: 480px;
            border-radius: 20px;
            animation: ${isOpen ? "panelScaleFade var(--panel-duration) var(--panel-ease)" : "none"};
          }
          .bird-info-card-header {
            border-radius: 20px 20px 0 0;
          }
        }

        /* Mobile: bottom sheet */
        @media (max-width: 767px) {
          .bird-info-card {
            bottom: 0;
            left: 0;
            right: 0;
            width: 100%;
            max-width: 100%;
            border-radius: 20px 20px 0 0;
            transform: ${isOpen ? "translateY(0)" : "translateY(100%)"};
            animation: ${isOpen ? "panelSlideUp var(--panel-duration) var(--panel-ease)" : "none"};
          }
          .bird-info-card-header {
            border-radius: 20px 20px 0 0;
          }
        }
      `}</style>
    </div>
  );
}

function AudioBars() {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 2, height: 16 }}>
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            width: 3,
            borderRadius: 2,
            backgroundColor: "currentColor",
            animation: `audioBar 0.4s ease-in-out ${i * 0.1}s infinite alternate`,
          }}
        />
      ))}
      <style>{`
        @keyframes audioBar {
          from { height: 4px; }
          to { height: 14px; }
        }
      `}</style>
    </span>
  );
}

function CollectSparkle() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: 14, pointerEvents: "none" }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 6,
            height: 6,
            borderRadius: "50%",
            left: `${20 + Math.random() * 60}%`,
            top: `${20 + Math.random() * 60}%`,
            backgroundColor: ["#fbbf24", "#f59e0b", "#fcd34d", "#fde68a"][i % 4],
            animation: `sparkle ${0.5 + Math.random() * 0.5}s ease-out ${Math.random() * 0.3}s forwards`,
          }}
        />
      ))}
      <style>{`
        @keyframes sparkle {
          0% { transform: scale(0) rotate(0deg); opacity: 1; }
          100% { transform: scale(2) rotate(180deg) translateY(-20px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function RarityBadge({ rarity, language }: { rarity: Rarity; language: Language }) {
  const config: Record<Rarity, { label: string; labelZh: string; bg: string; icon: string }> = {
    common: { label: "Common", labelZh: "普通", bg: "rgba(107,114,128,0.7)", icon: "" },
    rare: { label: "Rare", labelZh: "稀有", bg: "rgba(59,130,246,0.8)", icon: "💎" },
    legendary: { label: "Legendary", labelZh: "传说", bg: "rgba(245,158,11,0.8)", icon: "👑" },
  };
  const c = config[rarity];
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      borderRadius: 9999,
      background: c.bg,
      padding: "4px 10px",
      fontSize: 10,
      fontWeight: 700,
      color: "white",
      backdropFilter: "blur(4px)",
    }}>
      {c.icon} {language === "zh" ? c.labelZh : c.label}
    </span>
  );
}

const REGION_EMOJI: Record<string, string> = {
  asia: "🏯",
  europe: "🏰",
  africa: "🌍",
  "north-america": "🗽",
  "south-america": "🌿",
  oceania: "🐨",
  antarctica: "🧊",
};

function regionNameZh(region: string): string {
  const map: Record<string, string> = {
    asia: "亚洲", europe: "欧洲", africa: "非洲",
    "north-america": "北美洲", "south-america": "南美洲",
    oceania: "大洋洲", antarctica: "南极洲",
  };
  return map[region] || region;
}

function regionNameEn(region: string): string {
  const map: Record<string, string> = {
    asia: "Asia", europe: "Europe", africa: "Africa",
    "north-america": "North America", "south-america": "South America",
    oceania: "Oceania", antarctica: "Antarctica",
  };
  return map[region] || region;
}

function habitatNameZh(habitat: string): string {
  const map: Record<string, string> = {
    rainforest: "热带雨林", wetlands: "湿地", coast: "海岸",
    grassland: "草原", forest: "森林", polar: "极地",
    mountains: "山地", desert: "沙漠", ocean: "海洋", tundra: "苔原",
  };
  return map[habitat] || habitat;
}

const DIET_EMOJI: Record<DietType, string> = {
  insects: "🐛", fish: "🐟", seeds: "🌾",
  fruit: "🍎", meat: "🥩", omnivore: "🍽️",
};

const DIET_LABELS: Record<DietType, { zh: string; en: string }> = {
  insects: { zh: "昆虫", en: "Insects" },
  fish: { zh: "鱼类", en: "Fish" },
  seeds: { zh: "种子", en: "Seeds" },
  fruit: { zh: "水果", en: "Fruit" },
  meat: { zh: "肉食", en: "Meat" },
  omnivore: { zh: "杂食", en: "Omnivore" },
};

const SIZE_LABELS: Record<SizeCategory, { zh: string; en: string; icon: string }> = {
  tiny: { zh: "微型", en: "Tiny", icon: "🐦" },
  small: { zh: "小型", en: "Small", icon: "🕊" },
  medium: { zh: "中型", en: "Medium", icon: "🦆" },
  large: { zh: "大型", en: "Large", icon: "🦅" },
};

function SizeBar({ category, language }: { category: SizeCategory; language: Language }) {
  const label = SIZE_LABELS[category];
  return (
    <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ fontSize: 16 }}>{label.icon}</span>
      <span style={{ fontSize: 12, color: "#075985" }}>
        {language === "zh" ? label.zh : label.en}
      </span>
    </div>
  );
}
