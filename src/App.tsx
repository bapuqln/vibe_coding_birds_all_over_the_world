import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { ACESFilmicToneMapping } from "three";
import { GlobeScene } from "./components/three/GlobeScene";
import { BirdInfoCard } from "./components/ui/BirdInfoCard";
import { LangToggle } from "./components/ui/LangToggle";
import { AudioPlayer } from "./components/ui/AudioPlayer";
import { LoadingScreen } from "./components/ui/LoadingScreen";
import { RightControlPanel } from "./components/ui/RightControlPanel";
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
import { PhotographerMode } from "./components/ui/PhotographerMode";
import { ClassroomPanel } from "./components/ui/ClassroomPanel";
import { SandboxToolbar } from "./components/ui/SandboxToolbar";
import { useAppStore } from "./store";

export default function App() {
  const birdCardOpen = useAppStore((s) => s.selectedBirdId) !== null;

  return (
    <div className="relative h-full w-full">
      {/* Layer 0 — Globe Canvas */}
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

      {/* Layer 2 — Sidebar Controls (dims when bird card open) */}
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
        <LangToggle />
        <DiscoveryProgressBar />
        <ExpeditionProgressBar />
        <RightControlPanel />
        <BirdGuide />
        <BirdRadar />
        <StoryExplorer />
        <BirdEncyclopediaPanel />
        <QuizPanel />
        <SoundGuessPanel />
        <EvolutionTimeline />
        <TimeIndicator />
      </div>

      {/* Layer 3 — Bottom Panels */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{ zIndex: "var(--z-bottom-panel)" }}
      >
        <GuidedTour />
        <BottomDiscoveryPanel />
        <SandboxToolbar />
      </div>

      {/* Layer 4 — Information Cards */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{ zIndex: "var(--z-card)" }}
      >
        <BirdInfoCard />
        <DiscoveryNotification />
        <ExpeditionNotification />
        <AchievementNotification />
        <BirdEntryPanel />
        <AIBirdGuidePanel />
      </div>

      {/* Layer 5 — Modal Dialogs */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{ zIndex: "var(--z-modal)" }}
      >
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
        <ClassroomPanel />
      </div>

      {/* Layer 6 — Full Screen Overlays */}
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
  const timerRef = { current: null as ReturnType<typeof setTimeout> | null };

  const handlePointerDown = () => {
    timerRef.current = setTimeout(() => setClassroom(true), 3000);
  };
  const handlePointerUp = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
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
