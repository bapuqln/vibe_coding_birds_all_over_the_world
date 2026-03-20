import { useMemo } from "react";
import { ShaderMaterial, DataTexture, RGBAFormat, FloatType } from "three";
import { useAppStore } from "../../store";
import birdsData from "../../data/birds.json";
import type { Bird } from "../../types";

const birds = birdsData as Bird[];
const HEATMAP_RADIUS = 1.008;
const TEX_SIZE = 256;

function generateHeatmapTexture(): DataTexture {
  const data = new Float32Array(TEX_SIZE * TEX_SIZE * 4);
  const sigma = 12;

  const birdPixels = birds.map((b) => {
    const u = ((b.lng + 180) / 360) * TEX_SIZE;
    const v = ((90 - b.lat) / 180) * TEX_SIZE;
    return { u, v };
  });

  for (let y = 0; y < TEX_SIZE; y++) {
    for (let x = 0; x < TEX_SIZE; x++) {
      let density = 0;
      for (const bp of birdPixels) {
        const dx = x - bp.u;
        const dy = y - bp.v;
        density += Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma));
      }

      const idx = (y * TEX_SIZE + x) * 4;
      const t = Math.min(density / 1.5, 1.0);

      let r: number, g: number, b: number;
      if (t < 0.33) {
        const f = t / 0.33;
        r = 0;
        g = f * 0.5;
        b = 0.6 * (1 - f) + 0.3 * f;
      } else if (t < 0.66) {
        const f = (t - 0.33) / 0.33;
        r = f * 0.8;
        g = 0.5 + f * 0.3;
        b = 0.3 * (1 - f);
      } else {
        const f = (t - 0.66) / 0.34;
        r = 0.8 + f * 0.2;
        g = 0.8 * (1 - f) + 0.2;
        b = 0;
      }

      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = t * 0.45;
    }
  }

  const tex = new DataTexture(data, TEX_SIZE, TEX_SIZE, RGBAFormat, FloatType);
  tex.needsUpdate = true;
  return tex;
}

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D uHeatmap;
  uniform float uOpacity;
  varying vec2 vUv;
  void main() {
    vec4 hm = texture2D(uHeatmap, vUv);
    gl_FragColor = vec4(hm.rgb, hm.a * uOpacity);
  }
`;

export function HeatmapLayer() {
  const heatmapVisible = useAppStore((s) => s.heatmapVisible);

  const material = useMemo(() => {
    const tex = generateHeatmapTexture();
    return new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uHeatmap: { value: tex },
        uOpacity: { value: 1.0 },
      },
      transparent: true,
      depthWrite: false,
    });
  }, []);

  if (!heatmapVisible) return null;

  return (
    <mesh>
      <sphereGeometry args={[HEATMAP_RADIUS, 64, 32]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}
