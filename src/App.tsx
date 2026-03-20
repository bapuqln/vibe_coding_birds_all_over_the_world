import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { GlobeScene } from "./components/three/GlobeScene";
import { BirdInfoCard } from "./components/ui/BirdInfoCard";
import { LangToggle } from "./components/ui/LangToggle";
import { AudioPlayer } from "./components/ui/AudioPlayer";
import { LoadingScreen } from "./components/ui/LoadingScreen";
import { DiscoverButton } from "./components/ui/DiscoverButton";
import { QuizPanel } from "./components/ui/QuizPanel";
import { BirdEncyclopediaPanel } from "./components/ui/BirdEncyclopediaPanel";
import { ContinentBirdPanel } from "./components/ui/ContinentBirdPanel";
import { MigrationMapToggle } from "./components/ui/MigrationMapToggle";
import { EvolutionTimeline } from "./components/ui/EvolutionTimeline";
import { SoundGuessPanel } from "./components/ui/SoundGuessPanel";

export default function App() {
  return (
    <div className="relative h-full w-full">
      <Canvas
        camera={{ fov: 45, position: [0, 0, 2.5], near: 0.1, far: 100 }}
        style={{ background: "#050a18" }}
      >
        <Suspense fallback={null}>
          <GlobeScene />
        </Suspense>
      </Canvas>

      <LoadingScreen />
      <AppTitle />
      <LangToggle />
      <BirdInfoCard />
      <AudioPlayer />
      <DiscoverButton />
      <QuizPanel />
      <SoundGuessPanel />
      <MigrationMapToggle />
      <EvolutionTimeline />
      <BirdEncyclopediaPanel />
      <ContinentBirdPanel />
    </div>
  );
}

function AppTitle() {
  return (
    <div className="pointer-events-none fixed left-4 top-4 z-30 select-none md:left-6 md:top-6">
      <h1 className="text-xl font-bold tracking-wide text-white/90 drop-shadow-lg md:text-2xl">
        万羽拾音
      </h1>
      <p className="text-xs text-white/50 md:text-sm">Kids Bird Globe</p>
    </div>
  );
}
