import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const PARTICLE_COUNT = 10;
const MIN_RADIUS = 1.15;
const MAX_RADIUS = 1.5;

interface ParticleData {
  radius: number;
  speed: number;
  phaseOffset: number;
  inclination: number;
  size: number;
}

export function BirdParticles() {
  const groupRef = useRef<THREE.Group>(null);

  const particles = useMemo<ParticleData[]>(() => {
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      radius: MIN_RADIUS + Math.random() * (MAX_RADIUS - MIN_RADIUS),
      speed: 0.08 + Math.random() * 0.12,
      phaseOffset: (i / PARTICLE_COUNT) * Math.PI * 2 + Math.random() * 0.5,
      inclination: (Math.random() - 0.5) * Math.PI * 0.6,
      size: 0.004 + Math.random() * 0.004,
    }));
  }, []);

  const positions = useMemo(() => new Float32Array(PARTICLE_COUNT * 3), []);
  const pointsRef = useRef<THREE.Points>(null);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const t = clock.elapsedTime;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = particles[i];
      const angle = t * p.speed + p.phaseOffset;
      const bob = Math.sin(t * 0.5 + p.phaseOffset) * 0.02;

      const x = p.radius * Math.cos(angle) * Math.cos(p.inclination);
      const y = p.radius * Math.sin(p.inclination) + bob;
      const z = p.radius * Math.sin(angle) * Math.cos(p.inclination);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }

    const geo = pointsRef.current.geometry;
    geo.attributes.position.needsUpdate = true;
  });

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <group ref={groupRef}>
      <points ref={pointsRef} geometry={geometry} frustumCulled={false}>
        <pointsMaterial
          color="#fde68a"
          size={0.008}
          sizeAttenuation
          transparent
          opacity={0.6}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
