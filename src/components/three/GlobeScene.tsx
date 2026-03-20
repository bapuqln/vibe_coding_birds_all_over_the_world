import { Suspense, useRef, useEffect } from "react";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Globe } from "./Globe";
import { Starfield } from "./Starfield";
import { AtmosphereShell } from "./AtmosphereShell";
import { CloudLayer } from "./CloudLayer";
import { BirdMarker } from "./BirdMarker";
import { MigrationPaths } from "./MigrationPaths";
import { CountryBorders } from "./CountryBorders";
import { MapLabels } from "./MapLabels";
import { CameraController } from "./CameraController";
import { SoundRipple } from "./SoundRipple";
import { HabitatHighlight } from "./HabitatHighlight";
import { HeatmapLayer } from "./HeatmapLayer";
import { BirdParticles } from "./BirdParticles";
import birdsData from "../../data/birds.json";
import type { Bird } from "../../types";
import { useAppStore } from "../../store";

const birds = birdsData as Bird[];

export function GlobeScene() {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const migrationModeActive = useAppStore((s) => s.migrationModeActive);
  const setShowAllRoutes = useAppStore((s) => s.setShowAllRoutes);

  useEffect(() => {
    setShowAllRoutes(migrationModeActive);
  }, [migrationModeActive, setShowAllRoutes]);

  return (
    <>
      <ambientLight intensity={0.35} />
      <hemisphereLight args={["#c8e6ff", "#0a1628", 0.5]} />
      <directionalLight position={[5, 3, 5]} intensity={1.3} castShadow={false} />
      <directionalLight position={[-3, -1, -3]} intensity={0.25} />
      {/* Rim light for depth */}
      <directionalLight position={[-4, 2, -5]} intensity={0.4} color="#6ea8fe" />
      <Starfield />
      <AtmosphereShell />
      <group>
        <Globe />
        <CloudLayer />
        <CountryBorders />
        <Suspense fallback={null}>
          {birds.map((bird, i) => (
            <BirdMarker key={bird.id} bird={bird} index={i} />
          ))}
        </Suspense>
        <MigrationPaths />
        <SoundRipple />
        <HabitatHighlight />
        <HeatmapLayer />
        <BirdParticles />
      </group>
      <MapLabels />
      <CameraController controlsRef={controlsRef} />
      <OrbitControls
        ref={controlsRef}
        makeDefault
        target={[0, 0, 0]}
        enableDamping
        dampingFactor={0.08}
        minDistance={1.15}
        maxDistance={5}
        enablePan={false}
        rotateSpeed={0.5}
        zoomSpeed={0.8}
      />
    </>
  );
}
