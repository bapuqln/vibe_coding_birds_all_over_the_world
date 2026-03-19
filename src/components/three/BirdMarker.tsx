import { useRef, useMemo, useCallback, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import {
  Vector3,
  Quaternion,
  MeshStandardMaterial,
  type Mesh,
} from "three";
import type { Bird } from "../../types";
import { latLngToVector3 } from "../../utils/coordinates";
import { useAppStore } from "../../store";

const MARKER_RADIUS = 1.02;
const MODEL_PATH = "/models/bird.glb";
const BASE_SCALE = 0.03;

useGLTF.preload(MODEL_PATH);

interface BirdMarkerProps {
  bird: Bird;
  index: number;
}

export function BirdMarker({ bird, index }: BirdMarkerProps) {
  const meshRef = useRef<Mesh>(null);
  const matRef = useRef<MeshStandardMaterial>(null);
  const hoveredRef = useRef(false);
  const scaleRef = useRef(1);
  const emissiveRef = useRef(0.5);
  const setSelectedBird = useAppStore((s) => s.setSelectedBird);
  const setModelsReady = useAppStore((s) => s.setModelsReady);
  const phaseOffset = index * 1.3;

  const position = useMemo(
    () => latLngToVector3(bird.lat, bird.lng, MARKER_RADIUS),
    [bird.lat, bird.lng],
  );

  const normal = useMemo(
    () => new Vector3(...position).normalize(),
    [position],
  );

  const quaternion = useMemo(
    () => new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), normal),
    [normal],
  );

  const gltf = useGLTF(MODEL_PATH);
  const gltfGeometry = useMemo(() => {
    const firstMesh = gltf.scene.children[0] as Mesh | undefined;
    return firstMesh?.geometry ?? null;
  }, [gltf]);

  useEffect(() => {
    if (gltfGeometry && index === 0) {
      setModelsReady(true);
    }
  }, [gltfGeometry, index, setModelsReady]);

  const handleClick = useCallback(
    (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      setSelectedBird(bird.id);
    },
    [bird.id, setSelectedBird],
  );

  useFrame(({ clock }) => {
    if (!meshRef.current) return;

    const targetScale = hoveredRef.current ? 1.4 : 1.0;
    scaleRef.current += (targetScale - scaleRef.current) * 0.15;
    const s = scaleRef.current * BASE_SCALE;
    meshRef.current.scale.set(s, s, s);

    const targetEmissive = hoveredRef.current ? 1.5 : 0.5;
    emissiveRef.current += (targetEmissive - emissiveRef.current) * 0.15;
    if (matRef.current) {
      matRef.current.emissiveIntensity = emissiveRef.current;
    }

    const bob = 0.005 * Math.sin(clock.elapsedTime * Math.PI + phaseOffset);
    meshRef.current.position.set(
      position[0] + normal.x * bob,
      position[1] + normal.y * bob,
      position[2] + normal.z * bob,
    );
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      quaternion={quaternion}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        hoveredRef.current = true;
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        hoveredRef.current = false;
        document.body.style.cursor = "auto";
      }}
    >
      {gltfGeometry ? (
        <primitive object={gltfGeometry} attach="geometry" />
      ) : (
        <sphereGeometry args={[0.015, 16, 16]} />
      )}
      <meshStandardMaterial
        ref={matRef}
        color={0xffb347}
        emissive={0x332200}
        emissiveIntensity={0.5}
        metalness={0.2}
        roughness={0.6}
      />
    </mesh>
  );
}
