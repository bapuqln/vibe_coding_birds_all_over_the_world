import { useRef, useMemo, useCallback, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Html } from "@react-three/drei";
import {
  Vector3,
  Quaternion,
  MeshStandardMaterial,
  RingGeometry,
  MeshBasicMaterial,
  DoubleSide,
  AdditiveBlending,
  type Mesh,
  type Group,
  type BufferGeometry,
} from "three";
import type { Bird } from "../../types";
import { latLngToVector3 } from "../../utils/coordinates";
import { useAppStore } from "../../store";
import { getModelPath, ALL_MODEL_PATHS } from "../../data/birdModels";

const MARKER_RADIUS = 1.02;
const BASE_SCALE = 0.03;
const FLIGHT_RADIUS = 0.015;
const FLIGHT_SPEED = 0.4;
const LOD_DISTANCE = 2.5;
const MAX_3D_MODELS = 15;
const CLICK_ANIM_DURATION = 1300;
const CLICK_LIFT_HEIGHT = 0.02;
const PHASE_FLAP = 300;
const PHASE_HOP = 500;
const PHASE_LOOK = 800;
const PHASE_CIRCLE = 1300;

for (const p of ALL_MODEL_PATHS) {
  useGLTF.preload(p);
}

function useModelGeometry(modelPath: string): BufferGeometry | null {
  const gltf = useGLTF(modelPath);
  return useMemo(() => {
    const firstMesh = gltf.scene.children[0] as Mesh | undefined;
    return firstMesh?.geometry ?? null;
  }, [gltf]);
}

interface BirdMarkerProps {
  bird: Bird;
  index: number;
  totalVisible3D?: number;
}

export function BirdMarker({ bird, index }: BirdMarkerProps) {
  const groupRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);
  const matRef = useRef<MeshStandardMaterial>(null);
  const ringMatRef = useRef<MeshBasicMaterial>(null);
  const hoveredRef = useRef(false);
  const scaleRef = useRef(1);
  const emissiveRef = useRef(0.5);
  const pausedUntilRef = useRef(0);
  const clickAnimStartRef = useRef(0);
  const discoveryGlowRef = useRef(0);
  const setSelectedBird = useAppStore((s) => s.setSelectedBird);
  const setModelsReady = useAppStore((s) => s.setModelsReady);
  const setHoveredBird = useAppStore((s) => s.setHoveredBird);
  const activeRegion = useAppStore((s) => s.activeRegion);
  const hoveredBirdId = useAppStore((s) => s.hoveredBirdId);
  const discoverBird = useAppStore((s) => s.discoverBird);
  const discoveredBirds = useAppStore((s) => s.discoveredBirds);
  const isDiscovered = discoveredBirds.includes(bird.id);
  const phaseOffset = index * 1.3;

  const { camera } = useThree();

  const modelPath = useMemo(() => getModelPath(bird.silhouette), [bird.silhouette]);
  const glbGeometry = useModelGeometry(modelPath);

  useEffect(() => {
    if (index === 0 && glbGeometry) setModelsReady(true);
  }, [index, glbGeometry, setModelsReady]);

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

  const handleClick = useCallback(
    (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      if (!isDiscovered) {
        discoveryGlowRef.current = 1.0;
      }
      setSelectedBird(bird.id);
      discoverBird(bird.id);
      pausedUntilRef.current = Date.now() + 3000;
      clickAnimStartRef.current = Date.now();
    },
    [bird.id, setSelectedBird, discoverBird, isDiscovered],
  );

  const rarityGlow =
    bird.rarity === "legendary" ? 2.0 : bird.rarity === "rare" ? 1.2 : 0.5;

  useFrame(({ clock }) => {
    if (!meshRef.current) return;

    const posVec = new Vector3(...position);
    const dist = camera.position.distanceTo(posVec);
    const shouldUse3D = dist < LOD_DISTANCE && index < MAX_3D_MODELS;

    const now = Date.now();
    const clickElapsed = now - clickAnimStartRef.current;
    const isClickAnimating = clickElapsed < CLICK_ANIM_DURATION;

    const targetScale = hoveredRef.current ? 1.35 : 1.0;
    scaleRef.current += (targetScale - scaleRef.current) * 0.1;

    const modelScale = shouldUse3D ? BASE_SCALE * 1.2 : BASE_SCALE;
    const distToMarker = camera.position.distanceTo(posVec);
    const proximityFactor = !isDiscovered
      ? Math.max(0, 1 - (distToMarker - 1.2) / 2.0)
      : 0;
    const hintFlutter = !isDiscovered
      ? 1 +
        (0.03 + 0.08 * proximityFactor) *
          Math.sin(
            clock.elapsedTime * (3 + proximityFactor * 3) + phaseOffset * 2,
          )
      : 1;

    // Idle wing-flap: gentle sine wave every few seconds
    const idleFlapCycle = clock.elapsedTime * 1.2 + phaseOffset;
    const idleFlap = 0.04 * Math.sin(idleFlapCycle * Math.PI);

    const s = scaleRef.current * modelScale * hintFlutter;

    let wingFlapFreq = 2 * Math.PI / 1.2;
    let wingFlapAmp = 0.08;
    if (isClickAnimating && clickElapsed < PHASE_FLAP) {
      wingFlapFreq = 2 * Math.PI / 0.12;
      wingFlapAmp = 0.25;
    } else if (isClickAnimating && clickElapsed < PHASE_HOP) {
      wingFlapFreq = 2 * Math.PI / 0.2;
      wingFlapAmp = 0.15;
    }
    const wingFlap =
      1 +
      wingFlapAmp *
        Math.sin(clock.elapsedTime * wingFlapFreq + phaseOffset);

    // Apply scale with idle wing breathing on Y axis
    meshRef.current.scale.set(
      s * wingFlap,
      s * (1 + idleFlap),
      s,
    );

    const gentleRotation = shouldUse3D
      ? Math.sin(clock.elapsedTime * 0.3 + phaseOffset) * 0.15
      : 0;

    if (shouldUse3D) {
      const q = quaternion.clone();

      if (isClickAnimating && clickElapsed >= PHASE_HOP) {
        const camDir = new Vector3()
          .subVectors(camera.position, posVec)
          .normalize();
        const projectedDir = camDir
          .clone()
          .sub(normal.clone().multiplyScalar(camDir.dot(normal)))
          .normalize();
        const forward = new Vector3(1, 0, 0).applyQuaternion(quaternion);
        const angle = Math.atan2(
          projectedDir.clone().cross(forward).dot(normal),
          projectedDir.dot(forward),
        );
        const lookT = Math.min(
          (clickElapsed - PHASE_HOP) / (PHASE_LOOK - PHASE_HOP),
          1,
        );
        const eased = lookT * lookT * (3 - 2 * lookT);
        const rotQ = new Quaternion().setFromAxisAngle(normal, -angle * eased);
        q.multiply(rotQ);

        if (clickElapsed >= PHASE_LOOK) {
          const circleT =
            (clickElapsed - PHASE_LOOK) / (PHASE_CIRCLE - PHASE_LOOK);
          const circleAngle = circleT * Math.PI * 2 * 0.6;
          const circleRotQ = new Quaternion().setFromAxisAngle(
            normal,
            circleAngle,
          );
          q.multiply(circleRotQ);
        }
      } else if (!isClickAnimating) {
        const rotQ = new Quaternion().setFromAxisAngle(normal, gentleRotation);
        q.multiply(rotQ);
      }
      meshRef.current.quaternion.copy(q);
    }

    if (discoveryGlowRef.current > 0) {
      discoveryGlowRef.current = Math.max(
        0,
        discoveryGlowRef.current - 0.02,
      );
    }

    const hintPulse = !isDiscovered
      ? (0.2 + 0.6 * proximityFactor) *
        (0.5 +
          0.5 *
            Math.sin(
              clock.elapsedTime * (2 + proximityFactor * 2) + phaseOffset,
            ))
      : 0;
    const discoveryBoost = discoveryGlowRef.current * 3.0;
    const targetEmissive = hoveredRef.current
      ? 2.0
      : rarityGlow + hintPulse + discoveryBoost;
    emissiveRef.current += (targetEmissive - emissiveRef.current) * 0.15;
    if (matRef.current) {
      matRef.current.emissiveIntensity = emissiveRef.current;
    }

    if (ringMatRef.current) {
      const ringPulse =
        0.6 + 0.4 * Math.sin(clock.elapsedTime * 2 + phaseOffset);
      ringMatRef.current.opacity =
        (hoveredRef.current ? 0.6 : 0.25) * ringPulse;
    }

    const isPaused = now < pausedUntilRef.current;
    const t = clock.elapsedTime * FLIGHT_SPEED + phaseOffset;
    const flightX = isPaused ? 0 : Math.sin(t) * FLIGHT_RADIUS;
    const flightZ = isPaused ? 0 : Math.cos(t) * FLIGHT_RADIUS * 0.6;

    const tangent1 = new Vector3(-normal.y, normal.x, 0).normalize();
    const tangent2 = new Vector3()
      .crossVectors(normal, tangent1)
      .normalize();

    const floatAmplitude = shouldUse3D ? 0.008 : 0.005;
    const floatSpeed = shouldUse3D ? Math.PI * 0.8 : Math.PI;
    let bob =
      floatAmplitude *
      Math.sin(clock.elapsedTime * floatSpeed + phaseOffset);

    if (isClickAnimating) {
      if (clickElapsed < PHASE_FLAP) {
        const flapT = clickElapsed / PHASE_FLAP;
        bob += CLICK_LIFT_HEIGHT * 0.5 * Math.sin(flapT * Math.PI);
      } else if (clickElapsed < PHASE_HOP) {
        const hopT =
          (clickElapsed - PHASE_FLAP) / (PHASE_HOP - PHASE_FLAP);
        const hopCurve = Math.sin(hopT * Math.PI);
        bob += CLICK_LIFT_HEIGHT * 1.5 * hopCurve;
      } else if (clickElapsed < PHASE_LOOK) {
        bob += CLICK_LIFT_HEIGHT * 0.8;
      } else {
        const circleT =
          (clickElapsed - PHASE_LOOK) / (PHASE_CIRCLE - PHASE_LOOK);
        bob += CLICK_LIFT_HEIGHT * 0.8 * (1 - circleT * 0.5);
      }
    }

    let circleX = 0;
    let circleZ = 0;
    if (isClickAnimating && clickElapsed >= PHASE_LOOK) {
      const circleT =
        (clickElapsed - PHASE_LOOK) / (PHASE_CIRCLE - PHASE_LOOK);
      const circleAngle = circleT * Math.PI * 2 * 0.6;
      const circleRadius = FLIGHT_RADIUS * 2;
      circleX = Math.sin(circleAngle) * circleRadius;
      circleZ = Math.cos(circleAngle) * circleRadius * 0.6;
    }

    meshRef.current.position.set(
      position[0] +
        normal.x * bob +
        tangent1.x * (flightX + circleX) +
        tangent2.x * (flightZ + circleZ),
      position[1] +
        normal.y * bob +
        tangent1.y * (flightX + circleX) +
        tangent2.y * (flightZ + circleZ),
      position[2] +
        normal.z * bob +
        tangent1.z * (flightX + circleX) +
        tangent2.z * (flightZ + circleZ),
    );

    const targetOpacity = isVisible ? 1 : 0.1;
    if (matRef.current) {
      matRef.current.opacity +=
        (targetOpacity - matRef.current.opacity) * 0.1;
    }
  });

  const baseEmissiveColor =
    bird.rarity === "legendary"
      ? 0x664400
      : bird.rarity === "rare"
        ? 0x223366
        : 0x332200;
  const emissiveColor = !isDiscovered ? 0x663300 : baseEmissiveColor;

  const ringGeo = useMemo(() => new RingGeometry(0.008, 0.016, 24), []);

  return (
    <group
      ref={groupRef}
      visible={isVisible || (matRef.current?.opacity ?? 0) > 0.05}
    >
      {/* Glowing base ring */}
      <mesh geometry={ringGeo} position={position} quaternion={quaternion}>
        <meshBasicMaterial
          ref={ringMatRef}
          color={!isDiscovered ? 0xffaa33 : 0xffcc66}
          transparent
          opacity={0.3}
          side={DoubleSide}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Bird mesh — uses GLB geometry when available, fallback sphere */}
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
        {glbGeometry ? (
          <primitive object={glbGeometry} attach="geometry" />
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
          flatShading
        />
      </mesh>

      {isHovered && (
        <Html
          position={[
            position[0] + normal.x * 0.07,
            position[1] + normal.y * 0.07,
            position[2] + normal.z * 0.07,
          ]}
          center
          style={{ pointerEvents: "none" }}
        >
          <div
            style={{
              whiteSpace: "nowrap",
              textAlign: "center",
              padding: "8px 14px",
              borderRadius: 14,
              background: "rgba(0, 0, 0, 0.55)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
              animation: "tooltipFadeIn 0.2s ease-out",
            }}
          >
            <p
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "white",
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              {bird.nameEn}
            </p>
            <p
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.65)",
                margin: "2px 0 0",
                lineHeight: 1.2,
              }}
            >
              {bird.nameZh}
            </p>
            <p
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.5)",
                margin: "2px 0 0",
                lineHeight: 1.2,
                textTransform: "capitalize",
              }}
            >
              {bird.region.replace("-", " ")}
            </p>
          </div>
        </Html>
      )}
    </group>
  );
}
