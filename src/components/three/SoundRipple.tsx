import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  Vector3,
  Quaternion,
  RingGeometry,
  DoubleSide,
  type Mesh,
  type MeshBasicMaterial,
} from "three";
import { useAppStore } from "../../store";
import { latLngToVector3 } from "../../utils/coordinates";
import birdsData from "../../data/birds.json";
import type { Bird } from "../../types";

const BIRDS = birdsData as Bird[];
const RIPPLE_RADIUS = 1.025;
const INNER_RADIUS = 0.01;
const OUTER_START = 0.015;
const OUTER_END = 0.08;
const DURATION = 2;
const STAGGER = 0.6;
const RING_COUNT = 3;
const COLOR = "#fbbf24";

export function SoundRipple() {
  const audioStatus = useAppStore((s) => s.audioStatus);
  const selectedBirdId = useAppStore((s) => s.selectedBirdId);

  const bird = useMemo(
    () => BIRDS.find((b) => b.id === selectedBirdId) ?? null,
    [selectedBirdId],
  );

  const ringRefs = useRef<(Mesh | null)[]>([]);

  const position = useMemo(
    () => (bird ? latLngToVector3(bird.lat, bird.lng, RIPPLE_RADIUS) : null),
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

  useFrame(({ clock }) => {
    if (audioStatus !== "playing" || !bird || !position || !quaternion) return;

    const elapsed = clock.elapsedTime;

    for (let i = 0; i < RING_COUNT; i++) {
      let phase = elapsed - i * STAGGER;
      if (phase < 0) continue;
      phase = phase % DURATION;

      const mesh = ringRefs.current[i];
      if (!mesh) continue;

      const progress = Math.min(phase / DURATION, 1);
      const outerR = OUTER_START + (OUTER_END - OUTER_START) * progress;
      const opacity = 0.6 * (1 - progress);

      const geom = new RingGeometry(INNER_RADIUS, outerR, 32);
      const oldGeom = mesh.geometry;
      mesh.geometry = geom;
      if (oldGeom) oldGeom.dispose();

      const mat = mesh.material as MeshBasicMaterial;
      if (mat) {
        mat.opacity = opacity;
      }
    }
  });

  if (audioStatus !== "playing" || !bird || !position || !quaternion) {
    return null;
  }

  return (
    <group position={position} quaternion={quaternion}>
      {Array.from({ length: RING_COUNT }, (_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            ringRefs.current[i] = el;
          }}
          renderOrder={1}
        >
          <ringGeometry args={[INNER_RADIUS, OUTER_START, 32]} />
          <meshBasicMaterial
            color={COLOR}
            transparent
            opacity={0}
            depthWrite={false}
            side={DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}
