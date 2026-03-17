import { useFrame } from "@react-three/fiber";
import { useAppStore } from "../store";
import { tickTime } from "./TimeController";

export function AnimationScheduler() {
  const timeState = useAppStore((s) => s.timeState);
  const setTimeState = useAppStore((s) => s.setTimeState);

  useFrame((_, delta) => {
    const clamped = Math.min(delta, 0.1);
    const next = tickTime(timeState, clamped);
    if (next !== timeState) {
      setTimeState(next);
    }
  });

  return null;
}
