import { Suspense, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { DirectionalLight } from "three";
import { Globe } from "./Globe";
import { Starfield } from "./Starfield";
import { AtmosphereShell } from "./AtmosphereShell";
import { CloudLayer } from "./CloudLayer";
import { BirdMarker } from "./BirdMarker";
import { InstancedBirdMarkers } from "./InstancedBirdMarkers";
import { MigrationPaths } from "./MigrationPaths";
import { CountryBorders } from "./CountryBorders";
import { MapLabels } from "./MapLabels";
import { CameraController } from "./CameraController";
import { SoundRipple } from "./SoundRipple";
import { HabitatHighlight } from "./HabitatHighlight";
import { HeatmapLayer } from "./HeatmapLayer";
import { BirdParticles } from "./BirdParticles";
import { WeatherEffects } from "./WeatherEffects";
import { RegionClusters } from "./RegionCluster";
import { FlockRenderer } from "./FlockRenderer";
import { BiomeEffects } from "./BiomeEffects";
import { JourneyRoute } from "./JourneyRoute";
import { AnimationScheduler } from "../../core/AnimationScheduler";
import { MigrationPathRenderer } from "../../render/MigrationPathRenderer";
import { MigrationFlockRenderer } from "../../render/MigrationFlockRenderer";
import { SeasonOverlay } from "../../render/SeasonOverlay";
import birdsData from "../../data/birds.json";
import type { Bird } from "../../types";
import { useAppStore } from "../../store";
import { useEffect } from "react";
import { useEngine } from "../../core/Engine";

function EngineHost() {
  useEngine();
  return null;
}

const birds = birdsData as Bird[];

function SunLight() {
  const lightRef = useRef<DirectionalLight>(null);
  const angleRef = useRef(0);
  const setTimeOfDay = useAppStore((s) => s.setTimeOfDay);

  useFrame((_, delta) => {
    if (!lightRef.current) return;
    angleRef.current += delta * 0.03;
    lightRef.current.position.set(
      Math.cos(angleRef.current) * 5,
      1.5,
      Math.sin(angleRef.current) * 5,
    );

    const normalized = ((angleRef.current % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const fraction = normalized / (Math.PI * 2);
    let tod: "dawn" | "morning" | "afternoon" | "dusk" | "night";
    if (fraction < 0.1) tod = "dawn";
    else if (fraction < 0.35) tod = "morning";
    else if (fraction < 0.55) tod = "afternoon";
    else if (fraction < 0.65) tod = "dusk";
    else tod = "night";
    setTimeOfDay(tod);
  });

  return (
    <directionalLight
      ref={lightRef}
      position={[5, 1.5, 0]}
      intensity={1.6}
      castShadow
      color="#fff5e6"
      shadow-mapSize={[512, 512]}
      shadow-bias={-0.001}
      shadow-camera-near={0.5}
      shadow-camera-far={15}
      shadow-camera-left={-2}
      shadow-camera-right={2}
      shadow-camera-top={2}
      shadow-camera-bottom={-2}
    />
  );
}

export function GlobeScene() {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const migrationModeActive = useAppStore((s) => s.migrationModeActive);
  const setShowAllRoutes = useAppStore((s) => s.setShowAllRoutes);

  useEffect(() => {
    setShowAllRoutes(migrationModeActive);
  }, [migrationModeActive, setShowAllRoutes]);

  return (
    <>
      <EngineHost />
      <AnimationScheduler />
      <ambientLight intensity={0.2} />
      <hemisphereLight args={["#c8e6ff", "#0a1628", 0.3]} />
      <SunLight />
      <directionalLight position={[-3, -1, -3]} intensity={0.15} />
      <directionalLight position={[-4, 2, -5]} intensity={0.3} color="#6ea8fe" />
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
        <InstancedBirdMarkers />
        <MigrationPaths />
        <SoundRipple />
        <HabitatHighlight />
        <HeatmapLayer />
        <BirdParticles />
        <WeatherEffects />
        <RegionClusters />
        <FlockRenderer />
        <BiomeEffects />
        <JourneyRoute />
        <SeasonOverlay />
        <MigrationPathRenderer />
        <MigrationFlockRenderer />
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
