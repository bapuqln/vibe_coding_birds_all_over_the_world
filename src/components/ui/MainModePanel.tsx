import { useState } from "react";
import { useAppStore } from "../../store";
import type { AppMode } from "../../types";
import birdsData from "../../data/birds.json";
import type { Bird, HabitatFilterType } from "../../types";

const birds = birdsData as Bird[];

const MODES: { id: AppMode; icon: string; labelZh: string; labelEn: string }[] = [
  { id: "explore", icon: "🔭", labelZh: "探索", labelEn: "Explore" },
  { id: "migration", icon: "✈️", labelZh: "迁徙", labelEn: "Migration" },
  { id: "learning", icon: "📖", labelZh: "学习", labelEn: "Learning" },
];

const HABITAT_FILTERS: { id: HabitatFilterType; zh: string; en: string }[] = [
  { id: "forest", zh: "森林", en: "Forest" },
  { id: "wetlands", zh: "湿地", en: "Wetlands" },
  { id: "ocean", zh: "海洋", en: "Ocean" },
  { id: "grassland", zh: "草原", en: "Grassland" },
  { id: "mountain", zh: "山地", en: "Mountain" },
  { id: "urban", zh: "城市", en: "Urban" },
];

function pickRandomBird(excludeId: string | null): Bird {
  const candidates = excludeId ? birds.filter((b) => b.id !== excludeId) : birds;
  return candidates[Math.floor(Math.random() * candidates.length)] ?? birds[0];
}

export function MainModePanel() {
  const language = useAppStore((s) => s.language);
  const appMode = useAppStore((s) => s.appMode);
  const setAppMode = useAppStore((s) => s.setAppMode);
  const selectedBirdId = useAppStore((s) => s.selectedBirdId);
  const setSelectedBird = useAppStore((s) => s.setSelectedBird);
  const setActiveRegion = useAppStore((s) => s.setActiveRegion);
  const setMigrationModeActive = useAppStore((s) => s.setMigrationModeActive);
  const migrationModeActive = useAppStore((s) => s.migrationModeActive);
  const setRegionFilterOpen = useAppStore((s) => s.setRegionFilterOpen);
  const regionFilterOpen = useAppStore((s) => s.regionFilterOpen);
  const heatmapVisible = useAppStore((s) => s.heatmapVisible);
  const setHeatmapVisible = useAppStore((s) => s.setHeatmapVisible);
  const weatherVisible = useAppStore((s) => s.weatherVisible);
  const setWeatherVisible = useAppStore((s) => s.setWeatherVisible);
  const activeHabitatFilters = useAppStore((s) => s.activeHabitatFilters);
  const toggleHabitatFilter = useAppStore((s) => s.toggleHabitatFilter);
  const clearHabitatFilters = useAppStore((s) => s.clearHabitatFilters);
  const setEncyclopediaOpen = useAppStore((s) => s.setEncyclopediaOpen);
  const encyclopediaOpen = useAppStore((s) => s.encyclopediaOpen);
  const compareMode = useAppStore((s) => s.compareMode);
  const setCompareMode = useAppStore((s) => s.setCompareMode);
  const setEvolutionTimelineOpen = useAppStore((s) => s.setEvolutionTimelineOpen);
  const evolutionTimelineOpen = useAppStore((s) => s.evolutionTimelineOpen);
  const missionsPanelOpen = useAppStore((s) => s.missionsPanelOpen);
  const setMissionsPanelOpen = useAppStore((s) => s.setMissionsPanelOpen);
  const dailyMissions = useAppStore((s) => s.dailyMissions);
  const soundRecognitionActive = useAppStore((s) => s.soundRecognitionActive);
  const setSoundRecognitionActive = useAppStore((s) => s.setSoundRecognitionActive);
  const setSoundRecognitionResult = useAppStore((s) => s.setSoundRecognitionResult);
  const setSoundRecognitionConfidence = useAppStore((s) => s.setSoundRecognitionConfidence);
  const addScreenshot = useAppStore((s) => s.addScreenshot);
  const setScreenshotFlash = useAppStore((s) => s.setScreenshotFlash);
  const sharePanelOpen = useAppStore((s) => s.sharePanelOpen);
  const setSharePanelOpen = useAppStore((s) => s.setSharePanelOpen);
  const migrationSpeed = useAppStore((s) => s.migrationSpeed);
  const setMigrationSpeed = useAppStore((s) => s.setMigrationSpeed);
  const ecosystemPanelOpen = useAppStore((s) => s.ecosystemPanelOpen);
  const setEcosystemPanelOpen = useAppStore((s) => s.setEcosystemPanelOpen);
  const setActivePanel = useAppStore((s) => s.setActivePanel);
  const questsOpen = useAppStore((s) => s.questsOpen);
  const setQuestsOpen = useAppStore((s) => s.setQuestsOpen);
  const journeyPanelOpen = useAppStore((s) => s.journeyPanelOpen);
  const setJourneyPanelOpen = useAppStore((s) => s.setJourneyPanelOpen);

  const [habitatExpanded, setHabitatExpanded] = useState(false);

  const toggleJourneyPanel = () => {
    const next = !journeyPanelOpen;
    setJourneyPanelOpen(next);
    setActivePanel(next ? "journeyPanel" : null);
  };

  const toggleEcosystemPanel = () => {
    const next = !ecosystemPanelOpen;
    setEcosystemPanelOpen(next);
    setActivePanel(next ? "ecosystemPanel" : null);
  };

  const handleDiscover = () => {
    const bird = pickRandomBird(selectedBirdId);
    setSelectedBird(bird.id);
  };

  const handleReset = () => {
    setSelectedBird(null);
    setActiveRegion(null);
    setMigrationModeActive(false);
  };

  const handleScreenshot = () => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    addScreenshot(dataUrl);
    setScreenshotFlash(true);
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `bird-globe-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSoundRecognition = async () => {
    if (soundRecognitionActive) return;
    const { isRecordingSupported, startRecording, stopAndAnalyze } = await import("../../systems/SoundRecognitionSystem");
    if (!isRecordingSupported()) return;
    setSoundRecognitionActive(true);
    try {
      await startRecording();
      setTimeout(async () => {
        const result = await stopAndAnalyze();
        setSoundRecognitionResult(result.birdId);
        setSoundRecognitionConfidence(result.confidence);
        setSoundRecognitionActive(false);
        if (result.confidence > 0.3) {
          setSelectedBird(result.birdId);
        }
      }, 3000);
    } catch {
      setSoundRecognitionActive(false);
    }
  };

  const incompleteMissions = dailyMissions.filter((m) => !m.completed).length;

  return (
    <div
      className="pointer-events-auto fixed"
      style={{
        right: 20,
        bottom: 20,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 10,
        maxHeight: "calc(100vh - 40px)",
        overflowY: "auto",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        paddingRight: "env(safe-area-inset-right, 0px)",
      }}
    >
      {/* Mode Selector */}
      <div
        style={{
          display: "flex",
          gap: 4,
          padding: 4,
          borderRadius: 24,
          background: "rgba(0, 10, 30, 0.7)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(100, 180, 255, 0.15)",
          boxShadow: "0 4px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
        }}
      >
        {MODES.map((mode) => {
          const active = appMode === mode.id;
          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => setAppMode(mode.id)}
              aria-label={language === "zh" ? mode.labelZh : mode.labelEn}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "8px 14px",
                borderRadius: 20,
                border: "none",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                background: active
                  ? "linear-gradient(135deg, rgba(56, 189, 248, 0.9), rgba(59, 130, 246, 0.9))"
                  : "transparent",
                color: active ? "white" : "rgba(255, 255, 255, 0.55)",
                boxShadow: active
                  ? "0 2px 12px rgba(56, 189, 248, 0.4), 0 0 20px rgba(56, 189, 248, 0.15)"
                  : "none",
              }}
            >
              <span style={{ fontSize: 14 }}>{mode.icon}</span>
              <span>{language === "zh" ? mode.labelZh : mode.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* Context Tools */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          padding: 8,
          borderRadius: 16,
          background: "rgba(0, 10, 30, 0.65)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(100, 180, 255, 0.12)",
          boxShadow: "0 4px 24px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.04)",
          minWidth: 160,
          width: 180,
        }}
      >
        {appMode === "explore" && (
          <>
            <ModeToolButton
              icon="🎲"
              label={language === "zh" ? "发现" : "Discover"}
              onClick={handleDiscover}
            />
            <ModeToolButton
              icon="🗺️"
              label={language === "zh" ? "迁徙旅程" : "Journeys"}
              active={journeyPanelOpen}
              onClick={toggleJourneyPanel}
            />
            <ModeToolButton
              icon="🌿"
              label={language === "zh" ? "栖息地" : "Habitats"}
              active={habitatExpanded || activeHabitatFilters.length > 0}
              badge={activeHabitatFilters.length || undefined}
              onClick={() => setHabitatExpanded(!habitatExpanded)}
            />
            {habitatExpanded && (
              <div style={{ display: "flex", flexDirection: "column", gap: 3, paddingLeft: 8 }}>
                {HABITAT_FILTERS.map((h) => {
                  const on = activeHabitatFilters.includes(h.id);
                  return (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => toggleHabitatFilter(h.id)}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 12,
                        border: "none",
                        cursor: "pointer",
                        fontSize: 11,
                        fontWeight: 600,
                        textAlign: "left",
                        background: on ? "rgba(56, 189, 248, 0.3)" : "rgba(255, 255, 255, 0.06)",
                        color: on ? "#7dd3fc" : "rgba(255, 255, 255, 0.6)",
                        transition: "all 0.2s",
                      }}
                    >
                      {language === "zh" ? h.zh : h.en}
                    </button>
                  );
                })}
                {activeHabitatFilters.length > 0 && (
                  <button
                    type="button"
                    onClick={() => clearHabitatFilters()}
                    style={{
                      padding: "4px 10px",
                      borderRadius: 12,
                      border: "none",
                      cursor: "pointer",
                      fontSize: 10,
                      fontWeight: 600,
                      background: "transparent",
                      color: "rgba(255, 255, 255, 0.4)",
                      textDecoration: "underline",
                    }}
                  >
                    {language === "zh" ? "清除" : "Clear"}
                  </button>
                )}
              </div>
            )}
            <ModeToolButton
              icon="🌍"
              label={language === "zh" ? "区域" : "Regions"}
              active={regionFilterOpen}
              onClick={() => setRegionFilterOpen(!regionFilterOpen)}
            />
            <ModeToolButton
              icon="🗺️"
              label={language === "zh" ? "分布" : "Heatmap"}
              active={heatmapVisible}
              onClick={() => setHeatmapVisible(!heatmapVisible)}
            />
            <ModeToolButton
              icon="🌦️"
              label={language === "zh" ? "天气" : "Weather"}
              active={weatherVisible}
              onClick={() => setWeatherVisible(!weatherVisible)}
            />
            <ModeToolButton
              icon="🌍"
              label={language === "zh" ? "生态" : "Ecosystem"}
              active={ecosystemPanelOpen}
              onClick={toggleEcosystemPanel}
            />
            <ModeToolButton
              icon="📋"
              label={language === "zh" ? "任务" : "Missions"}
              active={missionsPanelOpen}
              badge={incompleteMissions || undefined}
              onClick={() => setMissionsPanelOpen(!missionsPanelOpen)}
            />
            <ModeToolButton
              icon="🎯"
              label={language === "zh" ? "探索" : "Quests"}
              active={questsOpen}
              onClick={() => setQuestsOpen(!questsOpen)}
            />
          </>
        )}

        {appMode === "migration" && (
          <>
            <ModeToolButton
              icon="✈️"
              label={language === "zh" ? "迁徙路线" : "Routes"}
              active={migrationModeActive}
              onClick={() => setMigrationModeActive(!migrationModeActive)}
            />
            {migrationModeActive && (
              <ModeToolButton
                icon="⏩"
                label={`${migrationSpeed}x`}
                onClick={() => setMigrationSpeed(migrationSpeed >= 5 ? 1 : migrationSpeed === 1 ? 2 : 5)}
              />
            )}
            <ModeToolButton
              icon="🗺️"
              label={language === "zh" ? "迁徙旅程" : "Journeys"}
              active={journeyPanelOpen}
              onClick={toggleJourneyPanel}
            />
            <ModeToolButton
              icon="🎤"
              label={soundRecognitionActive
                ? (language === "zh" ? "录音中..." : "Listening...")
                : (language === "zh" ? "识音" : "Sound ID")}
              active={soundRecognitionActive}
              onClick={handleSoundRecognition}
            />
          </>
        )}

        {appMode === "learning" && (
          <>
            <ModeToolButton
              icon="📚"
              label={language === "zh" ? "百科" : "Encyclopedia"}
              active={encyclopediaOpen}
              onClick={() => setEncyclopediaOpen(!encyclopediaOpen)}
            />
            <ModeToolButton
              icon="⚖️"
              label={language === "zh" ? "对比" : "Compare"}
              active={compareMode}
              onClick={() => setCompareMode(!compareMode)}
            />
            <ModeToolButton
              icon="🕰️"
              label={language === "zh" ? "进化" : "Timeline"}
              active={evolutionTimelineOpen}
              onClick={() => setEvolutionTimelineOpen(!evolutionTimelineOpen)}
            />
            <ModeToolButton
              icon="🎲"
              label={language === "zh" ? "发现" : "Discover"}
              onClick={handleDiscover}
            />
          </>
        )}
      </div>

      {/* Utility Actions — always visible */}
      <div
        style={{
          display: "flex",
          gap: 6,
          width: 180,
          justifyContent: "flex-end",
        }}
      >
        <UtilityButton icon="📸" label={language === "zh" ? "截图" : "Shot"} onClick={handleScreenshot} />
        <UtilityButton
          icon="📤"
          label={language === "zh" ? "分享" : "Share"}
          active={sharePanelOpen}
          onClick={() => setSharePanelOpen(!sharePanelOpen)}
        />
        <UtilityButton icon="🔄" label={language === "zh" ? "重置" : "Reset"} onClick={handleReset} />
      </div>
    </div>
  );
}

interface ModeToolButtonProps {
  icon: string;
  label: string;
  active?: boolean;
  badge?: number;
  onClick: () => void;
}

function ModeToolButton({ icon, label, active = false, badge, onClick }: ModeToolButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 12px",
        height: 40,
        borderRadius: 12,
        border: active
          ? "1px solid rgba(56, 189, 248, 0.35)"
          : "1px solid transparent",
        cursor: "pointer",
        fontSize: 12,
        fontWeight: 600,
        background: active
          ? "rgba(56, 189, 248, 0.15)"
          : "rgba(255, 255, 255, 0.04)",
        color: active ? "#7dd3fc" : "rgba(255, 255, 255, 0.7)",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        textAlign: "left",
        width: "100%",
      }}
    >
      <span style={{ fontSize: 14, lineHeight: 1, flexShrink: 0 }}>{icon}</span>
      <span style={{ whiteSpace: "nowrap" }}>{label}</span>
      {badge !== undefined && badge > 0 && (
        <span
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 18,
            minWidth: 18,
            padding: "0 4px",
            borderRadius: 9999,
            background: "rgba(239, 68, 68, 0.8)",
            fontSize: 9,
            fontWeight: 700,
            color: "white",
          }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

interface UtilityButtonProps {
  icon: string;
  label: string;
  active?: boolean;
  onClick: () => void;
}

function UtilityButton({ icon, label, active = false, onClick }: UtilityButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: "6px 12px",
        borderRadius: 14,
        border: "1px solid rgba(100, 180, 255, 0.1)",
        cursor: "pointer",
        fontSize: 11,
        fontWeight: 600,
        background: active
          ? "rgba(56, 189, 248, 0.2)"
          : "rgba(0, 10, 30, 0.6)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        color: active ? "#7dd3fc" : "rgba(255, 255, 255, 0.55)",
        transition: "all 0.2s",
      }}
    >
      <span style={{ fontSize: 12 }}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}
