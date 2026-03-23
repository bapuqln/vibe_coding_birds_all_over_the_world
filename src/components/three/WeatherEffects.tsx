import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getAllWeather } from "../../systems/WeatherSystem";
import { useAppStore } from "../../store";

const REGION_CENTERS: Record<string, [number, number]> = {
  asia: [35, 105],
  europe: [50, 15],
  africa: [5, 25],
  "north-america": [40, -100],
  "south-america": [-15, -60],
  oceania: [-25, 135],
  antarctica: [-80, 0],
};

function latLngToVec3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

function CloudCluster({ position, intensity }: { position: THREE.Vector3; intensity: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const count = Math.floor(3 + intensity * 5);

  const offsets = useMemo(() => {
    const arr: THREE.Vector3[] = [];
    for (let i = 0; i < count; i++) {
      arr.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.08,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.08,
        ),
      );
    }
    return arr;
  }, [count]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        child.position.x += Math.sin(Date.now() * 0.0003 + i) * delta * 0.002;
      });
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {offsets.map((offset, i) => (
        <mesh key={i} position={offset}>
          <sphereGeometry args={[0.015 + Math.random() * 0.01, 8, 6]} />
          <meshStandardMaterial
            color="#e8e8e8"
            transparent
            opacity={0.25 * intensity}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

function RainParticles({ position, intensity }: { position: THREE.Vector3; intensity: number }) {
  const meshRef = useRef<THREE.Points>(null);
  const count = Math.floor(20 * intensity);

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 0.1;
      pos[i * 3 + 1] = Math.random() * 0.08;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
      vel[i] = 0.02 + Math.random() * 0.03;
    }
    return { positions: pos, velocities: vel };
  }, [count]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const posAttr = meshRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] -= velocities[i] * delta;
      if (arr[i * 3 + 1] < -0.02) {
        arr[i * 3 + 1] = 0.08;
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={meshRef} position={position}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#8ab4f8"
        size={0.003}
        transparent
        opacity={0.5 * intensity}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

function StormEffect({ position, intensity }: { position: THREE.Vector3; intensity: number }) {
  const flashRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!flashRef.current) return;
    const flash = Math.random() < 0.003 * intensity ? 0.6 : 0;
    (flashRef.current.material as THREE.MeshBasicMaterial).opacity = flash;
  });

  return (
    <group position={position}>
      <CloudCluster position={new THREE.Vector3(0, 0, 0)} intensity={intensity} />
      <mesh ref={flashRef}>
        <sphereGeometry args={[0.04, 8, 6]} />
        <meshBasicMaterial
          color="#ffffcc"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

export function WeatherEffects() {
  const weatherVisible = useAppStore((s) => s.weatherVisible);
  if (!weatherVisible) return null;

  const weatherRegions = getAllWeather();

  return (
    <>
      {weatherRegions.map((rw) => {
        const center = REGION_CENTERS[rw.region];
        if (!center) return null;
        const pos = latLngToVec3(center[0], center[1], 1.04);

        if (rw.weather === "stormy") {
          return <StormEffect key={rw.region} position={pos} intensity={rw.intensity} />;
        }
        if (rw.weather === "rainy") {
          return (
            <group key={rw.region}>
              <CloudCluster position={pos} intensity={rw.intensity} />
              <RainParticles position={pos} intensity={rw.intensity} />
            </group>
          );
        }
        if (rw.weather === "cloudy") {
          return <CloudCluster key={rw.region} position={pos} intensity={rw.intensity} />;
        }
        return null;
      })}
    </>
  );
}
