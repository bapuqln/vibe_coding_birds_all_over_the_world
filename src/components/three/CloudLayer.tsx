import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import type { Mesh } from "three";

export function CloudLayer() {
  const meshRef = useRef<Mesh>(null);
  const texture = useTexture("/textures/clouds.png");

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.0005;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.006, 64, 64]} />
      <meshStandardMaterial
        map={texture}
        transparent
        opacity={0.4}
        depthWrite={false}
        roughness={1}
        metalness={0}
      />
    </mesh>
  );
}
