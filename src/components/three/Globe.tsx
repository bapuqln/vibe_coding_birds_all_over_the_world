import { useTexture } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import { MeshStandardMaterial } from "three";
import { useAppStore } from "../../store";

export function Globe() {
  const texture = useTexture("/textures/earth.jpg");
  const setGlobeReady = useAppStore((s) => s.setGlobeReady);

  useEffect(() => {
    if (texture) {
      setGlobeReady(true);
    }
  }, [texture, setGlobeReady]);

  const material = useMemo(() => {
    const mat = new MeshStandardMaterial({
      map: texture,
      emissive: "#112244",
      emissiveIntensity: 0.15,
      roughness: 0.8,
      metalness: 0.1,
    });

    mat.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <output_fragment>",
        `#include <output_fragment>
        vec3 rimViewDir = normalize(vViewPosition);
        float rim = pow(1.0 - abs(dot(vNormal, rimViewDir)), 5.0);
        gl_FragColor.rgb += vec3(0.4, 0.6, 1.0) * rim * 0.2;`,
      );
    };

    mat.needsUpdate = true;
    return mat;
  }, [texture]);

  return (
    <mesh>
      <sphereGeometry args={[1, 64, 64]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}
