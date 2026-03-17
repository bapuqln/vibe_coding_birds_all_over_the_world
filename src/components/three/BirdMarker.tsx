import { useRef, useMemo, useCallback, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshPhongMaterial, type Mesh } from "three";
import type { Bird } from "../../types";
import { latLngToVector3 } from "../../utils/coordinates";
import { useAppStore } from "../../store";

const MARKER_RADIUS = 1.02;

interface BirdMarkerProps {
  bird: Bird;
  index: number;
}

export function BirdMarker({ bird, index }: BirdMarkerProps) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const setSelectedBird = useAppStore((s) => s.setSelectedBird);
  const phaseOffset = index * 1.3;

  const position = useMemo(
    () => latLngToVector3(bird.lat, bird.lng, MARKER_RADIUS),
    [bird.lat, bird.lng],
  );

  const material = useMemo(
    () =>
      new MeshPhongMaterial({
        color: 0xffd700,
        emissive: 0x444444,
        shininess: 80,
      }),
    [],
  );

  const handleClick = useCallback(
    (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      setSelectedBird(bird.id);
    },
    [bird.id, setSelectedBird],
  );

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const pulse = 1.0 + 0.1 * Math.sin(clock.elapsedTime * 2.0 + phaseOffset);
    const s = hovered ? 1.3 : pulse;
    meshRef.current.scale.setScalar(s);

    material.emissive.setHex(hovered ? 0x888844 : 0x444444);
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
    >
      <sphereGeometry args={[0.015, 16, 16]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}
