import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useAppStore } from "../../store";
import biomesData from "../../data/biomes.json";
import type { BiomeZone } from "../../types";

const biomes = biomesData as BiomeZone[];

function latLngToVec3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

function BiomeParticles({ biome }: { biome: BiomeZone }) {
  const ref = useRef<THREE.Points>(null);
  const count = 40;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const lat = biome.centerLat + (Math.random() - 0.5) * biome.radius * 0.8;
      const lng = biome.centerLng + (Math.random() - 0.5) * biome.radius * 0.8;
      const alt = 1.02 + Math.random() * 0.06;
      const pos = latLngToVec3(lat, lng, alt);
      arr[i * 3] = pos.x;
      arr[i * 3 + 1] = pos.y;
      arr[i * 3 + 2] = pos.z;
    }
    return arr;
  }, [biome]);

  const color = useMemo(() => new THREE.Color(biome.color), [biome.color]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const geo = ref.current.geometry;
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      let y = pos.getY(i);
      if (biome.particleType === "snow") {
        y -= delta * 0.01;
        if (y < -0.5) y = 1.5;
      } else if (biome.particleType === "leaves") {
        y -= delta * 0.005;
        if (y < -0.5) y = 1.5;
        pos.setX(i, pos.getX(i) + Math.sin(Date.now() * 0.001 + i) * delta * 0.002);
      } else if (biome.particleType === "dust") {
        pos.setX(i, pos.getX(i) + Math.sin(Date.now() * 0.0005 + i) * delta * 0.003);
      }
      pos.setY(i, y);
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={0.008}
        transparent
        opacity={0.6}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export function BiomeEffects() {
  const weatherVisible = useAppStore((s) => s.weatherVisible);

  if (!weatherVisible) return null;

  return (
    <group>
      {biomes.map((biome) => (
        <BiomeParticles key={biome.id} biome={biome} />
      ))}
    </group>
  );
}
