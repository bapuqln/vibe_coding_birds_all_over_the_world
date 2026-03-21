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
  const missionsPanelOpen = useAppStore((s) => s.missionsPanelOpen);
  const setMissionsPanelOpen = useAppStore((s) => s.setMissionsPanelOpen);
  const photoGalleryOpen = useAppStore((s) => s.photoGalleryOpen);
  const setPhotoGalleryOpen = useAppStore((s) => s.setPhotoGalleryOpen);
  const birdPhotos = useAppStore((s) => s.birdPhotos);
  const achievementPanelOpen = useAppStore((s) => s.achievementPanelOpen);
  const setAchievementPanelOpen = useAppStore((s) => s.setAchievementPanelOpen);
  const dailyMissions = useAppStore((s) => s.dailyMissions);

  const handleDiscover = () => {
    const bird = pickRandomBird(selectedBirdId);
    setSelectedBird(bird.id);
  };

  const handleReset = () => {
    setSelectedBird(null);
    setActiveRegion(null);
    setMigrationModeActive(false);
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
        onClick={handleReset}
        icon="🔄"
        ariaLabel={language === "zh" ? "重置" : "Reset"}
      >
        {language === "zh" ? "重置" : "Reset"}
      </ActionButton>
    </div>
  );
}
