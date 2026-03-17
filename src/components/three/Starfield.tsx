import { Points, PointMaterial } from "@react-three/drei";
import { useMemo } from "react";

export function Starfield() {
  const { positions, sizes } = useMemo(() => {
    const count = 2500;
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = 15 + Math.random() * 35;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      sz[i] = 0.04 + Math.random() * 0.08;
    }
    return { positions: pos, sizes: sz };
  }, []);

  return (
    <Points positions={positions} sizes={sizes} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#ffffff"
        size={0.08}
        sizeAttenuation
        depthWrite={false}
      />
    </Points>
  );
}
