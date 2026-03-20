import { Points, PointMaterial } from "@react-three/drei";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface StarLayerProps {
  count: number;
  minRadius: number;
  maxRadius: number;
  minSize: number;
  maxSize: number;
  rotationSpeed: number;
  color?: string;
}

function StarLayer({
  count,
  minRadius,
  maxRadius,
  minSize,
  maxSize,
  rotationSpeed,
  color = "#ffffff",
}: StarLayerProps) {
  const groupRef = useRef<THREE.Group>(null);

  const { positions, sizes } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = minRadius + Math.random() * (maxRadius - minRadius);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      sz[i] = minSize + Math.random() * (maxSize - minSize);
    }
    return { positions: pos, sizes: sz };
  }, [count, minRadius, maxRadius, minSize, maxSize]);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += rotationSpeed;
    }
  });

  return (
    <group ref={groupRef}>
      <Points
        positions={positions}
        sizes={sizes}
        stride={3}
        frustumCulled={false}
      >
        <PointMaterial
          transparent
          color={color}
          size={(minSize + maxSize) / 2}
          sizeAttenuation
          depthWrite={false}
          opacity={0.9}
        />
      </Points>
    </group>
  );
}

export function Starfield() {
  return (
    <group>
      {/* Far layer — many tiny stars */}
      <StarLayer
        count={3000}
        minRadius={15}
        maxRadius={20}
        minSize={0.03}
        maxSize={0.06}
        rotationSpeed={0.00002}
      />
      {/* Mid layer — medium stars */}
      <StarLayer
        count={1500}
        minRadius={10}
        maxRadius={15}
        minSize={0.05}
        maxSize={0.1}
        rotationSpeed={0.00005}
      />
      {/* Near layer — fewer larger stars */}
      <StarLayer
        count={500}
        minRadius={6}
        maxRadius={10}
        minSize={0.08}
        maxSize={0.15}
        rotationSpeed={0.0001}
      />
      {/* Warm-tinted stars */}
      <StarLayer
        count={150}
        minRadius={8}
        maxRadius={18}
        minSize={0.04}
        maxSize={0.09}
        rotationSpeed={0.00003}
        color="#fde68a"
      />
      {/* Cool-tinted stars */}
      <StarLayer
        count={100}
        minRadius={8}
        maxRadius={18}
        minSize={0.04}
        maxSize={0.09}
        rotationSpeed={0.00004}
        color="#bfdbfe"
      />
    </group>
  );
}
