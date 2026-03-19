import { useRef, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { MathUtils, Vector3 } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { useAppStore } from "../../store";
import { latLngToVector3 } from "../../utils/coordinates";
import birdsData from "../../data/birds.json";
import type { Bird } from "../../types";

const birds = birdsData as Bird[];
const birdMap = new Map(birds.map((b) => [b.id, b]));

const DEFAULT_DISTANCE = 2.5;
const ZOOM_DISTANCE = 1.8;
const MIN_CAMERA_DISTANCE = 1.15;
const LERP_FACTOR = 0.04;
const IDLE_TIMEOUT = 5000;
const BASE_AUTO_ROTATE_SPEED = 1.0;

interface CameraControllerProps {
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}

export function CameraController({ controlsRef }: CameraControllerProps) {
  const { camera, gl } = useThree();
  const selectedBirdId = useAppStore((s) => s.selectedBirdId);

  const animatingRef = useRef(false);
  const userInteractedRef = useRef(false);
  const lastInteractionRef = useRef(Date.now());
  const prevSelectedRef = useRef<string | null>(null);

  const bird = useMemo(
    () => (selectedBirdId ? birdMap.get(selectedBirdId) ?? null : null),
    [selectedBirdId],
  );

  const targetDir = useRef(new Vector3());
  const targetDist = useRef(DEFAULT_DISTANCE);

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
    const domElement = gl.domElement;

    const handleWheel = () => {
      const controls = controlsRef.current;
      if (controls) controls.autoRotate = false;
      lastInteractionRef.current = Date.now();
    };

    const handleTouchMove = () => {
      const controls = controlsRef.current;
      if (controls) controls.autoRotate = false;
      lastInteractionRef.current = Date.now();
    };

    domElement.addEventListener("wheel", handleWheel, { passive: true });
    domElement.addEventListener("touchmove", handleTouchMove, {
      passive: true,
    });
    return () => {
      domElement.removeEventListener("wheel", handleWheel);
      domElement.removeEventListener("touchmove", handleTouchMove);
    };
  }, [gl.domElement, controlsRef]);

  useEffect(() => {
    const wasSelected = prevSelectedRef.current;
    prevSelectedRef.current = selectedBirdId;

    userInteractedRef.current = false;
    if (bird) {
      const dist = Math.max(ZOOM_DISTANCE, MIN_CAMERA_DISTANCE);
      const pos = latLngToVector3(bird.lat, bird.lng, dist);
      targetDir.current.set(...pos).normalize();
      targetDist.current = dist;
      animatingRef.current = true;
    } else if (wasSelected) {
      lastInteractionRef.current = Date.now();
      targetDist.current = DEFAULT_DISTANCE;
      animatingRef.current = true;
    }
  }, [bird, selectedBirdId]);

  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    if (userInteractedRef.current && !bird) {
      userInteractedRef.current = false;
    }

    if (animatingRef.current && !userInteractedRef.current) {
      const currentDist = camera.position.length();

      if (bird) {
        const newDist = MathUtils.lerp(
          currentDist,
          targetDist.current,
          LERP_FACTOR,
        );
        const currentDir = camera.position.clone().normalize();
        currentDir.lerp(targetDir.current, LERP_FACTOR).normalize();
        camera.position.copy(currentDir.multiplyScalar(newDist));

        const goalPos = targetDir.current
          .clone()
          .multiplyScalar(targetDist.current);
        if (camera.position.distanceTo(goalPos) < 0.01) {
          animatingRef.current = false;
        }
      } else {
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
    } else if (bird) {
      controls.autoRotate = false;
    }

    if (controls.autoRotate) {
      controls.autoRotateSpeed =
        BASE_AUTO_ROTATE_SPEED * (DEFAULT_DISTANCE / camera.position.length());
    }
  });

  return null;
}
