import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  InstancedMesh,
  Vector3,
  Color,
  SphereGeometry,
  MeshStandardMaterial,
  Object3D,
} from "three";
import birdsData from "../../data/birds.json";
import type { Bird } from "../../types";
import { latLngToVector3 } from "../../utils/coordinates";
import { useAppStore } from "../../store";

const birds = birdsData as Bird[];
const MARKER_RADIUS = 1.02;
const LOD_DISTANCE = 2.5;

const RARITY_COLORS: Record<string, string> = {
  legendary: "#FFD700",
  rare: "#4169E1",
  common: "#4CAF50",
};

const tempObject = new Object3D();
const tempColor = new Color();
const posVec = new Vector3();

export function InstancedBirdMarkers() {
  const meshRef = useRef<InstancedMesh>(null);
  const { camera } = useThree();
  const activeRegion = useAppStore((s) => s.activeRegion);
  const frameCountRef = useRef(0);

  const positions = useMemo(
    () => birds.map((b) => latLngToVector3(b.lat, b.lng, MARKER_RADIUS)),
    [],
  );

  const geometry = useMemo(() => new SphereGeometry(0.008, 8, 8), []);
  const material = useMemo(
    () =>
      new MeshStandardMaterial({
        metalness: 0.3,
        roughness: 0.5,
        transparent: true,
        opacity: 0.9,
        vertexColors: true,
      }),
    [],
  );

  useFrame(() => {
    if (!meshRef.current) return;

    frameCountRef.current++;
    if (frameCountRef.current % 10 !== 0) return;

    const inst = meshRef.current;

    for (let i = 0; i < birds.length; i++) {
      const bird = birds[i];
      const pos = positions[i];
      posVec.set(pos[0], pos[1], pos[2]);
      const dist = camera.position.distanceTo(posVec);
      const isFiltered = activeRegion && bird.region !== activeRegion;

      if (dist < LOD_DISTANCE || isFiltered) {
        tempObject.position.set(0, 0, 0);
        tempObject.scale.set(0, 0, 0);
      } else {
        tempObject.position.set(pos[0], pos[1], pos[2]);
        tempObject.scale.set(1, 1, 1);
      }

      tempObject.updateMatrix();
      inst.setMatrixAt(i, tempObject.matrix);

      const color =
        RARITY_COLORS[bird.rarity || "common"] || RARITY_COLORS.common;
      tempColor.set(color);
      inst.setColorAt(i, tempColor);
    }

    inst.instanceMatrix.needsUpdate = true;
    if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, birds.length]}
      frustumCulled={false}
    />
  );
}
