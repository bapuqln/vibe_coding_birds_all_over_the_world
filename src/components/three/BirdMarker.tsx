import { useRef, useMemo, useCallback, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Html } from "@react-three/drei";
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
const FLIGHT_RADIUS = 0.015;
const FLIGHT_SPEED = 0.4;
const LOD_DISTANCE = 2.5;
const MAX_3D_MODELS = 15;
const CLICK_ANIM_DURATION = 500;
const CLICK_LIFT_HEIGHT = 0.02;

useGLTF.preload(MODEL_PATH);

interface BirdMarkerProps {
  bird: Bird;
  index: number;
  totalVisible3D?: number;
}

export function BirdMarker({ bird, index }: BirdMarkerProps) {
  const meshRef = useRef<Mesh>(null);
  const matRef = useRef<MeshStandardMaterial>(null);
  const hoveredRef = useRef(false);
  const scaleRef = useRef(1);
  const emissiveRef = useRef(0.5);
  const pausedUntilRef = useRef(0);
  const clickAnimStartRef = useRef(0);
  const use3DRef = useRef(false);
  const setSelectedBird = useAppStore((s) => s.setSelectedBird);
  const setModelsReady = useAppStore((s) => s.setModelsReady);
  const setHoveredBird = useAppStore((s) => s.setHoveredBird);
  const activeRegion = useAppStore((s) => s.activeRegion);
  const hoveredBirdId = useAppStore((s) => s.hoveredBirdId);
  const discoverBird = useAppStore((s) => s.discoverBird);
  const phaseOffset = index * 1.3;

  const { camera } = useThree();

  const isVisible = !activeRegion || bird.region === activeRegion;
  const isHovered = hoveredBirdId === bird.id;

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
      discoverBird(bird.id);
      pausedUntilRef.current = Date.now() + 3000;
      clickAnimStartRef.current = Date.now();
    },
    [bird.id, setSelectedBird, discoverBird],
  );

  const rarityGlow = bird.rarity === "legendary" ? 2.0
    : bird.rarity === "rare" ? 1.2
    : 0.5;

  useFrame(({ clock }) => {
    if (!meshRef.current) return;

    const posVec = new Vector3(...position);
    const dist = camera.position.distanceTo(posVec);
    const shouldUse3D = dist < LOD_DISTANCE && index < MAX_3D_MODELS;
    use3DRef.current = shouldUse3D;

    const now = Date.now();
    const clickElapsed = now - clickAnimStartRef.current;
    const isClickAnimating = clickElapsed < CLICK_ANIM_DURATION;

    const targetScale = hoveredRef.current ? 1.4 : 1.0;
    scaleRef.current += (targetScale - scaleRef.current) * 0.15;

    const modelScale = shouldUse3D ? BASE_SCALE * 1.2 : BASE_SCALE;
    const s = scaleRef.current * modelScale;

    let wingFlapFreq = 2 * Math.PI / 1.2;
    let wingFlapAmp = 0.08;
    if (isClickAnimating) {
      wingFlapFreq = 2 * Math.PI / 0.15;
      wingFlapAmp = 0.2;
    }
    const wingFlap = 1 + wingFlapAmp * Math.sin(clock.elapsedTime * wingFlapFreq + phaseOffset);
    meshRef.current.scale.set(s * wingFlap, s, s);

    const gentleRotation = shouldUse3D
      ? Math.sin(clock.elapsedTime * 0.3 + phaseOffset) * 0.15
      : 0;

    if (shouldUse3D) {
      const q = quaternion.clone();

      if (isClickAnimating) {
        const camDir = new Vector3().subVectors(camera.position, posVec).normalize();
        const projectedDir = camDir.clone().sub(normal.clone().multiplyScalar(camDir.dot(normal))).normalize();
        const forward = new Vector3(1, 0, 0).applyQuaternion(quaternion);
        const angle = Math.atan2(
          projectedDir.clone().cross(forward).dot(normal),
          projectedDir.dot(forward),
        );
        const t = Math.min(clickElapsed / CLICK_ANIM_DURATION, 1);
        const eased = t * t * (3 - 2 * t);
        const rotQ = new Quaternion().setFromAxisAngle(normal, -angle * eased);
        q.multiply(rotQ);
      } else {
        const rotQ = new Quaternion().setFromAxisAngle(normal, gentleRotation);
        q.multiply(rotQ);
      }
      meshRef.current.quaternion.copy(q);
    }

    const targetEmissive = hoveredRef.current ? 1.5 : rarityGlow;
    emissiveRef.current += (targetEmissive - emissiveRef.current) * 0.15;
    if (matRef.current) {
      matRef.current.emissiveIntensity = emissiveRef.current;
    }

    const isPaused = now < pausedUntilRef.current;
    const t = clock.elapsedTime * FLIGHT_SPEED + phaseOffset;
    const flightX = isPaused ? 0 : Math.sin(t) * FLIGHT_RADIUS;
    const flightZ = isPaused ? 0 : Math.cos(t) * FLIGHT_RADIUS * 0.6;

    const tangent1 = new Vector3(-normal.y, normal.x, 0).normalize();
    const tangent2 = new Vector3().crossVectors(normal, tangent1).normalize();

    const floatAmplitude = shouldUse3D ? 0.008 : 0.005;
    const floatSpeed = shouldUse3D ? Math.PI * 0.8 : Math.PI;
    let bob = floatAmplitude * Math.sin(clock.elapsedTime * floatSpeed + phaseOffset);

    if (isClickAnimating) {
      const clickT = clickElapsed / CLICK_ANIM_DURATION;
      const liftCurve = Math.sin(clickT * Math.PI);
      bob += CLICK_LIFT_HEIGHT * liftCurve;
    }

    meshRef.current.position.set(
      position[0] + normal.x * bob + tangent1.x * flightX + tangent2.x * flightZ,
      position[1] + normal.y * bob + tangent1.y * flightX + tangent2.y * flightZ,
      position[2] + normal.z * bob + tangent1.z * flightX + tangent2.z * flightZ,
    );

    const targetOpacity = isVisible ? 1 : 0.1;
    if (matRef.current) {
      matRef.current.opacity += (targetOpacity - matRef.current.opacity) * 0.1;
    }
  });

  const emissiveColor = bird.rarity === "legendary" ? 0x664400 : bird.rarity === "rare" ? 0x223366 : 0x332200;

  return (
    <group visible={isVisible || (matRef.current?.opacity ?? 0) > 0.05}>
      <mesh
        ref={meshRef}
        position={position}
        quaternion={quaternion}
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          hoveredRef.current = true;
          setHoveredBird(bird.id);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          hoveredRef.current = false;
          setHoveredBird(null);
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
          emissive={emissiveColor}
          emissiveIntensity={rarityGlow}
          metalness={0.2}
          roughness={0.6}
          transparent
          opacity={1}
        />
      </mesh>

      {isHovered && (
        <Html
          position={[
            position[0] + normal.x * 0.06,
            position[1] + normal.y * 0.06,
            position[2] + normal.z * 0.06,
          ]}
          center
          style={{ pointerEvents: "none" }}
        >
          <div className="whitespace-nowrap rounded-lg bg-black/75 px-2.5 py-1.5 text-center backdrop-blur-sm">
            <p className="text-xs font-bold text-white">
              {bird.nameEn}
            </p>
            <p className="text-[10px] text-white/70">
              {bird.region}
            </p>
          </div>
        </Html>
      )}
    </group>
  );
}
