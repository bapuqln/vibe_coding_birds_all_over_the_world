import { useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Mesh,
  ShaderMaterial,
  Vector3,
} from "three";
import { Html } from "@react-three/drei";
import { buildMigrationCurve } from "../../utils/migration";
import migrationsData from "../../data/migrations.json";
import birdsData from "../../data/birds.json";
import { useAppStore } from "../../store";
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
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vArc;
  void main() {
    float dash = mod(vArc * 8.0 - uTime * 0.3, 1.0);
    if (dash > 0.4) discard;
    gl_FragColor = vec4(uColor, (1.0 - dash) * uOpacity);
  }
`;

interface RouteLineProps {
  route: MigrationRoute;
  color?: string;
  opacity?: number;
}

function RouteLine({ route, color, opacity = 1.0 }: RouteLineProps) {
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

  const material = useMemo(() => {
    const c = new Color(color || "#fbbf24");
    return new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: c },
        uOpacity: { value: opacity },
      },
      transparent: true,
      depthWrite: false,
    });
  }, [color, opacity]);

  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = clock.elapsedTime;
      matRef.current.uniforms.uOpacity.value = opacity;
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

function getPointAtProgress(points: Vector3[], t: number): Vector3 {
  if (points.length === 0) return new Vector3();
  const clamped = ((t % 1) + 1) % 1;
  const exactIndex = clamped * (points.length - 1);
  const idx = Math.floor(exactIndex);
  const frac = exactIndex - idx;
  const nextIdx = Math.min(idx + 1, points.length - 1);
  return points[idx].clone().lerp(points[nextIdx], frac);
}

interface FlyingBirdIconProps {
  route: MigrationRoute;
}

function FlyingBirdIcon({ route }: FlyingBirdIconProps) {
  const mainRef = useRef<Mesh>(null);
  const trail1Ref = useRef<Mesh>(null);
  const trail2Ref = useRef<Mesh>(null);

  const points = useMemo(() => {
    const fromBird = birdMap.get(route.from);
    const toBird = birdMap.get(route.to);
    if (!fromBird || !toBird) return [];

    return buildMigrationCurve(
      [fromBird.lat, fromBird.lng],
      [toBird.lat, toBird.lng],
      1.0,
      64,
    );
  }, [route]);

  useFrame(({ clock }) => {
    if (points.length === 0) return;
    const t = (clock.elapsedTime % 3) / 3;

    const mainPos = getPointAtProgress(points, t);
    const trail1Pos = getPointAtProgress(points, t - 0.05);
    const trail2Pos = getPointAtProgress(points, t - 0.1);

    if (mainRef.current) mainRef.current.position.copy(mainPos);
    if (trail1Ref.current) trail1Ref.current.position.copy(trail1Pos);
    if (trail2Ref.current) trail2Ref.current.position.copy(trail2Pos);
  });

  if (points.length === 0) return null;

  return (
    <>
      <mesh ref={trail2Ref}>
        <sphereGeometry args={[0.005, 8, 6]} />
        <meshBasicMaterial
          color="#fbbf24"
          transparent
          opacity={0.2}
        />
      </mesh>
      <mesh ref={trail1Ref}>
        <sphereGeometry args={[0.006, 8, 6]} />
        <meshBasicMaterial
          color="#fbbf24"
          transparent
          opacity={0.4}
        />
      </mesh>
      <mesh ref={mainRef}>
        <sphereGeometry args={[0.008, 8, 6]} />
        <meshBasicMaterial color="#fbbf24" />
      </mesh>
    </>
  );
}

interface MigrationLabelProps {
  route: MigrationRoute;
}

function MigrationLabel({ route }: MigrationLabelProps) {
  const { camera } = useThree();
  const language = useAppStore((s) => s.language);
  const [showLabel, setShowLabel] = useState(
    () => camera.position.length() < 2.5,
  );
  const prevShowRef = useRef(showLabel);

  useFrame(() => {
    const shouldShow = camera.position.length() < 2.5;
    if (prevShowRef.current !== shouldShow) {
      prevShowRef.current = shouldShow;
      setShowLabel(shouldShow);
    }
  });

  const midpoint = useMemo(() => {
    if (route.migrationDistanceKm == null) return null;
    const fromBird = birdMap.get(route.from);
    const toBird = birdMap.get(route.to);
    if (!fromBird || !toBird) return null;

    const points = buildMigrationCurve(
      [fromBird.lat, fromBird.lng],
      [toBird.lat, toBird.lng],
      1.0,
      64,
    );
    const midIdx = Math.floor(points.length / 2);
    return points[midIdx];
  }, [route]);

  if (route.migrationDistanceKm == null || midpoint == null) return null;

  const dist = route.migrationDistanceKm;
  const distText = language === "zh" ? `${dist}千米` : `${dist}km`;

  return (
    <Html position={midpoint} center>
      <div
        style={{
          opacity: showLabel ? 1 : 0,
          pointerEvents: "none",
          transition: "opacity 0.2s ease",
        }}
      >
        <span
          style={{
            display: "inline-block",
            padding: "2px 8px",
            fontSize: "11px",
            fontWeight: 500,
            color: "white",
            backgroundColor: "rgba(0,0,0,0.6)",
            borderRadius: "9999px",
            whiteSpace: "nowrap",
          }}
        >
          ✈ {distText}
        </span>
      </div>
    </Html>
  );
}

const ROUTE_COLORS_FALLBACK = ["#fbbf24", "#f87171", "#34d399", "#a78bfa", "#fb923c", "#38bdf8"];

export function MigrationPaths() {
  const showAllRoutes = useAppStore((s) => s.showAllRoutes);
  const selectedBirdId = useAppStore((s) => s.selectedBirdId);

  const selectedRouteIds = useMemo(() => {
    if (!selectedBirdId) return new Set<string>();
    return new Set(
      migrations
        .filter((r) => r.from === selectedBirdId || r.to === selectedBirdId)
        .map((r) => r.id),
    );
  }, [selectedBirdId]);

  return (
    <group>
      {migrations.map((route, idx) => {
        const isSelected = selectedRouteIds.has(route.id);
        const visible = showAllRoutes || isSelected || !selectedBirdId;
        if (!visible) return null;

        const dimmed = showAllRoutes && selectedBirdId && !isSelected;
        const routeColor = route.color || (showAllRoutes ? ROUTE_COLORS_FALLBACK[idx % ROUTE_COLORS_FALLBACK.length] : undefined);

        return (
          <group key={route.id}>
            <RouteLine route={route} color={routeColor} opacity={dimmed ? 0.3 : 1.0} />
            <FlyingBirdIcon route={route} />
            <MigrationLabel route={route} />
          </group>
        );
      })}
    </group>
  );
}
