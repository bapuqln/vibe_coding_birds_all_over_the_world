import { useAppStore } from "../../store";
import { ActionButton } from "./ActionButton";
import birdsData from "../../data/birds.json";
import type { Bird } from "../../types";

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
