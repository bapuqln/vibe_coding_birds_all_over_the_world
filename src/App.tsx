import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
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
import { DiscoveryNotification } from "./components/ui/DiscoveryNotification";
import { DiscoveryProgressBar } from "./components/ui/DiscoveryProgressBar";

export default function App() {
  return (
    <div className="relative h-full w-full">
      {/* 3D Canvas — z-index: 0 */}
      <Canvas
        camera={{ fov: 45, position: [0, 0, 2.5], near: 0.1, far: 100 }}
        style={{ background: "#050a18" }}
      >
        <Suspense fallback={null}>
          <GlobeScene />
        </Suspense>
      </Canvas>

      {/* Loading — z-index: 100 */}
      <LoadingScreen />

      {/* HUD layer — z-index: 10 */}
      <AppTitle />
      <LangToggle />
      <DiscoveryProgressBar />
      <RightControlPanel />
      <BirdGuide />
      <BirdRadar />
      <StoryExplorer />

      {/* Notification layer — z-index: 25 */}
      <DiscoveryNotification />

      {/* Modal layer — z-index: 20 */}
      <BirdInfoCard />
      <MyBirdsPanel />
      <RegionFilterPanel />
      <QuestPanel />
      <GuidedTour />
      <QuizPanel />
      <SoundGuessPanel />
      <BirdEncyclopediaPanel />
      <ContinentBirdPanel />
      <EvolutionTimeline />

      {/* Invisible */}
      <AudioPlayer />
    </div>
  );
}

function AppTitle() {
  return (
    <div className="pointer-events-none fixed left-4 top-4 z-10 select-none md:left-6 md:top-6">
      <h1 className="text-xl font-bold tracking-wide text-white/90 drop-shadow-lg md:text-2xl">
        万羽拾音
      </h1>
      <p className="text-xs text-white/50 md:text-sm">Kids Bird Globe</p>
    </div>
  );
}
