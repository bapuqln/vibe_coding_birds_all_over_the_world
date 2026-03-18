import { useRef } from "react";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Globe } from "./Globe";
import { Starfield } from "./Starfield";

import { CloudLayer } from "./CloudLayer";
import { BirdMarker } from "./BirdMarker";
import { MigrationPaths } from "./MigrationPaths";
import { CameraController } from "./CameraController";
import birdsData from "../../data/birds.json";
import type { Bird } from "../../types";

const birds = birdsData as Bird[];

export function GlobeScene() {
  const controlsRef = useRef<OrbitControlsImpl>(null);

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 3, 5]} intensity={1.5} />
      <directionalLight position={[-3, -1, -3]} intensity={0.3} />
      <Starfield />
      <group>
        <Globe />
        <CloudLayer />
        {birds.map((bird, i) => (
          <BirdMarker key={bird.id} bird={bird} index={i} />
        ))}
        <MigrationPaths />
      </group>
      <CameraController controlsRef={controlsRef} />
      <OrbitControls
        ref={controlsRef}
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
