import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  ConeGeometry,
  MeshStandardMaterial,
  Vector3,
  Color,
  Object3D,
} from "three";
import type { InstancedMesh } from "three";
import { useAppStore } from "../store";
import { generateFlockConfigs } from "../domain/flock-config";
import {
  getAllMigrationIntelligencePaths,
  getCurveForPath,
  isPathActiveInMonth,
} from "../domain/migration-paths";
import type { FlockConfig } from "../types";

const _position = new Vector3();
const _tangent = new Vector3();
const _obj = new Object3D();

function FlockGroup({ config }: { config: FlockConfig }) {
  const meshRef = useRef<InstancedMesh>(null);
  const paths = useMemo(() => getAllMigrationIntelligencePaths(), []);
  const path = paths[config.pathIndex];

  const curve = useMemo(
    () => getCurveForPath(config.pathIndex),
    [config.pathIndex],
  );

  const geometry = useMemo(
    () => new ConeGeometry(0.006, 0.018, 4),
    [],
  );

  const material = useMemo(
    () =>
      new MeshStandardMaterial({
        color: new Color(path.color),
        emissive: new Color(path.color),
        emissiveIntensity: 0.3,
        metalness: 0.1,
        roughness: 0.6,
      }),
    [path.color],
  );

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const timeState = useAppStore.getState().timeState;
    const active = isPathActiveInMonth(path, timeState.month);

    if (!active) {
      mesh.visible = false;
      return;
    }
    mesh.visible = true;

    const monthOffset =
      path.season === "autumn"
        ? timeState.month - 8
        : timeState.month - 2;
    const baseT = Math.max(
      0,
      Math.min(1, (monthOffset + timeState.progress) / 3),
    );

    for (let i = 0; i < config.instanceCount; i++) {
      const offset = config.offsets[i];
      const t = Math.max(0, Math.min(1, baseT + offset * 2));

      curve.getPointAt(t, _position);
      curve.getTangentAt(t, _tangent);

      const perpX = -_tangent.z;
      const perpZ = _tangent.x;
      const perpLen = Math.sqrt(perpX * perpX + perpZ * perpZ) || 1;
      _position.x += (perpX / perpLen) * offset;
      _position.z += (perpZ / perpLen) * offset;
      _position.y += Math.sin(t * 20 + i * 1.5) * 0.003;

      _obj.position.copy(_position);
      _obj.lookAt(
        _position.x + _tangent.x,
        _position.y + _tangent.y,
        _position.z + _tangent.z,
      );
      _obj.rotateX(Math.PI / 2);
      _obj.updateMatrix();

      mesh.setMatrixAt(i, _obj.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, config.instanceCount]}
      frustumCulled={false}
    />
  );
}

export function MigrationFlockRenderer() {
  const flocks = useMemo(() => generateFlockConfigs(), []);

  const handleFlockClick = (pathIndex: number) => {
    const store = useAppStore.getState();
    store.pauseTimeline();
    store.setMigrationInfoPathIndex(pathIndex);
  };

  return (
    <group>
      {flocks.map((config, i) => (
        <group key={i} onClick={() => handleFlockClick(config.pathIndex)}>
          <FlockGroup config={config} />
        </group>
      ))}
    </group>
  );
}
