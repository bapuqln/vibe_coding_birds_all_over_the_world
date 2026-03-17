import { useRef, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { useAppStore } from "../../store";
import { latLngToVector3 } from "../../utils/coordinates";
import birdsData from "../../data/birds.json";
import type { Bird } from "../../types";

const birds = birdsData as Bird[];
const birdMap = new Map(birds.map((b) => [b.id, b]));

const DEFAULT_DISTANCE = 2.5;
const ZOOM_DISTANCE = 1.8;
const REGION_ZOOM_DISTANCE = 2.0;
const MIN_CAMERA_DISTANCE = 1.15;
const ANIM_DURATION = 1000;
const IDLE_TIMEOUT = 5000;
const BASE_AUTO_ROTATE_SPEED = 1.0;
const BIRD_ORBIT_SPEED = 0.5;

const REGION_CENTERS: Record<string, { lat: number; lng: number }> = {
  "north-america": { lat: 40, lng: -100 },
  "south-america": { lat: -15, lng: -60 },
  europe: { lat: 50, lng: 10 },
  africa: { lat: 0, lng: 25 },
  asia: { lat: 30, lng: 100 },
  oceania: { lat: -25, lng: 135 },
  antarctica: { lat: -80, lng: 0 },
};

function smoothstep(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}

interface CameraControllerProps {
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}

export function CameraController({ controlsRef }: CameraControllerProps) {
  const { camera, gl } = useThree();
  const selectedBirdId = useAppStore((s) => s.selectedBirdId);
  const activeRegion = useAppStore((s) => s.activeRegion);

  const animatingRef = useRef(false);
  const animStartTimeRef = useRef(0);
  const userInteractedRef = useRef(false);
  const lastInteractionRef = useRef(Date.now());
  const prevSelectedRef = useRef<string | null>(null);
  const prevRegionRef = useRef<string | null>(null);
  const birdOrbitActiveRef = useRef(false);

  const startPosRef = useRef(new Vector3());
  const targetPosRef = useRef(new Vector3());

  const bird = useMemo(
    () => (selectedBirdId ? birdMap.get(selectedBirdId) ?? null : null),
    [selectedBirdId],
  );

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const handleStart = () => {
      controls.autoRotate = false;
      birdOrbitActiveRef.current = false;
      if (animatingRef.current) {
        userInteractedRef.current = true;
        animatingRef.current = false;
      }
    };

    const handleEnd = () => {
      lastInteractionRef.current = Date.now();
    };

    controls.addEventListener("start", handleStart);
    controls.addEventListener("end", handleEnd);
    return () => {
      controls.removeEventListener("start", handleStart);
      controls.removeEventListener("end", handleEnd);
    };
  }, [controlsRef]);

  useEffect(() => {
    const domElement = gl.domElement;

    const handleWheel = () => {
      const controls = controlsRef.current;
      if (controls) {
        controls.autoRotate = false;
        birdOrbitActiveRef.current = false;
      }
      lastInteractionRef.current = Date.now();
    };

    const handleTouchMove = () => {
      const controls = controlsRef.current;
      if (controls) {
        controls.autoRotate = false;
        birdOrbitActiveRef.current = false;
      }
      lastInteractionRef.current = Date.now();
    };

    domElement.addEventListener("wheel", handleWheel, { passive: true });
    domElement.addEventListener("touchmove", handleTouchMove, { passive: true });
    return () => {
      domElement.removeEventListener("wheel", handleWheel);
      domElement.removeEventListener("touchmove", handleTouchMove);
    };
  }, [gl.domElement, controlsRef]);

  useEffect(() => {
    const wasSelected = prevSelectedRef.current;
    prevSelectedRef.current = selectedBirdId;

    userInteractedRef.current = false;
    birdOrbitActiveRef.current = false;

    if (bird) {
      const dist = Math.max(ZOOM_DISTANCE, MIN_CAMERA_DISTANCE);
      const pos = latLngToVector3(bird.lat, bird.lng, dist);
      startPosRef.current.copy(camera.position);
      targetPosRef.current.set(...pos);
      animStartTimeRef.current = Date.now();
      animatingRef.current = true;
    } else if (wasSelected) {
      lastInteractionRef.current = Date.now();
      startPosRef.current.copy(camera.position);
      targetPosRef.current.copy(camera.position.clone().normalize().multiplyScalar(DEFAULT_DISTANCE));
      animStartTimeRef.current = Date.now();
      animatingRef.current = true;
    }
  }, [bird, selectedBirdId, camera]);

  useEffect(() => {
    const wasRegion = prevRegionRef.current;
    prevRegionRef.current = activeRegion;

    if (activeRegion && REGION_CENTERS[activeRegion]) {
      const center = REGION_CENTERS[activeRegion];
      const pos = latLngToVector3(center.lat, center.lng, REGION_ZOOM_DISTANCE);
      startPosRef.current.copy(camera.position);
      targetPosRef.current.set(...pos);
      animStartTimeRef.current = Date.now();
      animatingRef.current = true;
      userInteractedRef.current = false;
    } else if (wasRegion && !activeRegion) {
      startPosRef.current.copy(camera.position);
      targetPosRef.current.copy(camera.position.clone().normalize().multiplyScalar(DEFAULT_DISTANCE));
      animStartTimeRef.current = Date.now();
      animatingRef.current = true;
    }
  }, [activeRegion, camera]);

  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    if (userInteractedRef.current && !bird) {
      userInteractedRef.current = false;
    }

    if (animatingRef.current && !userInteractedRef.current) {
      const elapsed = Date.now() - animStartTimeRef.current;
      const rawT = elapsed / ANIM_DURATION;
      const t = smoothstep(rawT);

      if (rawT >= 1) {
        camera.position.copy(targetPosRef.current);
        animatingRef.current = false;

        if (bird) {
          birdOrbitActiveRef.current = true;
          controls.autoRotate = true;
          controls.autoRotateSpeed = BIRD_ORBIT_SPEED;
        }
      } else {
        const startDir = startPosRef.current.clone().normalize();
        const targetDir = targetPosRef.current.clone().normalize();
        const startDist = startPosRef.current.length();
        const targetDist = targetPosRef.current.length();

        const currentDir = startDir.clone().lerp(targetDir, t).normalize();
        const currentDist = startDist + (targetDist - startDist) * t;

        camera.position.copy(currentDir.multiplyScalar(currentDist));
      }

      controls.update();
    }

    if (
      !bird &&
      !activeRegion &&
      !animatingRef.current &&
      !birdOrbitActiveRef.current &&
      Date.now() - lastInteractionRef.current > IDLE_TIMEOUT
    ) {
      controls.autoRotate = true;
    } else if (!bird && !activeRegion && !birdOrbitActiveRef.current) {
      // keep current state
    }

    if (controls.autoRotate && !birdOrbitActiveRef.current) {
      controls.autoRotateSpeed =
        BASE_AUTO_ROTATE_SPEED * (DEFAULT_DISTANCE / camera.position.length());
    }
  });

  return null;
}
