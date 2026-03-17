import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { Vector3 } from "three";
import { latLngToVector3 } from "../../utils/coordinates";
import { useAppStore } from "../../store";
import {
  continentLabels,
  oceanLabels,
  type MapLabel,
} from "../../data/labels";

const LABEL_RADIUS = 1.02;

const MAJOR_LABEL_IDS = new Set(["north-america", "europe", "asia"]);

const LOD_HIDE_ALL = 4.0;
const LOD_MAJOR_ONLY = 3.0;

function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}

const _labelDir = new Vector3();
const _camDir = new Vector3();

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

  const position = useMemo(
    () => latLngToVector3(label.lat, label.lng, LABEL_RADIUS),
    [label.lat, label.lng],
  );

  const isMajor = MAJOR_LABEL_IDS.has(label.id);

  useFrame(() => {
    if (!containerRef.current) return;

    const dist = camera.position.length();

    // LOD: hide all labels when very far
    if (dist > LOD_HIDE_ALL) {
      containerRef.current.style.opacity = "0";
      containerRef.current.style.display = "none";
      return;
    }

    // LOD: show only major continent labels at medium distance
    if (dist > LOD_MAJOR_ONLY && !isMajor) {
      containerRef.current.style.opacity = "0";
      containerRef.current.style.display = "none";
      return;
    }

    // Backside occlusion + horizon fade
    _labelDir.set(position[0], position[1], position[2]).normalize();
    _camDir.copy(camera.position).normalize();
    const dot = _labelDir.dot(_camDir);

    // Fully behind the globe
    if (dot < 0) {
      containerRef.current.style.opacity = "0";
      containerRef.current.style.display = "none";
      return;
    }

    // Horizon fade: smooth transition from edge to front
    const occlusionOpacity = clamp((dot - 0.05) / 0.2, 0, 1);

    // Distance-based scaling
    const scale = clamp(2 / dist, 0.6, 1.4);

    containerRef.current.style.opacity = String(occlusionOpacity);
    containerRef.current.style.display = occlusionOpacity < 0.01 ? "none" : "block";
    containerRef.current.style.transform = `scale(${scale})`;
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
          transition: "color 0.2s, background 0.2s",
          cursor: interactive ? "pointer" : "default",
          padding: interactive ? "4px 8px" : undefined,
          borderRadius: interactive ? "8px" : undefined,
          transformOrigin: "center center",
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
