import { useMemo, useState, useEffect } from "react";
import { BufferGeometry, Float32BufferAttribute } from "three";
import { latLngToVector3 } from "../../utils/coordinates";

const BORDER_RADIUS = 1.001;

export function CountryBorders() {
  const [borderData, setBorderData] = useState<number[][][] | null>(null);

  useEffect(() => {
    fetch("/data/country-borders.json")
      .then((r) => r.json())
      .then(setBorderData)
      .catch(() => {});
  }, []);

  const geometry = useMemo(() => {
    if (!borderData) return null;

    const positions: number[] = [];

    for (const ring of borderData) {
      for (let i = 0; i < ring.length - 1; i++) {
        const [lng1, lat1] = ring[i];
        const [lng2, lat2] = ring[i + 1];
        const p1 = latLngToVector3(lat1, lng1, BORDER_RADIUS);
        const p2 = latLngToVector3(lat2, lng2, BORDER_RADIUS);
        positions.push(...p1, ...p2);
      }
    }

    const geo = new BufferGeometry();
    geo.setAttribute(
      "position",
      new Float32BufferAttribute(new Float32Array(positions), 3),
    );
    return geo;
  }, [borderData]);

  if (!geometry) return null;

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial
        color="white"
        transparent
        opacity={0.15}
        depthWrite={false}
      />
    </lineSegments>
  );
}
