import { useThree, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { useAppStore } from "../store";

export function useEngine() {
  const { gl, scene, camera } = useThree();
  const fpsRef = useRef(60);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const fpsHistoryRef = useRef<number[]>([]);
  const lodCheckRef = useRef(0);

  const setCurrentFps = useAppStore((s) => s.setCurrentFps);
  const setDynamicLodDistance = useAppStore((s) => s.setDynamicLodDistance);
  const dynamicLodDistance = useAppStore((s) => s.dynamicLodDistance);

  useFrame(() => {
    frameCountRef.current++;
    const now = performance.now();
    if (now - lastTimeRef.current >= 1000) {
      fpsRef.current = frameCountRef.current;
      setCurrentFps(frameCountRef.current);
      fpsHistoryRef.current.push(frameCountRef.current);
      if (fpsHistoryRef.current.length > 60) {
        fpsHistoryRef.current.shift();
      }
      frameCountRef.current = 0;
      lastTimeRef.current = now;
    }

    lodCheckRef.current++;
    if (lodCheckRef.current >= 60) {
      lodCheckRef.current = 0;
      const history = fpsHistoryRef.current;
      if (history.length >= 2) {
        const avg = history.slice(-3).reduce((a, b) => a + b, 0) / Math.min(history.length, 3);
        let newLod = dynamicLodDistance;
        if (avg < 45) {
          newLod = Math.min(dynamicLodDistance + 0.5, 5.0);
        } else if (avg > 55) {
          newLod = Math.max(dynamicLodDistance - 0.25, 1.5);
        }
        if (newLod !== dynamicLodDistance) {
          setDynamicLodDistance(newLod);
        }
      }
    }
  });

  return { gl, scene, camera, fps: fpsRef };
}
