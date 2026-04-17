import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { ACESFilmicToneMapping } from "three";
import { GlobeScene } from "./components/three/GlobeScene";
import { BirdInfoCard } from "./components/ui/BirdInfoCard";
import { LangToggle } from "./components/ui/LangToggle";
import { AudioPlayer } from "./components/ui/AudioPlayer";
import { LoadingScreen } from "./components/ui/LoadingScreen";
import { MainModePanel } from "./components/ui/MainModePanel";
import { ScienceHUD } from "./components/ui/ScienceHUD";
import { MyBirdsPanel } from "./components/ui/MyBirdsPanel";
import { RegionFilterPanel } from "./components/ui/RegionFilterPanel";
import { QuestPanel } from "./components/ui/QuestPanel";
import { GuidedTour } from "./components/ui/GuidedTour";
import { BirdGuide } from "./components/ui/BirdGuide";
import { BirdRadar } from "./components/ui/BirdRadar";
import { StoryExplorer } from "./components/ui/StoryExplorer";
import { QuizPanel } from "./components/ui/QuizPanel";
import { SoundGuessPanel } from "./components/ui/SoundGuessPanel";
import { BirdEncyclopediaPanel } from "./components/ui/BirdEncyclopediaPanel";
import { ContinentBirdPanel } from "./components/ui/ContinentBirdPanel";
import { EvolutionTimeline } from "./components/ui/EvolutionTimeline";
import { TimeIndicator } from "./components/ui/TimeIndicator";
import { DiscoveryNotification } from "./components/ui/DiscoveryNotification";
import { DiscoveryProgressBar } from "./components/ui/DiscoveryProgressBar";
import { ARViewerModal } from "./components/ui/ARViewerModal";
import { BottomDiscoveryPanel } from "./components/ui/BottomDiscoveryPanel";
import { DailyMissionsPanel } from "./components/ui/DailyMissionsPanel";
import { PhotoGalleryPanel } from "./components/ui/PhotoGalleryPanel";
import { AchievementPanel, AchievementNotification } from "./components/ui/AchievementPanel";
import {
  ExpeditionPanel,
  ExpeditionNotification,
} from "./components/ui/ExpeditionPanel";
import { StoryModePanel } from "./components/ui/StoryModePanel";
import { ExpeditionProgressBar } from "./components/ui/ExpeditionProgressBar";
import { SharePanel } from "./components/ui/SharePanel";
import { ScreenshotFlash } from "./components/ui/ScreenshotFlash";
import { PerformanceMonitor } from "./components/ui/PerformanceMonitor";
import { BirdEntryPanel } from "./components/ui/BirdEntryPanel";
import { AIBirdGuidePanel } from "./components/ui/AIBirdGuidePanel";
import { TrackPanel, TrackNotification } from "./components/ui/TrackPanel";
import { BirdComparePanel } from "./components/ui/BirdComparePanel";
import { DiscoverMissionsPanel } from "./components/ui/DiscoverMissionsPanel";
import { PhotographerMode } from "./components/ui/PhotographerMode";
import { ClassroomPanel } from "./components/ui/ClassroomPanel";
import { SandboxToolbar } from "./components/ui/SandboxToolbar";
import { EcosystemPanel } from "./components/ui/EcosystemPanel";
import { MigrationJourneyPanel } from "./components/ui/MigrationJourneyPanel";
import { SeasonSelector } from "./components/ui/SeasonSelector";
import { TimelinePanel } from "./components/ui/TimelinePanel";
import { MigrationInfoCard } from "./components/ui/MigrationInfoCard";
import { ModeGate } from "./components/ui/ModeGate";
import { useAppStore } from "./store";

export default function App() {
  const birdCardOpen = useAppStore((s) => s.selectedBirdId) !== null;

  return (
    <div className="relative h-full w-full">
      {/* Layer 0 — Globe Canvas (always visible, ≥70% viewport) */}
      <div className="absolute inset-0" style={{ zIndex: "var(--z-globe)" }}>
        <Canvas
          shadows
          camera={{ fov: 45, position: [0, 0, 2.5], near: 0.1, far: 100 }}
          style={{ background: "#050a18" }}
          gl={{ toneMapping: ACESFilmicToneMapping, toneMappingExposure: 1.0 }}
        >
          <Suspense fallback={null}>
            <GlobeScene />
          </Suspense>
        </Canvas>
      </div>

      {/* Layer 2 — Sidebar Controls (mode-gated) */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          zIndex: "var(--z-sidebar)",
          opacity: birdCardOpen ? 0.4 : 1,
          transform: birdCardOpen ? "translateX(-10px)" : "translateX(0)",
          transition: "opacity 0.3s ease, transform 0.3s ease",
        }}
      >
        <AppTitle />
        <ModeGate modes={["explore", "learning"]}>
          <ScienceHUD />
        </ModeGate>
        <ModeGate modes={["explore", "migration"]}>
          <SeasonSelector />
        </ModeGate>
        <LangToggle />
        <ModeGate modes={["explore"]}>
          <DiscoveryProgressBar />
          <ExpeditionProgressBar />
        </ModeGate>
        <MainModePanel />
        <ModeGate modes={["explore"]}>
          <BirdGuide />
          <BirdRadar />
          <StoryExplorer />
          <QuizPanel />
          <SoundGuessPanel />
          <TimeIndicator />
        </ModeGate>
        <ModeGate modes={["learning"]}>
          <BirdEncyclopediaPanel />
          <EvolutionTimeline />
        </ModeGate>
      </div>

      {/* Layer 3 — Bottom Panels (mode-gated) */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{ zIndex: "var(--z-bottom-panel)" }}
      >
        <ModeGate modes={["explore"]}>
          <GuidedTour />
          <BottomDiscoveryPanel />
          <SandboxToolbar />
        </ModeGate>
        <ModeGate modes={["migration"]}>
          <TimelinePanel />
        </ModeGate>
      </div>

      {/* Layer 4 — Information Cards (mode-gated) */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{ zIndex: "var(--z-card)" }}
      >
        <ModeGate modes={["explore", "learning"]}>
          <BirdInfoCard />
          <BirdEntryPanel />
          <AIBirdGuidePanel />
        </ModeGate>
        <ModeGate modes={["explore"]}>
          <DiscoveryNotification />
          <ExpeditionNotification />
          <AchievementNotification />
          <TrackNotification />
        </ModeGate>
        <ModeGate modes={["migration"]}>
          <MigrationInfoCard />
        </ModeGate>
      </div>

      {/* Layer 5 — Modal Dialogs (mode-gated) */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{ zIndex: "var(--z-modal)" }}
      >
        <ModeGate modes={["explore"]}>
          <MyBirdsPanel />
          <RegionFilterPanel />
          <QuestPanel />
          <ContinentBirdPanel />
          <ARViewerModal />
          <DailyMissionsPanel />
          <PhotoGalleryPanel />
          <AchievementPanel />
          <ExpeditionPanel />
          <StoryModePanel />
          <SharePanel />
          <EcosystemPanel />
        </ModeGate>
        <ModeGate modes={["explore", "migration"]}>
          <MigrationJourneyPanel />
        </ModeGate>
        <ModeGate modes={["learning"]}>
          <ClassroomPanel />
          <TrackPanel />
          <BirdComparePanel />
          <DiscoverMissionsPanel />
        </ModeGate>
      </div>

      {/* Layer 6 — Full Screen Overlays (always visible) */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{ zIndex: "var(--z-overlay)" }}
      >
        <LoadingScreen />
        <ScreenshotFlash />
        <PerformanceMonitor />
        <PhotographerMode />
      </div>

      <AudioPlayer />
    </div>
  );
}

function AppTitle() {
  const setClassroom = useAppStore((s) => s.setClassroomModeActive);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePointerDown = () => {
    timerRef.current = setTimeout(() => setClassroom(true), 3000);
  };
  const handlePointerUp = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  return (
    <div
      className="pointer-events-auto fixed cursor-default select-none"
      style={{ left: "var(--safe-area)", top: "var(--safe-area)" }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <h1 className="text-xl font-bold tracking-wide text-white/90 drop-shadow-lg md:text-2xl">
        万羽拾音
      </h1>
      <p className="text-xs text-white/50 md:text-sm">Kids Bird Globe</p>
    </div>
  );
}
