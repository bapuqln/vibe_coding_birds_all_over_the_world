import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BackSide, AdditiveBlending, ShaderMaterial } from "three";
import type { Mesh } from "three";

const vertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const outerFragmentShader = `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vec3 viewDir = normalize(-vPosition);
    float fresnel = pow(1.0 - abs(dot(vNormal, viewDir)), 3.0);
    float pulse = 1.0 + 0.05 * sin(uTime * 0.785);
    vec3 color = mix(vec3(0.25, 0.55, 1.0), vec3(0.4, 0.7, 1.0), fresnel);
    gl_FragColor = vec4(color, fresnel * 0.25 * pulse);
  }
`;

const innerFragmentShader = `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vec3 viewDir = normalize(-vPosition);
    float fresnel = pow(1.0 - abs(dot(vNormal, viewDir)), 1.8);
    float pulse = 1.0 + 0.03 * sin(uTime * 0.785 + 1.57);
    vec3 warmColor = vec3(0.5, 0.7, 1.0);
    vec3 coolColor = vec3(0.2, 0.4, 0.9);
    vec3 color = mix(coolColor, warmColor, fresnel * 0.6);
    gl_FragColor = vec4(color, fresnel * 0.15 * pulse);
  }
`;

export function AtmosphereShell() {
  const outerRef = useRef<Mesh>(null);
  const innerRef = useRef<Mesh>(null);

  const outerMaterial = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader,
        fragmentShader: outerFragmentShader,
        uniforms: { uTime: { value: 0 } },
        side: BackSide,
        blending: AdditiveBlending,
        transparent: true,
        depthWrite: false,
      }),
    [],
  );

  const innerMaterial = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader,
        fragmentShader: innerFragmentShader,
        uniforms: { uTime: { value: 0 } },
        side: BackSide,
        blending: AdditiveBlending,
        transparent: true,
        depthWrite: false,
      }),
    [],
  );

  useFrame(({ clock }) => {
    outerMaterial.uniforms.uTime.value = clock.elapsedTime;
    innerMaterial.uniforms.uTime.value = clock.elapsedTime;
  });

  return (
    <>
      <mesh ref={innerRef} scale={[1.015, 1.015, 1.015]}>
        <sphereGeometry args={[1, 64, 64]} />
        <primitive object={innerMaterial} attach="material" />
      </mesh>
      <mesh ref={outerRef} scale={[1.035, 1.035, 1.035]}>
        <sphereGeometry args={[1, 64, 64]} />
        <primitive object={outerMaterial} attach="material" />
      </mesh>
    </>
  );
}
