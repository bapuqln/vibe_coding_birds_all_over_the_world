import { useState } from "react";
import { useAppStore } from "../../store";
import { ActionButton } from "./ActionButton";
import birdsData from "../../data/birds.json";
import type { Bird, HabitatFilterType } from "../../types";

const HABITAT_FILTERS: { id: HabitatFilterType; zh: string; en: string }[] = [
  { id: "forest", zh: "森林", en: "Forest" },
  { id: "wetlands", zh: "湿地", en: "Wetlands" },
  { id: "ocean", zh: "海洋", en: "Ocean" },
  { id: "grassland", zh: "草原", en: "Grassland" },
  { id: "mountain", zh: "山地", en: "Mountain" },
  { id: "urban", zh: "城市", en: "Urban" },
];

const birds = birdsData as Bird[];

function pickRandomBird(excludeId: string | null): Bird {
  const candidates = excludeId ? birds.filter((b) => b.id !== excludeId) : birds;
  return candidates[Math.floor(Math.random() * candidates.length)] ?? birds[0];
}

export function RightControlPanel() {
  const language = useAppStore((s) => s.language);
  const selectedBirdId = useAppStore((s) => s.selectedBirdId);
  const setSelectedBird = useAppStore((s) => s.setSelectedBird);
  const collectedBirds = useAppStore((s) => s.collectedBirds);
  const setCollectionOpen = useAppStore((s) => s.setCollectionOpen);
  const isCollectionOpen = useAppStore((s) => s.isCollectionOpen);
  const setRegionFilterOpen = useAppStore((s) => s.setRegionFilterOpen);
  const regionFilterOpen = useAppStore((s) => s.regionFilterOpen);
  const migrationModeActive = useAppStore((s) => s.migrationModeActive);
  const setMigrationModeActive = useAppStore((s) => s.setMigrationModeActive);
  const setQuestsOpen = useAppStore((s) => s.setQuestsOpen);
  const questsOpen = useAppStore((s) => s.questsOpen);
  const startTour = useAppStore((s) => s.startTour);
  const tourState = useAppStore((s) => s.tourState);
  const setActiveRegion = useAppStore((s) => s.setActiveRegion);
  const heatmapVisible = useAppStore((s) => s.heatmapVisible);
  const setHeatmapVisible = useAppStore((s) => s.setHeatmapVisible);
  const weatherVisible = useAppStore((s) => s.weatherVisible);
  const setWeatherVisible = useAppStore((s) => s.setWeatherVisible);
  const missionsPanelOpen = useAppStore((s) => s.missionsPanelOpen);
  const setMissionsPanelOpen = useAppStore((s) => s.setMissionsPanelOpen);
  const photoGalleryOpen = useAppStore((s) => s.photoGalleryOpen);
  const setPhotoGalleryOpen = useAppStore((s) => s.setPhotoGalleryOpen);
  const birdPhotos = useAppStore((s) => s.birdPhotos);
  const achievementPanelOpen = useAppStore((s) => s.achievementPanelOpen);
  const setAchievementPanelOpen = useAppStore((s) => s.setAchievementPanelOpen);
  const expeditionPanelOpen = useAppStore((s) => s.expeditionPanelOpen);
  const setExpeditionPanelOpen = useAppStore((s) => s.setExpeditionPanelOpen);
  const storyModeActive = useAppStore((s) => s.storyModeActive);
  const setStoryModeActive = useAppStore((s) => s.setStoryModeActive);
  const setActivePanel = useAppStore((s) => s.setActivePanel);
  const dailyMissions = useAppStore((s) => s.dailyMissions);
  const sharePanelOpen = useAppStore((s) => s.sharePanelOpen);
  const setSharePanelOpen = useAppStore((s) => s.setSharePanelOpen);
  const addScreenshot = useAppStore((s) => s.addScreenshot);
  const setScreenshotFlash = useAppStore((s) => s.setScreenshotFlash);
  const aiGuideOpen = useAppStore((s) => s.aiGuideOpen);
  const setAiGuideOpen = useAppStore((s) => s.setAiGuideOpen);
  const photographerActive = useAppStore((s) => s.photographerModeActive);
  const setPhotographerActive = useAppStore((s) => s.setPhotographerModeActive);
  const sandboxActive = useAppStore((s) => s.sandboxModeActive);
  const setSandboxActive = useAppStore((s) => s.setSandboxModeActive);
  const migrationSpeed = useAppStore((s) => s.migrationSpeed);
  const setMigrationSpeed = useAppStore((s) => s.setMigrationSpeed);
  const learningTracksOpen = useAppStore((s) => s.learningTracksOpen);
  const setLearningTracksOpen = useAppStore((s) => s.setLearningTracksOpen);
  const activeHabitatFilters = useAppStore((s) => s.activeHabitatFilters);
  const toggleHabitatFilter = useAppStore((s) => s.toggleHabitatFilter);
  const clearHabitatFilters = useAppStore((s) => s.clearHabitatFilters);

  const compareMode = useAppStore(
    (s) => (s as typeof s & { compareMode: boolean }).compareMode ?? false,
  );
  const setCompareMode = useAppStore(
    (s) => (s as typeof s & { setCompareMode: (m: boolean) => void }).setCompareMode,
  );
  const discoveryMissionsPanelOpen = useAppStore(
    (s) => (s as typeof s & { discoveryMissionsPanelOpen: boolean }).discoveryMissionsPanelOpen ?? false,
  );
  const setDiscoveryMissionsPanelOpen = useAppStore(
    (s) => (s as typeof s & { setDiscoveryMissionsPanelOpen: (o: boolean) => void }).setDiscoveryMissionsPanelOpen,
  );

  const ecosystemPanelOpen = useAppStore((s) => s.ecosystemPanelOpen);
  const setEcosystemPanelOpen = useAppStore((s) => s.setEcosystemPanelOpen);
  const soundRecognitionActive = useAppStore((s) => s.soundRecognitionActive);
  const setSoundRecognitionActive = useAppStore((s) => s.setSoundRecognitionActive);
  const setSoundRecognitionResult = useAppStore((s) => s.setSoundRecognitionResult);
  const setSoundRecognitionConfidence = useAppStore((s) => s.setSoundRecognitionConfidence);

  const [habitatSectionOpen, setHabitatSectionOpen] = useState(false);

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

  const incompleteMissions = dailyMissions.filter((m) => !m.completed).length;

  return (
    <div
      className="pointer-events-auto fixed"
      style={{
        right: "var(--safe-area)",
        bottom: "var(--safe-area)",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 8,
        maxHeight: "calc(100vh - 40px)",
        overflowY: "auto",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        paddingRight: "env(safe-area-inset-right, 0px)",
      }}
    >
      <ActionButton
        onClick={handleDiscover}
        icon="🎲"
        ariaLabel={language === "zh" ? "随机发现" : "Discover"}
      >
        {language === "zh" ? "发现" : "Discover"}
      </ActionButton>

      <ActionButton
        onClick={() => setMissionsPanelOpen(!missionsPanelOpen)}
        active={missionsPanelOpen}
        icon="📋"
        badge={incompleteMissions || undefined}
        ariaLabel={language === "zh" ? "每日任务" : "Missions"}
      >
        {language === "zh" ? "任务" : "Missions"}
      </ActionButton>

      <ActionButton
        onClick={() => setCollectionOpen(!isCollectionOpen)}
        active={isCollectionOpen}
        icon="🐦"
        badge={collectedBirds.length || undefined}
        ariaLabel={language === "zh" ? "我的鸟类" : "My Birds"}
      >
        {language === "zh" ? "鸟类" : "Birds"}
      </ActionButton>

      <ActionButton
        onClick={() => setPhotoGalleryOpen(!photoGalleryOpen)}
        active={photoGalleryOpen}
        icon="📷"
        badge={birdPhotos.length || undefined}
        ariaLabel={language === "zh" ? "照片" : "Photos"}
      >
        {language === "zh" ? "照片" : "Photos"}
      </ActionButton>

      <ActionButton
        onClick={() => setAchievementPanelOpen(!achievementPanelOpen)}
        active={achievementPanelOpen}
        icon="🏅"
        ariaLabel={language === "zh" ? "徽章" : "Badges"}
      >
        {language === "zh" ? "徽章" : "Badges"}
      </ActionButton>

      <ActionButton
        onClick={() => {
          const next = !expeditionPanelOpen;
          setExpeditionPanelOpen(next);
          setActivePanel(next ? "expeditions" : null);
        }}
        active={expeditionPanelOpen}
        icon="🎒"
        ariaLabel={language === "zh" ? "探险" : "Expeditions"}
      >
        {language === "zh" ? "探险" : "Expeditions"}
      </ActionButton>

      <ActionButton
        onClick={() => {
          const next = !learningTracksOpen;
          setLearningTracksOpen(next);
          setActivePanel(next ? "learningTracks" : null);
        }}
        active={learningTracksOpen}
        icon="📚"
        ariaLabel={language === "zh" ? "学习路线" : "Learning Tracks"}
      >
        {language === "zh" ? "路线" : "Tracks"}
      </ActionButton>

      <ActionButton
        onClick={() => {
          const next = !compareMode;
          setCompareMode(next);
        }}
        active={compareMode}
        icon="⚖️"
        ariaLabel={language === "zh" ? "鸟类对比" : "Compare Birds"}
      >
        {language === "zh" ? "对比" : "Compare"}
      </ActionButton>

      <ActionButton
        onClick={() => {
          const next = !discoveryMissionsPanelOpen;
          setDiscoveryMissionsPanelOpen(next);
          setActivePanel(next ? "discoverMissions" : null);
        }}
        active={discoveryMissionsPanelOpen}
        icon="🎯"
        ariaLabel={language === "zh" ? "发现任务" : "Discover Missions"}
      >
        {language === "zh" ? "发现" : "Discover"}
      </ActionButton>

      <ActionButton
        onClick={() => setHabitatSectionOpen(!habitatSectionOpen)}
        active={habitatSectionOpen || activeHabitatFilters.length > 0}
        icon="🌿"
        badge={activeHabitatFilters.length || undefined}
        ariaLabel={language === "zh" ? "栖息地筛选" : "Habitat filter"}
      >
        {language === "zh" ? "栖息地" : "Habitat"}
      </ActionButton>

      {habitatSectionOpen && (
        <div
          className="glass-button flex flex-col gap-2 p-2"
          style={{
            width: 120,
            borderRadius: 16,
            background: "rgba(255,255,255,0.12)",
            backdropFilter: "blur(16px)",
          }}
        >
          {HABITAT_FILTERS.map((h) => {
            const on = activeHabitatFilters.includes(h.id);
            return (
              <button
                key={h.id}
                type="button"
                onClick={() => toggleHabitatFilter(h.id)}
                className="rounded-xl px-2 text-left text-xs font-semibold transition"
                style={{
                  minHeight: 44,
                  background: on ? "rgba(245, 158, 11, 0.35)" : "rgba(0,0,0,0.15)",
                  color: "white",
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
              className="rounded-xl px-2 py-2 text-center text-[10px] font-bold text-white/80 underline"
              style={{ minHeight: 40 }}
            >
              {language === "zh" ? "清除全部" : "Clear all"}
            </button>
          )}
        </div>
      )}

      <ActionButton
        onClick={() => setStoryModeActive(!storyModeActive)}
        active={storyModeActive}
        icon="🎬"
        ariaLabel={language === "zh" ? "冒险故事" : "Stories"}
      >
        {language === "zh" ? "冒险" : "Stories"}
      </ActionButton>

      <ActionButton
        onClick={() => setRegionFilterOpen(!regionFilterOpen)}
        active={regionFilterOpen}
        icon="🌍"
        ariaLabel={language === "zh" ? "区域筛选" : "Regions"}
      >
        {language === "zh" ? "区域" : "Regions"}
      </ActionButton>

      <ActionButton
        onClick={() => setMigrationModeActive(!migrationModeActive)}
        active={migrationModeActive}
        icon="✈️"
        ariaLabel={language === "zh" ? "迁徙模式" : "Migration"}
      >
        {language === "zh" ? "迁徙" : "Migration"}
      </ActionButton>

      <ActionButton
        onClick={() => setHeatmapVisible(!heatmapVisible)}
        active={heatmapVisible}
        icon="🗺️"
        ariaLabel={language === "zh" ? "鸟类分布" : "Heatmap"}
      >
        {language === "zh" ? "分布" : "Heatmap"}
      </ActionButton>

      <ActionButton
        onClick={() => setWeatherVisible(!weatherVisible)}
        active={weatherVisible}
        icon="🌦️"
        ariaLabel={language === "zh" ? "天气" : "Weather"}
      >
        {language === "zh" ? "天气" : "Weather"}
      </ActionButton>

      <ActionButton
        onClick={handleScreenshot}
        icon="📸"
        ariaLabel={language === "zh" ? "截图" : "Screenshot"}
      >
        {language === "zh" ? "截图" : "Screenshot"}
      </ActionButton>

      <ActionButton
        onClick={() => setSharePanelOpen(!sharePanelOpen)}
        active={sharePanelOpen}
        icon="📤"
        ariaLabel={language === "zh" ? "分享" : "Share"}
      >
        {language === "zh" ? "分享" : "Share"}
      </ActionButton>

      <ActionButton
        onClick={() => setQuestsOpen(!questsOpen)}
        active={questsOpen}
        icon="🎯"
        ariaLabel={language === "zh" ? "探索任务" : "Quests"}
      >
        {language === "zh" ? "探索" : "Quests"}
      </ActionButton>

      <ActionButton
        onClick={() => tourState === "idle" ? startTour() : undefined}
        active={tourState !== "idle"}
        icon="🧭"
        ariaLabel={language === "zh" ? "导览" : "Tour"}
      >
        {language === "zh" ? "导览" : "Tour"}
      </ActionButton>

      <ActionButton
        onClick={() => setAiGuideOpen(!aiGuideOpen)}
        active={aiGuideOpen}
        icon="🦉"
        ariaLabel={language === "zh" ? "鸟类向导" : "Bird Guide AI"}
      >
        {language === "zh" ? "向导" : "Guide"}
      </ActionButton>

      <ActionButton
        onClick={() => setPhotographerActive(!photographerActive)}
        active={photographerActive}
        icon="📸"
        ariaLabel={language === "zh" ? "摄影师" : "Photographer"}
      >
        {language === "zh" ? "摄影" : "Photo Game"}
      </ActionButton>

      <ActionButton
        onClick={() => setSandboxActive(!sandboxActive)}
        active={sandboxActive}
        icon="🧪"
        ariaLabel={language === "zh" ? "沙盒" : "Sandbox"}
      >
        {language === "zh" ? "沙盒" : "Sandbox"}
      </ActionButton>

      <ActionButton
        onClick={() => {
          const next = !ecosystemPanelOpen;
          setEcosystemPanelOpen(next);
          setActivePanel(next ? "ecosystemPanel" : null);
        }}
        active={ecosystemPanelOpen}
        icon="🌍"
        ariaLabel={language === "zh" ? "生态模拟" : "Ecosystem"}
      >
        {language === "zh" ? "生态" : "Ecosystem"}
      </ActionButton>

      <ActionButton
        onClick={async () => {
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
        }}
        active={soundRecognitionActive}
        icon="🎤"
        ariaLabel={language === "zh" ? "识别鸟声" : "Identify Bird Sound"}
      >
        {soundRecognitionActive
          ? (language === "zh" ? "录音中..." : "Listening...")
          : (language === "zh" ? "识音" : "Sound ID")}
      </ActionButton>

      {migrationModeActive && (
        <ActionButton
          onClick={() => setMigrationSpeed(migrationSpeed >= 5 ? 1 : migrationSpeed === 1 ? 2 : 5)}
          icon="⏩"
          ariaLabel={language === "zh" ? "迁徙速度" : "Migration Speed"}
        >
          {migrationSpeed}x
        </ActionButton>
      )}

      <ActionButton
        onClick={handleReset}
        icon="🔄"
        ariaLabel={language === "zh" ? "重置" : "Reset"}
      >
        {language === "zh" ? "重置" : "Reset"}
      </ActionButton>
    </div>
  );
}
