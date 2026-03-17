import { useRef, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { MathUtils, Vector3 } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { useAppStore } from "../../store";
import { computeCameraTarget } from "../../utils/camera";
import birdsData from "../../data/birds.json";
import type { Bird } from "../../types";

const birds = birdsData as Bird[];
const birdMap = new Map(birds.map((b) => [b.id, b]));

const DEFAULT_DISTANCE = 2.5;
const ZOOM_DISTANCE = 1.8;
const LERP_FACTOR = 0.04;
const IDLE_TIMEOUT = 5000;

interface CameraControllerProps {
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}

export function CameraController({ controlsRef }: CameraControllerProps) {
  const { camera } = useThree();
  const selectedBirdId = useAppStore((s) => s.selectedBirdId);

  const animatingRef = useRef(false);
  const userInteractedRef = useRef(false);
  const lastInteractionRef = useRef(Date.now());

  const bird = useMemo(
    () => (selectedBirdId ? birdMap.get(selectedBirdId) ?? null : null),
    [selectedBirdId],
  );

  const targetPos = useRef(new Vector3());
  const targetLookAt = useRef(new Vector3());

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const handleStart = () => {
      controls.autoRotate = false;
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
    userInteractedRef.current = false;
    if (bird) {
      const { position, target } = computeCameraTarget(
        bird.lat,
        bird.lng,
        ZOOM_DISTANCE,
      );
      targetPos.current.set(...position);
      targetLookAt.current.set(...target);
      animatingRef.current = true;
    } else {
      lastInteractionRef.current = Date.now();
      animatingRef.current = true;
    }
  }, [bird]);

  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    if (userInteractedRef.current && !bird) {
      userInteractedRef.current = false;
    }

    if (animatingRef.current && !userInteractedRef.current) {
      if (bird) {
        controls.target.lerp(targetLookAt.current, LERP_FACTOR);

        const currentDist = camera.position.length();
        const newDist = MathUtils.lerp(currentDist, ZOOM_DISTANCE, LERP_FACTOR);
        camera.position.normalize().multiplyScalar(newDist);

        const dir = targetPos.current.clone().normalize();
        const currentDir = camera.position.clone().normalize();
        currentDir.lerp(dir, LERP_FACTOR);
        camera.position.copy(currentDir.multiplyScalar(newDist));

        if (camera.position.distanceTo(targetPos.current) < 0.01) {
          animatingRef.current = false;
        }
      } else {
        const currentDist = camera.position.length();
        const newDist = MathUtils.lerp(
          currentDist,
          DEFAULT_DISTANCE,
          LERP_FACTOR,
        );
        camera.position.normalize().multiplyScalar(newDist);

        if (Math.abs(currentDist - DEFAULT_DISTANCE) < 0.01) {
          animatingRef.current = false;
        }
      }

      controls.update();
    }

    if (
      !bird &&
      !animatingRef.current &&
      Date.now() - lastInteractionRef.current > IDLE_TIMEOUT
    ) {
      controls.autoRotate = true;
      controls.autoRotateSpeed =
        1.0 * (DEFAULT_DISTANCE / camera.position.length());
    } else if (bird) {
      controls.autoRotate = false;
    }
  });

  return null;
}
