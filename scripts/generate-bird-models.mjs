/**
 * Generates 12 stylized low-poly bird GLB models using raw glTF binary construction.
 * Each bird fits inside a 1-unit bounding box, uses flat color, < 2000 triangles.
 * Run: node scripts/generate-bird-models.mjs
 */

import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import fs from "node:fs";
import path from "node:path";

const OUT_DIR = path.resolve("public/models/birds");
fs.mkdirSync(OUT_DIR, { recursive: true });

function sphere(r, ws, hs) { return new THREE.SphereGeometry(r, ws ?? 8, hs ?? 6); }
function cone(r, h, s) { return new THREE.ConeGeometry(r, h, s ?? 4); }
function box(w, h, d) { return new THREE.BoxGeometry(w, h, d); }
function cyl(rt, rb, h, s) { return new THREE.CylinderGeometry(rt, rb, h, s ?? 6); }

function buildGeometry(parts) {
  const geos = [];
  for (const p of parts) {
    const g = p.geo;
    if (p.scale) g.scale(p.scale[0], p.scale[1], p.scale[2]);
    if (p.rotateX) g.rotateX(p.rotateX);
    if (p.rotateY) g.rotateY(p.rotateY);
    if (p.rotateZ) g.rotateZ(p.rotateZ);
    if (p.translate) g.translate(p.translate[0], p.translate[1], p.translate[2]);
    geos.push(g);
  }
  const merged = mergeGeometries(geos);

  merged.computeBoundingBox();
  const size = new THREE.Vector3();
  merged.boundingBox.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z);
  const scaleFactor = 1.0 / maxDim;
  merged.scale(scaleFactor, scaleFactor, scaleFactor);

  merged.computeBoundingBox();
  const center = new THREE.Vector3();
  merged.boundingBox.getCenter(center);
  merged.translate(-center.x, -center.y, -center.z);

  return merged;
}

function colorToRGBA(hex) {
  const r = ((hex >> 16) & 0xff) / 255;
  const g = ((hex >> 8) & 0xff) / 255;
  const b = (hex & 0xff) / 255;
  return [r, g, b, 1.0];
}

function geometryToGLB(geometry, colorHex) {
  const nonIndexed = geometry.index ? geometry.toNonIndexed() : geometry;
  const positions = nonIndexed.attributes.position.array;
  const normals = nonIndexed.attributes.normal?.array;

  const posBuffer = Buffer.from(new Float32Array(positions).buffer);
  const normBuffer = normals ? Buffer.from(new Float32Array(normals).buffer) : null;

  const vertexCount = positions.length / 3;
  const triCount = vertexCount / 3;

  let posMin = [Infinity, Infinity, Infinity];
  let posMax = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < positions.length; i += 3) {
    for (let j = 0; j < 3; j++) {
      posMin[j] = Math.min(posMin[j], positions[i + j]);
      posMax[j] = Math.max(posMax[j], positions[i + j]);
    }
  }

  const [cr, cg, cb] = colorToRGBA(colorHex);

  const buffers = [posBuffer];
  if (normBuffer) buffers.push(normBuffer);
  const binData = Buffer.concat(buffers);

  const posOffset = 0;
  const posLength = posBuffer.length;
  const normOffset = posLength;
  const normLength = normBuffer ? normBuffer.length : 0;

  const accessors = [
    {
      bufferView: 0,
      componentType: 5126,
      count: vertexCount,
      type: "VEC3",
      max: posMax,
      min: posMin,
    },
  ];

  const bufferViews = [
    { buffer: 0, byteOffset: posOffset, byteLength: posLength, target: 34962 },
  ];

  const attributes = { POSITION: 0 };

  if (normBuffer) {
    bufferViews.push({ buffer: 0, byteOffset: normOffset, byteLength: normLength, target: 34962 });
    accessors.push({
      bufferView: 1,
      componentType: 5126,
      count: vertexCount,
      type: "VEC3",
      max: [1, 1, 1],
      min: [-1, -1, -1],
    });
    attributes.NORMAL = 1;
  }

  const gltf = {
    asset: { version: "2.0", generator: "kids-bird-globe-gen" },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0 }],
    meshes: [{
      primitives: [{
        attributes,
        material: 0,
        mode: 4,
      }],
    }],
    materials: [{
      pbrMetallicRoughness: {
        baseColorFactor: [cr, cg, cb, 1.0],
        metallicFactor: 0.05,
        roughnessFactor: 0.7,
      },
    }],
    accessors,
    bufferViews,
    buffers: [{ byteLength: binData.length }],
  };

  const jsonStr = JSON.stringify(gltf);
  const jsonBuf = Buffer.from(jsonStr);
  const jsonPadded = padBuffer(jsonBuf, 0x20);
  const binPadded = padBuffer(binData, 0x00);

  const headerSize = 12;
  const jsonChunkHeader = 8;
  const binChunkHeader = 8;
  const totalSize = headerSize + jsonChunkHeader + jsonPadded.length + binChunkHeader + binPadded.length;

  const out = Buffer.alloc(totalSize);
  let offset = 0;

  // GLB header
  out.writeUInt32LE(0x46546C67, offset); offset += 4; // magic "glTF"
  out.writeUInt32LE(2, offset); offset += 4;           // version
  out.writeUInt32LE(totalSize, offset); offset += 4;   // total length

  // JSON chunk
  out.writeUInt32LE(jsonPadded.length, offset); offset += 4;
  out.writeUInt32LE(0x4E4F534A, offset); offset += 4; // "JSON"
  jsonPadded.copy(out, offset); offset += jsonPadded.length;

  // BIN chunk
  out.writeUInt32LE(binPadded.length, offset); offset += 4;
  out.writeUInt32LE(0x004E4942, offset); offset += 4; // "BIN\0"
  binPadded.copy(out, offset);

  return { glb: out, triCount };
}

function padBuffer(buf, padByte) {
  const remainder = buf.length % 4;
  if (remainder === 0) return buf;
  const padding = Buffer.alloc(4 - remainder, padByte);
  return Buffer.concat([buf, padding]);
}

// ── Bird definitions ──

const BIRDS = {
  eagle: {
    color: 0x8B6914,
    parts: [
      { geo: sphere(1, 8, 6), scale: [1.3, 0.7, 0.8] },
      { geo: sphere(0.42, 6, 5), translate: [1.05, 0.38, 0] },
      { geo: cone(0.12, 0.55, 4), rotateZ: -Math.PI / 2, translate: [1.55, 0.38, 0] },
      { geo: box(1.4, 0.05, 0.55), translate: [0.1, 0.2, 0.65] },
      { geo: box(1.4, 0.05, 0.55), translate: [0.1, 0.2, -0.65] },
      { geo: box(0.15, 0.05, 0.35), rotateZ: Math.PI / 6, translate: [0.9, 0.22, 0.85] },
      { geo: box(0.15, 0.05, 0.35), rotateZ: Math.PI / 6, translate: [0.9, 0.22, -0.85] },
      { geo: cone(0.28, 0.7, 4), rotateZ: Math.PI / 2.3, translate: [-1.15, 0.05, 0] },
      { geo: cyl(0.06, 0.08, 0.35, 5), translate: [0.2, -0.55, 0.2] },
      { geo: cyl(0.06, 0.08, 0.35, 5), translate: [0.2, -0.55, -0.2] },
    ],
  },
  owl: {
    color: 0x9E8B6E,
    parts: [
      { geo: sphere(0.9, 8, 6), scale: [0.9, 1.0, 0.85] },
      { geo: sphere(0.55, 7, 6), translate: [0.55, 0.65, 0] },
      { geo: cone(0.08, 0.25, 4), rotateZ: -Math.PI / 2, translate: [1.05, 0.6, 0] },
      { geo: sphere(0.1, 5, 4), translate: [0.85, 0.78, 0.18] },
      { geo: sphere(0.1, 5, 4), translate: [0.85, 0.78, -0.18] },
      { geo: cone(0.12, 0.25, 3), translate: [0.65, 1.05, 0.2] },
      { geo: cone(0.12, 0.25, 3), translate: [0.65, 1.05, -0.2] },
      { geo: box(0.9, 0.05, 0.45), translate: [0, 0.3, 0.55] },
      { geo: box(0.9, 0.05, 0.45), translate: [0, 0.3, -0.55] },
      { geo: cone(0.2, 0.5, 4), rotateZ: Math.PI / 2.5, translate: [-0.85, -0.1, 0] },
      { geo: cyl(0.05, 0.07, 0.3, 5), translate: [0.1, -0.75, 0.15] },
      { geo: cyl(0.05, 0.07, 0.3, 5), translate: [0.1, -0.75, -0.15] },
    ],
  },
  parrot: {
    color: 0x22AA44,
    parts: [
      { geo: sphere(0.85, 8, 6), scale: [1.1, 0.75, 0.7] },
      { geo: sphere(0.45, 6, 5), translate: [0.9, 0.45, 0] },
      { geo: cone(0.14, 0.35, 4), rotateZ: -Math.PI / 2.5, translate: [1.35, 0.35, 0] },
      { geo: box(0.7, 0.05, 0.4), translate: [0, 0.2, 0.5] },
      { geo: box(0.7, 0.05, 0.4), translate: [0, 0.2, -0.5] },
      { geo: box(0.12, 0.04, 0.9), rotateZ: Math.PI / 5, translate: [-1.0, -0.05, 0] },
      { geo: cyl(0.04, 0.06, 0.25, 5), translate: [0.15, -0.55, 0.15] },
      { geo: cyl(0.04, 0.06, 0.25, 5), translate: [0.15, -0.55, -0.15] },
    ],
  },
  penguin: {
    color: 0x1A1A2E,
    parts: [
      { geo: sphere(0.7, 8, 6), scale: [0.7, 1.2, 0.65] },
      { geo: sphere(0.35, 6, 5), translate: [0, 1.05, 0] },
      { geo: cone(0.08, 0.3, 4), rotateZ: -Math.PI / 2, translate: [0.35, 1.0, 0] },
      { geo: box(0.08, 0.6, 0.25), rotateZ: -Math.PI / 8, translate: [0, 0.2, 0.45] },
      { geo: box(0.08, 0.6, 0.25), rotateZ: Math.PI / 8, translate: [0, 0.2, -0.45] },
      { geo: cone(0.15, 0.25, 4), rotateZ: Math.PI, translate: [0, -0.95, 0] },
      { geo: box(0.2, 0.08, 0.12), translate: [0, -0.9, 0.15] },
      { geo: box(0.2, 0.08, 0.12), translate: [0, -0.9, -0.15] },
    ],
  },
  flamingo: {
    color: 0xFF6B8A,
    parts: [
      { geo: sphere(0.65, 8, 6), scale: [0.8, 0.9, 0.6] },
      { geo: cyl(0.06, 0.06, 1.0, 5), translate: [0.3, 0.85, 0] },
      { geo: sphere(0.22, 6, 5), translate: [0.3, 1.4, 0] },
      { geo: cone(0.08, 0.35, 4), rotateZ: -Math.PI / 2.2, translate: [0.6, 1.3, 0] },
      { geo: box(0.6, 0.04, 0.35), translate: [0, 0.15, 0.4] },
      { geo: box(0.6, 0.04, 0.35), translate: [0, 0.15, -0.4] },
      { geo: cone(0.12, 0.3, 4), rotateZ: Math.PI / 2.5, translate: [-0.6, -0.05, 0] },
      { geo: cyl(0.04, 0.04, 1.1, 5), translate: [0, -1.0, 0.1] },
      { geo: cyl(0.04, 0.04, 1.1, 5), translate: [0, -1.0, -0.1] },
    ],
  },
  duck: {
    color: 0x4A7C3F,
    parts: [
      { geo: sphere(0.9, 8, 6), scale: [1.2, 0.7, 0.75] },
      { geo: sphere(0.4, 6, 5), translate: [0.95, 0.4, 0] },
      { geo: box(0.35, 0.08, 0.2), translate: [1.35, 0.3, 0] },
      { geo: box(0.65, 0.04, 0.4), translate: [0, 0.2, 0.5] },
      { geo: box(0.65, 0.04, 0.4), translate: [0, 0.2, -0.5] },
      { geo: cone(0.15, 0.3, 4), rotateZ: Math.PI / 2.8, translate: [-1.05, 0.15, 0] },
      { geo: box(0.18, 0.05, 0.12), translate: [0.2, -0.55, 0.18] },
      { geo: box(0.18, 0.05, 0.12), translate: [0.2, -0.55, -0.18] },
    ],
  },
  sparrow: {
    color: 0xA0785A,
    parts: [
      { geo: sphere(0.6, 8, 6), scale: [1.0, 0.7, 0.65] },
      { geo: sphere(0.32, 6, 5), translate: [0.6, 0.35, 0] },
      { geo: cone(0.06, 0.22, 4), rotateZ: -Math.PI / 2, translate: [0.92, 0.32, 0] },
      { geo: box(0.5, 0.04, 0.3), translate: [0, 0.15, 0.4] },
      { geo: box(0.5, 0.04, 0.3), translate: [0, 0.15, -0.4] },
      { geo: cone(0.12, 0.35, 4), rotateZ: Math.PI / 2.5, translate: [-0.65, 0.0, 0] },
      { geo: cyl(0.03, 0.04, 0.2, 5), translate: [0.1, -0.45, 0.1] },
      { geo: cyl(0.03, 0.04, 0.2, 5), translate: [0.1, -0.45, -0.1] },
    ],
  },
  crow: {
    color: 0x1C1C1C,
    parts: [
      { geo: sphere(0.85, 8, 6), scale: [1.2, 0.7, 0.7] },
      { geo: sphere(0.38, 6, 5), translate: [0.95, 0.38, 0] },
      { geo: cone(0.1, 0.45, 4), rotateZ: -Math.PI / 2, translate: [1.4, 0.35, 0] },
      { geo: box(1.0, 0.05, 0.45), translate: [0.05, 0.2, 0.55] },
      { geo: box(1.0, 0.05, 0.45), translate: [0.05, 0.2, -0.55] },
      { geo: box(0.1, 0.04, 0.6), rotateZ: Math.PI / 5, translate: [-1.0, -0.05, 0] },
      { geo: cyl(0.04, 0.06, 0.3, 5), translate: [0.15, -0.55, 0.15] },
      { geo: cyl(0.04, 0.06, 0.3, 5), translate: [0.15, -0.55, -0.15] },
    ],
  },
  toucan: {
    color: 0x1A1A1A,
    parts: [
      { geo: sphere(0.7, 8, 6), scale: [0.9, 0.8, 0.7] },
      { geo: sphere(0.38, 6, 5), translate: [0.7, 0.4, 0] },
      { geo: cone(0.14, 0.8, 5), rotateZ: -Math.PI / 2, translate: [1.35, 0.3, 0] },
      { geo: box(0.55, 0.04, 0.35), translate: [0, 0.2, 0.45] },
      { geo: box(0.55, 0.04, 0.35), translate: [0, 0.2, -0.45] },
      { geo: box(0.1, 0.04, 0.5), rotateZ: Math.PI / 5, translate: [-0.75, -0.05, 0] },
      { geo: cyl(0.04, 0.05, 0.3, 5), translate: [0.1, -0.55, 0.12] },
      { geo: cyl(0.04, 0.05, 0.3, 5), translate: [0.1, -0.55, -0.12] },
    ],
  },
  peacock: {
    color: 0x1565C0,
    parts: [
      { geo: sphere(0.75, 8, 6), scale: [0.9, 0.85, 0.7] },
      { geo: cyl(0.05, 0.05, 0.5, 5), translate: [0.35, 0.7, 0] },
      { geo: sphere(0.25, 6, 5), translate: [0.35, 1.0, 0] },
      { geo: cone(0.06, 0.2, 4), rotateZ: -Math.PI / 2, translate: [0.6, 0.95, 0] },
      { geo: cone(0.05, 0.2, 3), translate: [0.35, 1.25, 0] },
      { geo: box(0.6, 0.04, 0.35), translate: [0, 0.2, 0.45] },
      { geo: box(0.6, 0.04, 0.35), translate: [0, 0.2, -0.45] },
      { geo: box(0.04, 0.9, 0.7), rotateZ: Math.PI / 4, translate: [-0.7, 0.4, 0] },
      { geo: box(0.04, 0.8, 0.5), rotateZ: Math.PI / 3.5, translate: [-0.8, 0.35, 0.25] },
      { geo: box(0.04, 0.8, 0.5), rotateZ: Math.PI / 3.5, translate: [-0.8, 0.35, -0.25] },
      { geo: cyl(0.04, 0.06, 0.3, 5), translate: [0.1, -0.6, 0.15] },
      { geo: cyl(0.04, 0.06, 0.3, 5), translate: [0.1, -0.6, -0.15] },
    ],
  },
  woodpecker: {
    color: 0xCC2222,
    parts: [
      { geo: sphere(0.6, 8, 6), scale: [0.85, 0.9, 0.6] },
      { geo: sphere(0.32, 6, 5), translate: [0.2, 0.75, 0] },
      { geo: sphere(0.15, 5, 4), translate: [0.2, 0.98, 0] },
      { geo: cone(0.06, 0.5, 4), rotateZ: -Math.PI / 2, translate: [0.65, 0.7, 0] },
      { geo: box(0.5, 0.04, 0.3), translate: [0, 0.25, 0.38] },
      { geo: box(0.5, 0.04, 0.3), translate: [0, 0.25, -0.38] },
      { geo: box(0.08, 0.5, 0.15), translate: [-0.35, -0.4, 0] },
      { geo: cyl(0.03, 0.04, 0.25, 5), translate: [0.05, -0.6, 0.1] },
      { geo: cyl(0.03, 0.04, 0.25, 5), translate: [0.05, -0.6, -0.1] },
    ],
  },
  seagull: {
    color: 0xEEEEEE,
    parts: [
      { geo: sphere(0.8, 8, 6), scale: [1.15, 0.65, 0.7] },
      { geo: sphere(0.35, 6, 5), translate: [0.9, 0.35, 0] },
      { geo: cone(0.08, 0.35, 4), rotateZ: -Math.PI / 2, translate: [1.3, 0.3, 0] },
      { geo: box(1.2, 0.04, 0.4), translate: [0.1, 0.18, 0.55] },
      { geo: box(1.2, 0.04, 0.4), translate: [0.1, 0.18, -0.55] },
      { geo: box(0.12, 0.04, 0.25), rotateZ: Math.PI / 7, translate: [0.85, 0.2, 0.8] },
      { geo: box(0.12, 0.04, 0.25), rotateZ: Math.PI / 7, translate: [0.85, 0.2, -0.8] },
      { geo: cone(0.15, 0.4, 4), rotateZ: Math.PI / 2.5, translate: [-0.95, 0.0, 0] },
      { geo: cyl(0.03, 0.05, 0.25, 5), translate: [0.15, -0.5, 0.12] },
      { geo: cyl(0.03, 0.05, 0.25, 5), translate: [0.15, -0.5, -0.12] },
    ],
  },
};

function main() {
  console.log("Generating low-poly bird models...\n");

  for (const [name, def] of Object.entries(BIRDS)) {
    const geometry = buildGeometry(def.parts);
    const { glb, triCount } = geometryToGLB(geometry, def.color);
    const outPath = path.join(OUT_DIR, `${name}.glb`);
    fs.writeFileSync(outPath, glb);
    console.log(`  ✓ ${name}.glb  (${glb.length} bytes, ~${triCount} tris)`);
  }

  console.log(`\nDone! ${Object.keys(BIRDS).length} models written to ${OUT_DIR}`);
}

main();
