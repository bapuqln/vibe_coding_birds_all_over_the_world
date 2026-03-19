import { useTexture } from "@react-three/drei";
import { useEffect } from "react";
import { useAppStore } from "../../store";

export function Globe() {
  const texture = useTexture("/textures/earth.jpg");
  const setGlobeReady = useAppStore((s) => s.setGlobeReady);

  useEffect(() => {
    if (texture) {
      setGlobeReady(true);
    }
  }, [texture, setGlobeReady]);

  return (
    <mesh>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial
        map={texture}
        emissive="#112244"
        emissiveIntensity={0.15}
        roughness={0.8}
        metalness={0.1}
      />
    </mesh>
  );
}
