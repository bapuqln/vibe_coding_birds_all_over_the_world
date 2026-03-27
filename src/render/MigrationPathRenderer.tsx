import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  TubeGeometry,
  ShaderMaterial,
  Color,
  DoubleSide,
  AdditiveBlending,
  BufferAttribute,
} from "three";
import type { Mesh } from "three";
import { useAppStore } from "../store";
import {
  getAllMigrationIntelligencePaths,
  getCurveForPath,
  isPathActiveInMonth,
} from "../domain/migration-paths";

const vertexShader = /* glsl */ `
  attribute float pathProgress;
  varying float vProgress;
  void main() {
    vProgress = pathProgress;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uHeadPosition;
  uniform float uOpacity;
  varying float vProgress;
  void main() {
    float dist = abs(vProgress - uHeadPosition);
    float tailFade = 1.0 - smoothstep(0.0, 0.4, dist);
    float headGlow = smoothstep(0.02, 0.0, dist) * 0.5;
    float alpha = (tailFade * 0.6 + headGlow) * uOpacity;
    vec3 color = uColor + headGlow * vec3(0.3);
    gl_FragColor = vec4(color, alpha);
  }
`;

function SinglePath({ pathIndex }: { pathIndex: number }) {
  const meshRef = useRef<Mesh>(null);
  const paths = useMemo(() => getAllMigrationIntelligencePaths(), []);
  const path = paths[pathIndex];

  const curve = useMemo(() => getCurveForPath(pathIndex), [pathIndex]);

  const { geo, mat } = useMemo(() => {
    const tubeGeo = new TubeGeometry(curve, 64, 0.003, 6, false);

    const count = tubeGeo.attributes.position.count;
    const progressArr = new Float32Array(count);
    const samplePoints = curve.getPoints(100);
    for (let i = 0; i < count; i++) {
      const px = tubeGeo.attributes.position.getX(i);
      const py = tubeGeo.attributes.position.getY(i);
      const pz = tubeGeo.attributes.position.getZ(i);

      let bestT = 0;
      let bestDist = Infinity;
      for (let s = 0; s < samplePoints.length; s++) {
        const sp = samplePoints[s];
        const dx = px - sp.x;
        const dy = py - sp.y;
        const dz = pz - sp.z;
        const d = dx * dx + dy * dy + dz * dz;
        if (d < bestDist) {
          bestDist = d;
          bestT = s / (samplePoints.length - 1);
        }
      }
      progressArr[i] = bestT;
    }
    tubeGeo.setAttribute("pathProgress", new BufferAttribute(progressArr, 1));

    const tubeMat = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uColor: { value: new Color(path.color) },
        uHeadPosition: { value: 0 },
        uOpacity: { value: 0 },
      },
      transparent: true,
      side: DoubleSide,
      blending: AdditiveBlending,
      depthWrite: false,
    });

    return { geo: tubeGeo, mat: tubeMat };
  }, [curve, path.color]);

  useFrame(() => {
    if (!mat) return;
    const timeState = useAppStore.getState().timeState;
    const active = isPathActiveInMonth(path, timeState.month);
    const targetOpacity = active ? 1.0 : 0.0;
    const current = mat.uniforms.uOpacity.value as number;
    mat.uniforms.uOpacity.value = current + (targetOpacity - current) * 0.05;

    if (active) {
      const monthOffset = path.season === "autumn"
        ? (timeState.month - 8)
        : (timeState.month - 2);
      const t = Math.max(0, Math.min(1, (monthOffset + timeState.progress) / 3));
      mat.uniforms.uHeadPosition.value = t;
    }
  });

  return <mesh ref={meshRef} geometry={geo} material={mat} />;
}

export function MigrationPathRenderer() {
  const paths = useMemo(() => getAllMigrationIntelligencePaths(), []);

  return (
    <group>
      {paths.map((_, i) => (
        <SinglePath key={i} pathIndex={i} />
      ))}
    </group>
  );
}
