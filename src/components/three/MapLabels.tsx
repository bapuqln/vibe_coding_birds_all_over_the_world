import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { latLngToVector3 } from "../../utils/coordinates";
import { useAppStore } from "../../store";
import {
  continentLabels,
  oceanLabels,
  type MapLabel,
} from "../../data/labels";

const LABEL_RADIUS = 1.02;
const FADE_IN_DISTANCE = 2.2;
const FULL_VISIBLE_DISTANCE = 1.6;

function GlobeLabel({
  label,
  isOcean,
}: {
  label: MapLabel;
  isOcean: boolean;
}) {
  const language = useAppStore((s) => s.language);
  const containerRef = useRef<HTMLDivElement>(null);
  const { camera } = useThree();

  const position = latLngToVector3(label.lat, label.lng, LABEL_RADIUS);

  useFrame(() => {
    if (!containerRef.current) return;
    const dist = camera.position.length();
    let opacity = 0;
    if (dist < FULL_VISIBLE_DISTANCE) {
      opacity = 1;
    } else if (dist < FADE_IN_DISTANCE) {
      opacity =
        1 - (dist - FULL_VISIBLE_DISTANCE) / (FADE_IN_DISTANCE - FULL_VISIBLE_DISTANCE);
    }
    containerRef.current.style.opacity = String(opacity);
    containerRef.current.style.display = opacity < 0.01 ? "none" : "block";
  });

  const text = language === "zh" ? label.nameZh : label.nameEn;

  return (
    <Html
      position={position}
      center
      distanceFactor={3}
      style={{ pointerEvents: "none" }}
    >
      <div
        ref={containerRef}
        style={{
          color: isOcean ? "rgba(120, 180, 255, 0.5)" : "rgba(255, 255, 255, 0.6)",
          fontSize: isOcean ? "9px" : "11px",
          fontWeight: 600,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
          textShadow: "0 1px 3px rgba(0,0,0,0.5)",
          userSelect: "none",
          opacity: 0,
          transition: "opacity 0.3s",
        }}
      >
        {text}
      </div>
    </Html>
  );
}

export function MapLabels() {
  return (
    <group>
      {continentLabels.map((label) => (
        <GlobeLabel key={label.id} label={label} isOcean={false} />
      ))}
      {oceanLabels.map((label) => (
        <GlobeLabel key={label.id} label={label} isOcean={true} />
      ))}
    </group>
  );
}
