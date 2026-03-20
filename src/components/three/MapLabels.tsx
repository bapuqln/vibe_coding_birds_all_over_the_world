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
  onClick,
}: {
  label: MapLabel;
  isOcean: boolean;
  onClick?: () => void;
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
  const interactive = !isOcean && onClick;

  return (
    <Html
      position={position}
      center
      distanceFactor={3}
      style={{ pointerEvents: interactive ? "auto" : "none" }}
    >
      <div
        ref={containerRef}
        onClick={interactive ? onClick : undefined}
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
          cursor: interactive ? "pointer" : "default",
          padding: interactive ? "4px 8px" : undefined,
          borderRadius: interactive ? "8px" : undefined,
        }}
        onMouseEnter={(e) => {
          if (interactive) {
            (e.currentTarget as HTMLDivElement).style.color = "rgba(255, 255, 255, 0.9)";
            (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.1)";
          }
        }}
        onMouseLeave={(e) => {
          if (interactive) {
            (e.currentTarget as HTMLDivElement).style.color = "rgba(255, 255, 255, 0.6)";
            (e.currentTarget as HTMLDivElement).style.background = "transparent";
          }
        }}
      >
        {text}
      </div>
    </Html>
  );
}

export function MapLabels() {
  const setContinentPanelRegion = useAppStore((s) => s.setContinentPanelRegion);

  return (
    <group>
      {continentLabels.map((label) => (
        <GlobeLabel
          key={label.id}
          label={label}
          isOcean={false}
          onClick={() => setContinentPanelRegion(label.id)}
        />
      ))}
      {oceanLabels.map((label) => (
        <GlobeLabel key={label.id} label={label} isOcean={true} />
      ))}
    </group>
  );
}
