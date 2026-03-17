import { useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  Float32BufferAttribute,
  Mesh,
  ShaderMaterial,
  Vector3,
} from "three";
import { Html } from "@react-three/drei";
import { latLngToVector3 } from "../../utils/coordinates";
import { useAppStore } from "../../store";
import journeysData from "../../data/migration-journeys.json";
import type { MigrationJourney } from "../../types";

const journeys = journeysData as MigrationJourney[];

const GLOBE_RADIUS = 1.0;
const LOD_DISTANCE = 3.0;

const journeyVertexShader = `
  attribute float arcProgress;
  varying float vArc;
  void main() {
    vArc = arcProgress;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const journeyFragmentShader = `
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vArc;
  void main() {
    float flow = mod(vArc * 6.0 - uTime * 0.4, 1.0);
    float glow = smoothstep(0.5, 0.0, flow) * 0.7 + 0.3;
    float pulse = sin(uTime * 2.0) * 0.1 + 0.9;
    gl_FragColor = vec4(uColor * glow * pulse, (1.0 - flow * 0.6) * uOpacity);
  }
`;

function buildJourneyCurve(stops: { lat: number; lng: number }[]): {
  curve: CatmullRomCurve3;
  points: Vector3[];
} {
  const controlPoints = stops.map((s) => {
    const [x, y, z] = latLngToVector3(s.lat, s.lng, GLOBE_RADIUS);
    return new Vector3(x, y, z);
  });

  const elevated = controlPoints.map((p, i) => {
    if (i === 0 || i === controlPoints.length - 1) return p.clone();
    return p.clone().normalize().multiplyScalar(GLOBE_RADIUS + 0.03);
  });

  const curve = new CatmullRomCurve3(elevated);
  const points = curve.getPoints(128);
  return { curve, points };
}

interface JourneyPathProps {
  journey: MigrationJourney;
}

function JourneyPath({ journey }: JourneyPathProps) {
  const matRef = useRef<ShaderMaterial>(null);

  const geometry = useMemo(() => {
    const { points } = buildJourneyCurve(journey.stops);
    const geo = new BufferGeometry().setFromPoints(points);
    const arcProgress = new Float32Array(points.length);
    for (let i = 0; i < points.length; i++) {
      arcProgress[i] = i / (points.length - 1);
    }
    geo.setAttribute("arcProgress", new Float32BufferAttribute(arcProgress, 1));
    return geo;
  }, [journey]);

  const material = useMemo(() => {
    const c = new Color(journey.color || "#fbbf24");
    return new ShaderMaterial({
      vertexShader: journeyVertexShader,
      fragmentShader: journeyFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: c },
        uOpacity: { value: 0.9 },
      },
      transparent: true,
      depthWrite: false,
    });
  }, [journey.color]);

  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = clock.elapsedTime;
    }
  });

  return (
    // @ts-expect-error R3F extends line element
    <line geometry={geometry}>
      <primitive ref={matRef} object={material} attach="material" />
    </line>
  );
}

function JourneyBirdIcon({ journey }: JourneyPathProps) {
  const meshRef = useRef<Mesh>(null);
  const { camera } = useThree();
  const [visible, setVisible] = useState(true);
  const prevVisible = useRef(true);

  const { curve } = useMemo(() => buildJourneyCurve(journey.stops), [journey]);

  useFrame(({ clock }) => {
    const dist = camera.position.length();
    const shouldShow = dist < LOD_DISTANCE;
    if (prevVisible.current !== shouldShow) {
      prevVisible.current = shouldShow;
      setVisible(shouldShow);
    }

    if (!meshRef.current || !shouldShow) return;
    const t = ((clock.elapsedTime * 0.08) % 1 + 1) % 1;
    const pos = curve.getPointAt(t);
    meshRef.current.position.copy(pos);
  });

  if (!visible) return null;

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.012, 10, 8]} />
      <meshBasicMaterial color={journey.color || "#fbbf24"} />
    </mesh>
  );
}

interface StopMarkerProps {
  stop: { id: string; nameZh: string; nameEn: string; lat: number; lng: number; birdIds: string[] };
  color: string;
  visited: boolean;
  journeyId: string;
}

function StopMarker({ stop, color, visited, journeyId }: StopMarkerProps) {
  const { camera } = useThree();
  const language = useAppStore((s) => s.language);
  const visitStopAction = useAppStore((s) => s.visitStop);
  const discoverBird = useAppStore((s) => s.discoverBird);
  const setSelectedBird = useAppStore((s) => s.setSelectedBird);
  const meshRef = useRef<Mesh>(null);
  const [showLabel, setShowLabel] = useState(false);
  const prevShow = useRef(false);

  const position = useMemo(() => {
    const [x, y, z] = latLngToVector3(stop.lat, stop.lng, GLOBE_RADIUS + 0.015);
    return new Vector3(x, y, z);
  }, [stop.lat, stop.lng]);

  useFrame(() => {
    const dist = camera.position.length();
    const shouldShow = dist < LOD_DISTANCE;
    if (prevShow.current !== shouldShow) {
      prevShow.current = shouldShow;
      setShowLabel(shouldShow);
    }
    if (meshRef.current) {
      const scale = visited ? 1.2 : 1.0;
      meshRef.current.scale.setScalar(scale);
    }
  });

  const handleClick = () => {
    visitStopAction(journeyId, stop.id);
    if (stop.birdIds.length > 0) {
      const birdId = stop.birdIds[0];
      discoverBird(birdId);
      setSelectedBird(birdId);
    }
  };

  return (
    <group position={position}>
      <mesh ref={meshRef} onClick={handleClick}>
        <sphereGeometry args={[0.015, 12, 10]} />
        <meshBasicMaterial
          color={visited ? "#4ade80" : color}
          transparent
          opacity={visited ? 1.0 : 0.7}
        />
      </mesh>
      {/* Glow ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.018, 0.025, 24]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.4}
          side={2}
        />
      </mesh>
      {showLabel && (
        <Html center distanceFactor={3} style={{ pointerEvents: "none" }}>
          <div
            style={{
              padding: "3px 8px",
              fontSize: 10,
              fontWeight: 600,
              color: "rgba(255, 255, 255, 0.95)",
              background: "rgba(0, 10, 30, 0.75)",
              backdropFilter: "blur(8px)",
              borderRadius: 9999,
              whiteSpace: "nowrap",
              border: `1px solid ${color}33`,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
              transform: "translateY(-20px)",
            }}
          >
            {visited ? "✅ " : "📍 "}
            {language === "zh" ? stop.nameZh : stop.nameEn}
          </div>
        </Html>
      )}
    </group>
  );
}

export function JourneyRoute() {
  const activeJourneyId = useAppStore((s) => s.activeJourneyId);
  const currentSeason = useAppStore((s) => s.currentSeason);
  const visitedStops = useAppStore((s) => s.visitedStops);

  const activeJourney = useMemo(
    () => journeys.find((j) => j.id === activeJourneyId),
    [activeJourneyId],
  );

  if (!activeJourney) return null;
  if (!activeJourney.seasons.includes(currentSeason)) return null;

  const visitedSet = new Set(visitedStops);

  return (
    <group>
      <JourneyPath journey={activeJourney} />
      <JourneyBirdIcon journey={activeJourney} />
      {activeJourney.stops.map((stop) => (
        <StopMarker
          key={stop.id}
          stop={stop}
          color={activeJourney.color}
          visited={visitedSet.has(stop.id)}
          journeyId={activeJourney.id}
        />
      ))}
    </group>
  );
}
