import { useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import birdsData from "../../data/birds.json";
import type { Bird } from "../../types";
import { latLngToVector3 } from "../../utils/coordinates";
import { useAppStore } from "../../store";

const birds = birdsData as Bird[];

const REGION_CENTERS: Record<
  string,
  { lat: number; lng: number; label: string; color: string }
> = {
  "north-america": {
    lat: 40,
    lng: -100,
    label: "North America",
    color: "#4CAF50",
  },
  "south-america": {
    lat: -15,
    lng: -60,
    label: "South America",
    color: "#FF9800",
  },
  europe: { lat: 50, lng: 10, label: "Europe", color: "#2196F3" },
  africa: { lat: 0, lng: 25, label: "Africa", color: "#F44336" },
  asia: { lat: 30, lng: 100, label: "Asia", color: "#9C27B0" },
  oceania: { lat: -25, lng: 135, label: "Oceania", color: "#00BCD4" },
  antarctica: { lat: -80, lng: 0, label: "Antarctica", color: "#607D8B" },
};

const CLUSTER_VISIBLE_DISTANCE = 4;

export function RegionClusters() {
  const { camera } = useThree();
  const setActiveRegion = useAppStore((s) => s.setActiveRegion);
  const setRegionFilterOpen = useAppStore((s) => s.setRegionFilterOpen);

  const lastVisibleRef = useRef<boolean | null>(null);
  const [showClusters, setShowClusters] = useState(false);

  useFrame(() => {
    const next = camera.position.length() > CLUSTER_VISIBLE_DISTANCE;
    if (lastVisibleRef.current === next) return;
    lastVisibleRef.current = next;
    setShowClusters(next);
  });

  const regionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const bird of birds) {
      counts[bird.region] = (counts[bird.region] || 0) + 1;
    }
    return counts;
  }, []);

  if (!showClusters) return null;

  return (
    <>
      {Object.entries(REGION_CENTERS).map(([region, center]) => {
        const pos = latLngToVector3(center.lat, center.lng, 1.04);
        const count = regionCounts[region] || 0;
        if (count === 0) return null;

        return (
          <group key={region}>
            <mesh position={pos}>
              <sphereGeometry args={[0.03, 16, 16]} />
              <meshStandardMaterial
                color={center.color}
                emissive={center.color}
                emissiveIntensity={0.5}
                transparent
                opacity={0.8}
              />
            </mesh>
            <Html position={[pos[0], pos[1] + 0.05, pos[2]]} center>
              <div
                role="button"
                tabIndex={0}
                onClick={() => {
                  setActiveRegion(region);
                  setRegionFilterOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActiveRegion(region);
                    setRegionFilterOpen(true);
                  }
                }}
                style={{
                  cursor: "pointer",
                  pointerEvents: "auto",
                  textAlign: "center",
                  padding: "4px 10px",
                  borderRadius: 12,
                  background: "rgba(0,0,0,0.6)",
                  backdropFilter: "blur(8px)",
                  border: `2px solid ${center.color}`,
                  whiteSpace: "nowrap",
                  minWidth: 56,
                  minHeight: 56,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 700, color: "white" }}>
                  {count}
                </span>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>
                  {center.label}
                </span>
              </div>
            </Html>
          </group>
        );
      })}
    </>
  );
}
