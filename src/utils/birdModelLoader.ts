import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { Box3, Vector3, type Group, type Mesh } from "three";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const DRACO_DECODER_PATH =
  "https://www.gstatic.com/draco/versioned/decoders/1.5.7/";

let dracoConfigured = false;

function ensureDracoLoader() {
  if (dracoConfigured) return;
  dracoConfigured = true;

  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath(DRACO_DECODER_PATH);
  dracoLoader.setDecoderConfig({ type: "js" });

  const loader = new GLTFLoader();
  loader.setDRACOLoader(dracoLoader);

  useGLTF.setDecoderPath?.(DRACO_DECODER_PATH);
}

ensureDracoLoader();

/**
 * Normalizes a loaded GLTF scene to fit within a 1-unit bounding box,
 * centered at origin.
 */
export function normalizeModel(scene: Group): Group {
  const box = new Box3().setFromObject(scene);
  const size = new Vector3();
  box.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z);

  if (maxDim > 0) {
    const scale = 1.0 / maxDim;
    scene.scale.multiplyScalar(scale);
  }

  const center = new Vector3();
  new Box3().setFromObject(scene).getCenter(center);
  scene.position.sub(center);

  return scene;
}

/**
 * Extracts the first mesh found in a GLTF scene.
 */
export function extractFirstMesh(scene: Group): Mesh | null {
  const meshes: Mesh[] = [];
  scene.traverse((child) => {
    if ((child as Mesh).isMesh) {
      meshes.push(child as Mesh);
    }
  });
  return meshes[0] ?? null;
}

/**
 * React hook: loads a bird GLB model, normalizes its scale,
 * and returns the geometry and material from the first mesh.
 */
export function useBirdModel(modelPath: string) {
  const gltf = useGLTF(modelPath);

  return useMemo(() => {
    const cloned = gltf.scene.clone(true);
    normalizeModel(cloned);
    const mesh = extractFirstMesh(cloned);
    return {
      geometry: mesh?.geometry ?? null,
      material: mesh?.material ?? null,
      scene: cloned,
    };
  }, [gltf]);
}
