import * as THREE from "three";

export interface FlockParams {
  flockSize: number;
  speed: number;
  altitudeMin: number;
  altitudeMax: number;
  wanderRadius: number;
  separationDist: number;
  alignmentDist: number;
  cohesionDist: number;
}

export const DEFAULT_FLOCK_PARAMS: FlockParams = {
  flockSize: 6,
  speed: 0.004,
  altitudeMin: 0.03,
  altitudeMax: 0.07,
  wanderRadius: 0.2,
  separationDist: 0.02,
  alignmentDist: 0.06,
  cohesionDist: 0.08,
};

export interface FlockMember {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  phase: number;
}

export interface Flock {
  homePosition: THREE.Vector3;
  members: FlockMember[];
  params: FlockParams;
}

const _separation = new THREE.Vector3();
const _alignment = new THREE.Vector3();
const _cohesion = new THREE.Vector3();
const _wander = new THREE.Vector3();
const _temp = new THREE.Vector3();

function latLngToVec3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

export function createFlock(
  lat: number,
  lng: number,
  params: Partial<FlockParams> = {},
): Flock {
  const p = { ...DEFAULT_FLOCK_PARAMS, ...params };
  const home = latLngToVec3(lat, lng, 1.0);
  const members: FlockMember[] = [];

  for (let i = 0; i < p.flockSize; i++) {
    const offset = new THREE.Vector3(
      (Math.random() - 0.5) * 0.04,
      (Math.random() - 0.5) * 0.04,
      (Math.random() - 0.5) * 0.04,
    );
    const pos = home.clone().add(offset);
    const alt = p.altitudeMin + Math.random() * (p.altitudeMax - p.altitudeMin);
    pos.normalize().multiplyScalar(1.0 + alt);

    const vel = new THREE.Vector3(
      (Math.random() - 0.5) * p.speed,
      (Math.random() - 0.5) * p.speed * 0.3,
      (Math.random() - 0.5) * p.speed,
    );

    members.push({ position: pos, velocity: vel, phase: Math.random() * Math.PI * 2 });
  }

  return { homePosition: home, members, params: p };
}

export function updateFlock(flock: Flock, delta: number): void {
  const { members, params, homePosition } = flock;
  const count = members.length;

  for (let i = 0; i < count; i++) {
    const member = members[i];
    _separation.set(0, 0, 0);
    _alignment.set(0, 0, 0);
    _cohesion.set(0, 0, 0);
    let sepCount = 0;
    let alignCount = 0;
    let cohCount = 0;

    for (let j = 0; j < count; j++) {
      if (i === j) continue;
      const other = members[j];
      const dist = member.position.distanceTo(other.position);

      if (dist < params.separationDist && dist > 0) {
        _temp.subVectors(member.position, other.position).normalize().divideScalar(dist);
        _separation.add(_temp);
        sepCount++;
      }
      if (dist < params.alignmentDist) {
        _alignment.add(other.velocity);
        alignCount++;
      }
      if (dist < params.cohesionDist) {
        _cohesion.add(other.position);
        cohCount++;
      }
    }

    if (sepCount > 0) _separation.divideScalar(sepCount);
    if (alignCount > 0) _alignment.divideScalar(alignCount).sub(member.velocity);
    if (cohCount > 0) _cohesion.divideScalar(cohCount).sub(member.position);

    _wander.subVectors(homePosition, member.position);
    const homeDist = _wander.length();
    if (homeDist > params.wanderRadius) {
      _wander.normalize().multiplyScalar((homeDist - params.wanderRadius) * 0.01);
    } else {
      _wander.set(0, 0, 0);
    }

    member.velocity
      .add(_separation.multiplyScalar(1.5))
      .add(_alignment.multiplyScalar(1.0))
      .add(_cohesion.multiplyScalar(0.8))
      .add(_wander);

    const speed = member.velocity.length();
    if (speed > params.speed) {
      member.velocity.multiplyScalar(params.speed / speed);
    }
    if (speed < params.speed * 0.3) {
      member.velocity.normalize().multiplyScalar(params.speed * 0.3);
    }

    member.position.addScaledVector(member.velocity, delta * 60);

    const alt = member.position.length() - 1.0;
    if (alt < params.altitudeMin || alt > params.altitudeMax) {
      const targetAlt = THREE.MathUtils.clamp(alt, params.altitudeMin, params.altitudeMax);
      member.position.normalize().multiplyScalar(1.0 + targetAlt);
    }
  }
}
