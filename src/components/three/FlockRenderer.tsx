import { useRef, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import birdsData from "../../data/birds.json";
import type { Bird } from "../../types";
import {
  createFlock,
  updateFlock,
  type Flock,
  type FlockParams,
} from "../../systems/FlockingSystem";

const birds = birdsData as Bird[];

const SPECIES_FLOCK_PARAMS: Record<string, Partial<FlockParams>> = {
  eagle: { flockSize: 3, speed: 0.005, altitudeMin: 0.05, altitudeMax: 0.1, wanderRadius: 0.25 },
  owl: { flockSize: 2, speed: 0.002, altitudeMin: 0.03, altitudeMax: 0.06, wanderRadius: 0.1 },
  parrot: { flockSize: 8, speed: 0.006, altitudeMin: 0.03, altitudeMax: 0.07, wanderRadius: 0.2 },
  penguin: { flockSize: 10, speed: 0.002, altitudeMin: 0.02, altitudeMax: 0.03, wanderRadius: 0.08 },
  flamingo: { flockSize: 7, speed: 0.003, altitudeMin: 0.03, altitudeMax: 0.05, wanderRadius: 0.15 },
  duck: { flockSize: 6, speed: 0.004, altitudeMin: 0.03, altitudeMax: 0.06, wanderRadius: 0.15 },
  sparrow: { flockSize: 12, speed: 0.007, altitudeMin: 0.02, altitudeMax: 0.05, wanderRadius: 0.18 },
  default: { flockSize: 5, speed: 0.004, altitudeMin: 0.03, altitudeMax: 0.07, wanderRadius: 0.15 },
};

function getFlockParams(bird: Bird): Partial<FlockParams> {
  const silhouette = bird.silhouette || "";
  for (const key of Object.keys(SPECIES_FLOCK_PARAMS)) {
    if (silhouette.includes(key)) return SPECIES_FLOCK_PARAMS[key];
  }
  return SPECIES_FLOCK_PARAMS.default;
}

const MAX_FLOCKS = 8;

const birdGeometry = new THREE.ConeGeometry(0.004, 0.012, 4);
birdGeometry.rotateX(Math.PI / 2);

const birdMaterial = new THREE.MeshBasicMaterial({
  color: "#334155",
  transparent: true,
  opacity: 0.7,
});

const _matrix = new THREE.Matrix4();
const _position = new THREE.Vector3();
const _quaternion = new THREE.Quaternion();
const _scale = new THREE.Vector3(1, 1, 1);
const _direction = new THREE.Vector3();

function SingleFlock({ flock }: { flock: Flock }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const frameCount = useRef(0);

  useFrame((_, delta) => {
    frameCount.current++;
    if (frameCount.current % 2 === 0) {
      updateFlock(flock, delta);
    }

    if (!meshRef.current) return;
    for (let i = 0; i < flock.members.length; i++) {
      const m = flock.members[i];
      _position.copy(m.position);
      _direction.copy(m.velocity).normalize();
      if (_direction.lengthSq() > 0.0001) {
        _quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), _direction);
      }
      const wingFlap = 1 + Math.sin(Date.now() * 0.01 + m.phase) * 0.15;
      _scale.set(wingFlap, 1, 1);
      _matrix.compose(_position, _quaternion, _scale);
      meshRef.current.setMatrixAt(i, _matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[birdGeometry, birdMaterial, flock.members.length]}
      frustumCulled={false}
    />
  );
}

export function FlockRenderer() {
  const { camera } = useThree();
  const flocksRef = useRef<Flock[]>([]);
  const visibleFlocks = useRef<Flock[]>([]);
  const frameCount = useRef(0);

  useEffect(() => {
    const uniqueRegions = new Map<string, Bird>();
    for (const bird of birds) {
      const key = bird.region;
      if (!uniqueRegions.has(key)) {
        uniqueRegions.set(key, bird);
      }
    }

    const flocks: Flock[] = [];
    for (const [, bird] of uniqueRegions) {
      const params = getFlockParams(bird);
      flocks.push(createFlock(bird.lat, bird.lng, params));
    }
    flocksRef.current = flocks;
  }, []);

  useFrame(() => {
    frameCount.current++;
    if (frameCount.current % 30 !== 0) return;

    const sorted = flocksRef.current
      .map((f) => ({ flock: f, dist: camera.position.distanceTo(f.homePosition) }))
      .sort((a, b) => a.dist - b.dist);

    visibleFlocks.current = sorted.slice(0, MAX_FLOCKS).map((s) => s.flock);
  });

  const initialFlocks = useMemo(() => {
    const uniqueRegions = new Map<string, Bird>();
    for (const bird of birds) {
      if (!uniqueRegions.has(bird.region)) {
        uniqueRegions.set(bird.region, bird);
      }
    }
    const flocks: Flock[] = [];
    for (const [, bird] of uniqueRegions) {
      flocks.push(createFlock(bird.lat, bird.lng, getFlockParams(bird)));
    }
    return flocks.slice(0, MAX_FLOCKS);
  }, []);

  const displayFlocks = visibleFlocks.current.length > 0
    ? visibleFlocks.current
    : initialFlocks;

  return (
    <>
      {displayFlocks.map((flock, i) => (
        <SingleFlock key={i} flock={flock} />
      ))}
    </>
  );
}
