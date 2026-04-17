import { useRef, useMemo, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import {
  ShaderMaterial,
  Vector3,
  AdditiveBlending,
  TextureLoader,
  Texture,
  type Mesh,
} from "three";
import { useAppStore } from "../../store";

const dayNightVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  void main() {
    vUv = uv;
    vNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const dayNightFragmentShader = `
  uniform sampler2D uDayMap;
  uniform vec3 uSunDirection;
  uniform float uHasNightMap;
  uniform sampler2D uNightMap;
  varying vec2 vUv;
  varying vec3 vNormal;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    vec3 normal = normalize(vNormal);
    float NdotL = dot(normal, uSunDirection);
    float dayFactor = smoothstep(-0.15, 0.25, NdotL);

    vec4 dayColor = texture2D(uDayMap, vUv);
    vec3 dayLit = dayColor.rgb * (0.25 + 0.75 * max(NdotL, 0.0));

    vec3 nightLit;
    if (uHasNightMap > 0.5) {
      vec4 nightColor = texture2D(uNightMap, vUv);
      nightLit = nightColor.rgb * 1.8 * (1.0 - dayFactor);
    } else {
      vec2 gridUv = vUv * vec2(360.0, 180.0);
      float city = hash(floor(gridUv * 2.0));
      city = step(0.82, city) * 0.6;
      float fineCity = hash(floor(gridUv * 8.0));
      city += step(0.9, fineCity) * 0.3;
      float landBrightness = dayColor.r * 0.3 + dayColor.g * 0.5 + dayColor.b * 0.2;
      float isLand = step(0.08, landBrightness) * step(landBrightness, 0.7);
      nightLit = vec3(1.0, 0.9, 0.6) * city * isLand * (1.0 - dayFactor);
    }

    vec3 ambientNight = vec3(0.015, 0.02, 0.04);
    vec3 finalColor = mix(nightLit + ambientNight, dayLit, dayFactor);
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

const SUN_ROTATION_SPEED = 0.02;

export function Globe() {
  const meshRef = useRef<Mesh>(null);
  const matRef = useRef<ShaderMaterial>(null);
  const sunAngleRef = useRef(0);

  const dayTexture = useTexture("/textures/earth.jpg");
  const setGlobeReady = useAppStore((s) => s.setGlobeReady);
  const [nightTextureState, setNightTextureState] = useState<{
    texture: Texture | null;
    loaded: boolean;
  }>({ texture: null, loaded: false });

  useEffect(() => {
    if (dayTexture) setGlobeReady(true);
  }, [dayTexture, setGlobeReady]);

  useEffect(() => {
    const loader = new TextureLoader();
    let loaded: Texture | null = null;
    let cancelled = false;
    loader.load(
      "/textures/earth_night.jpg",
      (tex) => {
        if (cancelled) {
          tex.dispose();
          return;
        }
        loaded = tex;
        setNightTextureState({ texture: tex, loaded: true });
      },
      undefined,
      () => {
        if (!cancelled) setNightTextureState({ texture: null, loaded: true });
      },
    );
    return () => {
      cancelled = true;
      if (loaded) loaded.dispose();
    };
  }, []);

  const material = useMemo(() => {
    return new ShaderMaterial({
      vertexShader: dayNightVertexShader,
      fragmentShader: dayNightFragmentShader,
      uniforms: {
        uDayMap: { value: dayTexture },
        uSunDirection: { value: new Vector3(1, 0.3, 0.5).normalize() },
        uHasNightMap: { value: nightTextureState.texture ? 1.0 : 0.0 },
        uNightMap: { value: nightTextureState.texture || dayTexture },
      },
    });
  }, [dayTexture, nightTextureState]);

  useEffect(() => () => material.dispose(), [material]);

  useFrame((_, delta) => {
    if (!matRef.current) return;
    sunAngleRef.current += delta * SUN_ROTATION_SPEED;
    const sunDir = new Vector3(
      Math.cos(sunAngleRef.current),
      0.3,
      Math.sin(sunAngleRef.current),
    ).normalize();
    matRef.current.uniforms.uSunDirection.value.copy(sunDir);
  });

  return (
    <>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 80, 80]} />
        <primitive ref={matRef} object={material} attach="material" />
      </mesh>
      <CityLightsGlow matRef={matRef} />
    </>
  );
}

function CityLightsGlow({ matRef }: { matRef: React.RefObject<ShaderMaterial | null> }) {
  const glowMatRef = useRef<ShaderMaterial>(null);

  const glowMaterial = useMemo(() => {
    return new ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uSunDirection;
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vec3 viewDir = normalize(-vPosition);
          vec3 worldNormal = normalize(vNormal);
          float NdotL = dot(worldNormal, uSunDirection);
          float nightFactor = smoothstep(0.1, -0.3, NdotL);
          float rim = pow(1.0 - abs(dot(worldNormal, viewDir)), 4.0);
          vec3 warmGlow = vec3(1.0, 0.85, 0.5) * rim * nightFactor * 0.15;
          gl_FragColor = vec4(warmGlow, rim * nightFactor * 0.1);
        }
      `,
      uniforms: {
        uSunDirection: { value: new Vector3(1, 0.3, 0.5).normalize() },
      },
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    });
  }, []);

  useEffect(() => () => glowMaterial.dispose(), [glowMaterial]);

  useFrame(() => {
    if (glowMatRef.current && matRef.current) {
      glowMatRef.current.uniforms.uSunDirection.value.copy(
        matRef.current.uniforms.uSunDirection.value,
      );
    }
  });

  return (
    <mesh scale={[1.003, 1.003, 1.003]}>
      <sphereGeometry args={[1, 64, 64]} />
      <primitive ref={glowMatRef} object={glowMaterial} attach="material" />
    </mesh>
  );
}
