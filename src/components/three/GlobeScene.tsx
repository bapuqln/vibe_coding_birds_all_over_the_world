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
import { useEffect } from "react";

const birds = birdsData as Bird[];

const SUN_ROTATION_SPEED = 0.02;

function SunLight() {
  const lightRef = useRef<DirectionalLight>(null);
  const angleRef = useRef(0);

  useFrame((_, delta) => {
    if (!lightRef.current) return;
    angleRef.current += delta * SUN_ROTATION_SPEED;
    lightRef.current.position.set(
      Math.cos(angleRef.current) * 5,
      1.5,
      Math.sin(angleRef.current) * 5,
    );
  });

  return (
    <directionalLight
      ref={lightRef}
      position={[5, 1.5, 0]}
      intensity={1.6}
      castShadow={false}
      color="#fff5e6"
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
