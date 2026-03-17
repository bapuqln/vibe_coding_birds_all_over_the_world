import { BackSide, AdditiveBlending, ShaderMaterial } from "three";
import { useMemo } from "react";

const vertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vec3 viewDir = normalize(-vPosition);
    float intensity = pow(1.0 - dot(vNormal, viewDir), 2.5);
    gl_FragColor = vec4(0.3, 0.6, 1.0, intensity * 0.4);
  }
`;

export function Atmosphere() {
  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader,
        fragmentShader,
        side: BackSide,
        blending: AdditiveBlending,
        transparent: true,
        depthWrite: false,
      }),
    [],
  );

  return (
    <mesh scale={[1.06, 1.06, 1.06]}>
      <sphereGeometry args={[1, 64, 64]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}
