import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  SphereGeometry,
  ShaderMaterial,
  Color,
  BackSide,
  AdditiveBlending,
} from "three";
import type { Mesh } from "three";
import { useAppStore } from "../store";
import { isMigrationSeason, getSeasonForMonth } from "../core/TimeController";

const SEASON_COLORS: Record<string, { north: string; south: string }> = {
  winter: { north: "#1a3a5c", south: "#2d5a3d" },
  spring: { north: "#3d6b4f", south: "#4a7a5e" },
  summer: { north: "#4a8c5a", south: "#3d6b4f" },
  autumn: { north: "#8b6914", south: "#4a7a5e" },
};

const vertexShader = /* glsl */ `
  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uNorthTint;
  uniform vec3 uSouthTint;
  uniform float uIntensity;
  uniform float uMigrationGlow;
  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  void main() {
    float hemisphere = smoothstep(-0.3, 0.3, vWorldPosition.y);
    vec3 tint = mix(uSouthTint, uNorthTint, hemisphere);
    float rim = 1.0 - abs(dot(vNormal, normalize(cameraPosition - vWorldPosition)));
    float alpha = uIntensity * 0.15 * rim;
    alpha += uMigrationGlow * 0.05 * rim;
    gl_FragColor = vec4(tint, alpha);
  }
`;

export function SeasonOverlay() {
  const meshRef = useRef<Mesh>(null);

  const geometry = useMemo(() => new SphereGeometry(1.005, 48, 48), []);

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uNorthTint: { value: new Color(SEASON_COLORS.spring.north) },
          uSouthTint: { value: new Color(SEASON_COLORS.spring.south) },
          uIntensity: { value: 0 },
          uMigrationGlow: { value: 0 },
        },
        transparent: true,
        side: BackSide,
        blending: AdditiveBlending,
        depthWrite: false,
      }),
    [],
  );

  useFrame(() => {
    if (!material) return;
    const timeState = useAppStore.getState().timeState;
    const season = getSeasonForMonth(timeState.month);
    const colors = SEASON_COLORS[season];

    const targetNorth = new Color(colors.north);
    const targetSouth = new Color(colors.south);
    const currentNorth = material.uniforms.uNorthTint.value as Color;
    const currentSouth = material.uniforms.uSouthTint.value as Color;

    currentNorth.lerp(targetNorth, 0.02);
    currentSouth.lerp(targetSouth, 0.02);

    const targetIntensity = 1.0;
    const currentIntensity = material.uniforms.uIntensity.value as number;
    material.uniforms.uIntensity.value =
      currentIntensity + (targetIntensity - currentIntensity) * 0.03;

    const migrating = isMigrationSeason(timeState.month);
    const targetMigGlow = migrating ? 1.0 : 0.0;
    const currentMigGlow = material.uniforms.uMigrationGlow.value as number;
    material.uniforms.uMigrationGlow.value =
      currentMigGlow + (targetMigGlow - currentMigGlow) * 0.03;
  });

  return <mesh ref={meshRef} geometry={geometry} material={material} />;
}
