import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BufferGeometry, Float32BufferAttribute, ShaderMaterial } from "three";
import { buildMigrationCurve } from "../../utils/migration";
import migrationsData from "../../data/migrations.json";
import birdsData from "../../data/birds.json";
import type { Bird, MigrationRoute } from "../../types";

const migrations = migrationsData as MigrationRoute[];
const birds = birdsData as Bird[];
const birdMap = new Map(birds.map((b) => [b.id, b]));

const vertexShader = `
  attribute float arcProgress;
  varying float vArc;
  void main() {
    vArc = arcProgress;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  varying float vArc;
  void main() {
    float dash = mod(vArc * 8.0 - uTime * 0.3, 1.0);
    if (dash > 0.4) discard;
    gl_FragColor = vec4(1.0, 0.84, 0.0, 1.0 - dash);
  }
`;

interface RouteLineProps {
  route: MigrationRoute;
}

function RouteLine({ route }: RouteLineProps) {
  const matRef = useRef<ShaderMaterial>(null);

  const geometry = useMemo(() => {
    const fromBird = birdMap.get(route.from);
    const toBird = birdMap.get(route.to);
    if (!fromBird || !toBird) return null;

    const points = buildMigrationCurve(
      [fromBird.lat, fromBird.lng],
      [toBird.lat, toBird.lng],
      1.0,
      64,
    );

    const geo = new BufferGeometry().setFromPoints(points);
    const arcProgress = new Float32Array(points.length);
    for (let i = 0; i < points.length; i++) {
      arcProgress[i] = i / (points.length - 1);
    }
    geo.setAttribute("arcProgress", new Float32BufferAttribute(arcProgress, 1));
    return geo;
  }, [route]);

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: { uTime: { value: 0 } },
        transparent: true,
        depthWrite: false,
      }),
    [],
  );

  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = clock.elapsedTime;
    }
  });

  if (!geometry) return null;

  return (
    // @ts-expect-error R3F extends line element
    <line geometry={geometry}>
      <primitive ref={matRef} object={material} attach="material" />
    </line>
  );
}

export function MigrationPaths() {
  return (
    <group>
      {migrations.map((route) => (
        <RouteLine key={route.id} route={route} />
      ))}
    </group>
  );
}
