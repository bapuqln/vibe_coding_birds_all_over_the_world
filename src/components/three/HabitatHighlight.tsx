import { useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import {
  Vector3,
  Quaternion,
  AdditiveBlending,
  DoubleSide,
  type Mesh,
  type MeshBasicMaterial,
} from "three";
import { useAppStore } from "../../store";
import { latLngToVector3 } from "../../utils/coordinates";
import birdsData from "../../data/birds.json";
import type { Bird, HabitatType } from "../../types";

const BIRDS = birdsData as Bird[];
const HIGHLIGHT_RADIUS = 1.003;
const CIRCLE_RADIUS = 0.15;

const HABITAT_COLORS: Record<HabitatType, string> = {
  rainforest: "#22c55e",
  wetlands: "#06b6d4",
  coast: "#3b82f6",
  grassland: "#eab308",
  forest: "#16a34a",
  polar: "#e0f2fe",
  mountains: "#a855f7",
  desert: "#f97316",
  ocean: "#0ea5e9",
  tundra: "#94a3b8",
};

export function HabitatHighlight() {
  const selectedBirdId = useAppStore((s) => s.selectedBirdId);
  const meshRef = useRef<Mesh | null>(null);

  const bird = useMemo(
    () => BIRDS.find((b) => b.id === selectedBirdId) ?? null,
    [selectedBirdId],
  );

  const position = useMemo(
    () =>
      bird && bird.habitatType
        ? latLngToVector3(bird.lat, bird.lng, HIGHLIGHT_RADIUS)
        : null,
    [bird],
  );

  const normal = useMemo(
    () => (position ? new Vector3(...position).normalize() : null),
    [position],
  );

  const quaternion = useMemo(
    () =>
      normal
        ? new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), normal)
        : null,
    [normal],
  );

  const color = useMemo(
    () =>
      bird?.habitatType ? HABITAT_COLORS[bird.habitatType] : null,
    [bird?.habitatType],
  );

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh || !bird?.habitatType) return;

    const mat = mesh.material as MeshBasicMaterial;
    if (mat) {
      const pulse = 0.15 + 0.075 * Math.sin(clock.elapsedTime * 2);
      mat.opacity = Math.max(0.15, Math.min(0.3, pulse));
    }
  });

  if (!bird?.habitatType || !position || !quaternion || !color) {
    return null;
  }

  return (
    <mesh
      ref={meshRef}
      position={position}
      quaternion={quaternion}
      renderOrder={0}
    >
      <circleGeometry args={[CIRCLE_RADIUS, 32]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.25}
        blending={AdditiveBlending}
        depthWrite={false}
        side={DoubleSide}
      />
    </mesh>
  );
}
