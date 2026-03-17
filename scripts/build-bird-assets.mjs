/**
 * Builds high-quality stylized low-poly bird GLB assets.
 * Each bird has a unique silhouette, clean topology, < 2000 tris, fits 1-unit bounding box.
 * Style: stylized low-poly animals suitable for kids.
 *
 * Run: node scripts/build-bird-assets.mjs
 *
 * NOTE: This script is a BUILD TOOL only. It is NOT used at runtime.
 * The app loads the resulting .glb files from /public/models/birds/ via useGLTF.
 */

import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import fs from "node:fs";
import path from "node:path";

const OUT_DIR = path.resolve("public/models/birds");
fs.mkdirSync(OUT_DIR, { recursive: true });

function sphere(r, ws = 10, hs = 8) { return new THREE.SphereGeometry(r, ws, hs); }
function cone(r, h, s = 6) { return new THREE.ConeGeometry(r, h, s); }
function box(w, h, d) { return new THREE.BoxGeometry(w, h, d); }
function cyl(rt, rb, h, s = 8) { return new THREE.CylinderGeometry(rt, rb, h, s); }
function torus(r, tube, rs = 8, ts = 6) { return new THREE.TorusGeometry(r, tube, rs, ts); }

function transform(geo, opts) {
  if (opts.scale) geo.scale(opts.scale[0], opts.scale[1], opts.scale[2]);
  if (opts.rotateX) geo.rotateX(opts.rotateX);
  if (opts.rotateY) geo.rotateY(opts.rotateY);
  if (opts.rotateZ) geo.rotateZ(opts.rotateZ);
  if (opts.translate) geo.translate(opts.translate[0], opts.translate[1], opts.translate[2]);
  return geo;
}

function buildBird(parts) {
  const geos = parts.map(p => transform(p.geo, p));
  const merged = mergeGeometries(geos);

  merged.computeBoundingBox();
  const size = new THREE.Vector3();
  merged.boundingBox.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z);
  const sf = 1.0 / maxDim;
  merged.scale(sf, sf, sf);

  merged.computeBoundingBox();
  const center = new THREE.Vector3();
  merged.boundingBox.getCenter(center);
  merged.translate(-center.x, -center.y, -center.z);

  merged.computeVertexNormals();
  return merged;
}

function colorToRGBA(hex) {
  return [((hex >> 16) & 0xff) / 255, ((hex >> 8) & 0xff) / 255, (hex & 0xff) / 255, 1.0];
}

function geometryToGLB(geometry, colorHex) {
  const nonIndexed = geometry.index ? geometry.toNonIndexed() : geometry;
  const positions = nonIndexed.attributes.position.array;
  const normals = nonIndexed.attributes.normal?.array;
  const vertexCount = positions.length / 3;
  const triCount = vertexCount / 3;

  const posBuffer = Buffer.from(new Float32Array(positions).buffer);
  const normBuffer = normals ? Buffer.from(new Float32Array(normals).buffer) : null;

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

  const bufferViews = [
    { buffer: 0, byteOffset: 0, byteLength: posBuffer.length, target: 34962 },
  ];
  const accessors = [
    { bufferView: 0, componentType: 5126, count: vertexCount, type: "VEC3", max: posMax, min: posMin },
  ];
  const attributes = { POSITION: 0 };

  if (normBuffer) {
    bufferViews.push({ buffer: 0, byteOffset: posBuffer.length, byteLength: normBuffer.length, target: 34962 });
    accessors.push({ bufferView: 1, componentType: 5126, count: vertexCount, type: "VEC3", max: [1, 1, 1], min: [-1, -1, -1] });
    attributes.NORMAL = 1;
  }

  const gltf = {
    asset: { version: "2.0", generator: "kids-bird-globe-v20" },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0, name: "Bird" }],
    meshes: [{ primitives: [{ attributes, material: 0, mode: 4 }] }],
    materials: [{
      name: "BirdMaterial",
      pbrMetallicRoughness: {
        baseColorFactor: [cr, cg, cb, 1.0],
        metallicFactor: 0.05,
        roughnessFactor: 0.65,
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

  const totalSize = 12 + 8 + jsonPadded.length + 8 + binPadded.length;
  const out = Buffer.alloc(totalSize);
  let offset = 0;

  out.writeUInt32LE(0x46546C67, offset); offset += 4;
  out.writeUInt32LE(2, offset); offset += 4;
  out.writeUInt32LE(totalSize, offset); offset += 4;
  out.writeUInt32LE(jsonPadded.length, offset); offset += 4;
  out.writeUInt32LE(0x4E4F534A, offset); offset += 4;
  jsonPadded.copy(out, offset); offset += jsonPadded.length;
  out.writeUInt32LE(binPadded.length, offset); offset += 4;
  out.writeUInt32LE(0x004E4942, offset); offset += 4;
  binPadded.copy(out, offset);

  return { glb: out, triCount };
}

function padBuffer(buf, padByte) {
  const r = buf.length % 4;
  if (r === 0) return buf;
  return Buffer.concat([buf, Buffer.alloc(4 - r, padByte)]);
}

const PI = Math.PI;

const BIRDS = {
  eagle: {
    color: 0x5C3317,
    parts: [
      // Muscular torso + broad chest
      { geo: sphere(1, 10, 8), scale: [1.45, 0.78, 0.88] },
      { geo: sphere(0.52, 8, 6), scale: [1.0, 0.72, 0.85], translate: [0.48, 0.12, 0] },
      // Shoulder hump (soaring posture)
      { geo: sphere(0.35, 6, 5), scale: [1.1, 0.6, 1.0], translate: [0.15, 0.55, 0] },
      // Head + brow ridge
      { geo: sphere(0.42, 8, 6), translate: [1.05, 0.42, 0] },
      { geo: box(0.22, 0.06, 0.28), translate: [1.12, 0.52, 0] },
      // Hooked beak: upper + hooked tip
      { geo: cone(0.11, 0.38, 6), rotateZ: -PI / 2.1, translate: [1.52, 0.32, 0] },
      { geo: cone(0.065, 0.22, 5), rotateZ: -PI / 1.55, translate: [1.68, 0.18, 0] },
      { geo: box(0.08, 0.04, 0.06), rotateZ: -PI / 6, translate: [1.72, 0.12, 0] },
      // Inner wing (broad, swept back) — layered boxes for thickness
      { geo: box(1.75, 0.05, 0.55), rotateZ: PI / 22, rotateY: -PI / 28, translate: [0.08, 0.22, 0.72] },
      { geo: box(1.75, 0.05, 0.55), rotateZ: -PI / 22, rotateY: PI / 28, translate: [0.08, 0.22, -0.72] },
      { geo: box(1.55, 0.04, 0.48), rotateZ: PI / 14, translate: [0.05, 0.28, 0.72] },
      { geo: box(1.55, 0.04, 0.48), rotateZ: -PI / 14, translate: [0.05, 0.28, -0.72] },
      // Mid wing + feathered tips (secondary/primary)
      { geo: box(0.55, 0.035, 0.38), rotateZ: PI / 7, rotateX: PI / 18, translate: [0.95, 0.28, 1.05] },
      { geo: box(0.55, 0.035, 0.38), rotateZ: -PI / 7, rotateX: -PI / 18, translate: [0.95, 0.28, -1.05] },
      { geo: box(0.35, 0.03, 0.32), rotateZ: PI / 5, translate: [1.25, 0.26, 1.12] },
      { geo: box(0.35, 0.03, 0.32), rotateZ: -PI / 5, translate: [1.25, 0.26, -1.12] },
      // Fanned tail
      { geo: box(0.85, 0.04, 0.52), rotateZ: PI / 7, translate: [-1.15, 0.06, 0] },
      { geo: box(0.35, 0.03, 0.2), rotateZ: PI / 5, translate: [-1.35, 0.02, 0.12] },
      { geo: box(0.35, 0.03, 0.2), rotateZ: PI / 5, translate: [-1.35, 0.02, -0.12] },
      // Legs + talons
      { geo: cyl(0.055, 0.07, 0.38, 6), translate: [0.18, -0.58, 0.22] },
      { geo: cyl(0.055, 0.07, 0.38, 6), translate: [0.18, -0.58, -0.22] },
      { geo: box(0.16, 0.028, 0.11), translate: [0.24, -0.8, 0.22] },
      { geo: box(0.16, 0.028, 0.11), translate: [0.24, -0.8, -0.22] },
      { geo: box(0.06, 0.02, 0.08), translate: [0.32, -0.82, 0.28] },
      { geo: box(0.06, 0.02, 0.08), translate: [0.32, -0.82, -0.28] },
    ],
  },

  owl: {
    color: 0x8B7355,
    parts: [
      // Round plump body
      { geo: sphere(0.88, 10, 8), scale: [0.88, 1.12, 0.82] },
      // Large round head
      { geo: sphere(0.58, 8, 6), translate: [0.28, 0.88, 0] },
      // Facial disc (wider, rounder)
      { geo: sphere(0.5, 8, 6), scale: [0.32, 0.95, 0.95], translate: [0.62, 0.88, 0] },
      { geo: torus(0.22, 0.05, 10, 6), rotateY: PI / 2, translate: [0.72, 0.88, 0] },
      // Larger eyes
      { geo: sphere(0.12, 6, 5), translate: [0.76, 0.98, 0.22] },
      { geo: sphere(0.12, 6, 5), translate: [0.76, 0.98, -0.22] },
      { geo: sphere(0.05, 5, 4), translate: [0.82, 1.0, 0.22] },
      { geo: sphere(0.05, 5, 4), translate: [0.82, 1.0, -0.22] },
      // Short hooked beak
      { geo: cone(0.07, 0.22, 5), rotateZ: -PI / 2, translate: [0.98, 0.8, 0] },
      // Prominent ear tufts
      { geo: cone(0.11, 0.36, 5), rotateX: -PI / 8, translate: [0.38, 1.38, 0.28] },
      { geo: cone(0.11, 0.36, 5), rotateX: PI / 8, translate: [0.38, 1.38, -0.28] },
      { geo: cone(0.06, 0.2, 4), translate: [0.32, 1.42, 0.32] },
      { geo: cone(0.06, 0.2, 4), translate: [0.32, 1.42, -0.32] },
      // Short rounded wings (layered)
      { geo: box(0.75, 0.045, 0.48), rotateX: PI / 20, translate: [-0.02, 0.38, 0.58] },
      { geo: box(0.75, 0.045, 0.48), rotateX: -PI / 20, translate: [-0.02, 0.38, -0.58] },
      { geo: box(0.55, 0.04, 0.4), translate: [0, 0.32, 0.58] },
      { geo: box(0.55, 0.04, 0.4), translate: [0, 0.32, -0.58] },
      // Short fan tail
      { geo: box(0.42, 0.035, 0.36), rotateZ: PI / 5, translate: [-0.82, -0.12, 0] },
      { geo: box(0.2, 0.03, 0.18), rotateZ: PI / 4, translate: [-0.95, -0.2, 0.1] },
      { geo: box(0.2, 0.03, 0.18), rotateZ: PI / 4, translate: [-0.95, -0.2, -0.1] },
      // Feathered legs
      { geo: cyl(0.055, 0.07, 0.28, 6), translate: [0.02, -0.86, 0.16] },
      { geo: cyl(0.055, 0.07, 0.28, 6), translate: [0.02, -0.86, -0.16] },
      { geo: sphere(0.08, 5, 4), translate: [0.02, -0.98, 0.16] },
      { geo: sphere(0.08, 5, 4), translate: [0.02, -0.98, -0.16] },
    ],
  },

  parrot: {
    color: 0x00AA44,
    parts: [
      // Compact body
      { geo: sphere(0.82, 10, 8), scale: [1.05, 0.82, 0.72] },
      // Round head
      { geo: sphere(0.44, 8, 6), translate: [0.78, 0.52, 0] },
      // Large curved upper beak + lower mandible
      { geo: sphere(0.2, 6, 5), scale: [1.35, 0.85, 0.75], translate: [1.18, 0.38, 0] },
      { geo: cone(0.13, 0.34, 6), rotateZ: -PI / 2.25, translate: [1.38, 0.28, 0] },
      { geo: box(0.18, 0.06, 0.12), rotateZ: PI / 8, translate: [1.25, 0.18, 0] },
      // Colorful crest (multi-feather)
      { geo: cone(0.09, 0.26, 5), translate: [0.72, 0.95, 0] },
      { geo: cone(0.06, 0.2, 4), rotateZ: PI / 10, translate: [0.62, 0.98, 0.1] },
      { geo: cone(0.06, 0.2, 4), rotateZ: -PI / 10, translate: [0.62, 0.98, -0.1] },
      // Medium wings with slight curve (layered boxes)
      { geo: box(0.72, 0.045, 0.42), rotateZ: PI / 22, translate: [0.02, 0.22, 0.52] },
      { geo: box(0.72, 0.045, 0.42), rotateZ: -PI / 22, translate: [0.02, 0.22, -0.52] },
      { geo: box(0.55, 0.038, 0.36), rotateY: PI / 16, translate: [-0.05, 0.2, 0.52] },
      { geo: box(0.55, 0.038, 0.36), rotateY: -PI / 16, translate: [-0.05, 0.2, -0.52] },
      // Long tail feathers
      { geo: box(0.14, 0.04, 0.16), rotateZ: PI / 3.8, translate: [-0.92, -0.12, 0.1] },
      { geo: box(0.14, 0.04, 0.16), rotateZ: PI / 3.8, translate: [-0.92, -0.12, -0.1] },
      { geo: box(0.16, 0.035, 0.1), rotateZ: PI / 3.2, translate: [-1.08, -0.22, 0] },
      { geo: box(0.12, 0.03, 0.08), rotateZ: PI / 2.8, translate: [-1.15, -0.32, 0.06] },
      { geo: box(0.12, 0.03, 0.08), rotateZ: PI / 2.8, translate: [-1.15, -0.32, -0.06] },
      // Perching feet (toes)
      { geo: cyl(0.038, 0.048, 0.26, 5), translate: [0.12, -0.62, 0.16] },
      { geo: cyl(0.038, 0.048, 0.26, 5), translate: [0.12, -0.62, -0.16] },
      { geo: box(0.12, 0.03, 0.06), rotateZ: PI / 5, translate: [0.2, -0.78, 0.2] },
      { geo: box(0.12, 0.03, 0.06), rotateZ: PI / 5, translate: [0.2, -0.78, -0.2] },
    ],
  },

  penguin: {
    color: 0x1A1A2E,
    parts: [
      // Upright oval body
      { geo: sphere(0.72, 10, 8), scale: [0.68, 1.28, 0.62] },
      // Clear white belly patch (forward-facing)
      { geo: sphere(0.52, 8, 6), scale: [0.28, 1.05, 0.52], translate: [0.22, 0.02, 0] },
      { geo: box(0.25, 0.55, 0.35), translate: [0.35, 0, 0] },
      // Round head
      { geo: sphere(0.36, 8, 6), translate: [0, 1.08, 0] },
      // Small stout beak
      { geo: cone(0.075, 0.26, 5), rotateZ: -PI / 2, translate: [0.38, 1.02, 0] },
      // Flipper wings (small, flat, slightly angled back)
      { geo: box(0.09, 0.58, 0.22), rotateZ: -PI / 9, rotateY: PI / 14, translate: [0, 0.12, 0.44] },
      { geo: box(0.09, 0.58, 0.22), rotateZ: PI / 9, rotateY: -PI / 14, translate: [0, 0.12, -0.44] },
      { geo: box(0.07, 0.35, 0.16), translate: [-0.05, 0.05, 0.44] },
      { geo: box(0.07, 0.35, 0.16), translate: [-0.05, 0.05, -0.44] },
      // Stubby tail
      { geo: cone(0.13, 0.22, 5), rotateZ: PI, translate: [-0.18, -0.82, 0] },
      { geo: box(0.2, 0.08, 0.12), rotateZ: PI / 6, translate: [-0.28, -0.75, 0] },
      // Webbed feet
      { geo: box(0.22, 0.055, 0.15), translate: [0.06, -0.98, 0.16] },
      { geo: box(0.22, 0.055, 0.15), translate: [0.06, -0.98, -0.16] },
      { geo: box(0.1, 0.03, 0.06), translate: [0.18, -0.98, 0.2] },
      { geo: box(0.1, 0.03, 0.06), translate: [0.18, -0.98, -0.2] },
    ],
  },

  flamingo: {
    color: 0xFF5C8A,
    parts: [
      // Slender horizontal body
      { geo: sphere(0.52, 8, 6), scale: [0.85, 0.88, 0.52] },
      // S-curved neck (multiple segments)
      { geo: cyl(0.055, 0.055, 0.42, 6), rotateZ: PI / 7, translate: [0.22, 0.55, 0] },
      { geo: cyl(0.05, 0.05, 0.38, 6), rotateZ: -PI / 10, translate: [0.32, 0.88, 0] },
      { geo: cyl(0.045, 0.045, 0.32, 6), rotateZ: PI / 14, translate: [0.28, 1.18, 0] },
      { geo: cyl(0.04, 0.04, 0.22, 5), rotateZ: -PI / 18, translate: [0.22, 1.42, 0] },
      // Small head
      { geo: sphere(0.2, 6, 5), translate: [0.18, 1.58, 0] },
      // Bent filter beak + small bulge
      { geo: cone(0.065, 0.28, 5), rotateZ: -PI / 2.4, translate: [0.48, 1.48, 0] },
      { geo: box(0.12, 0.05, 0.08), rotateZ: -PI / 5, translate: [0.62, 1.35, 0] },
      { geo: sphere(0.045, 5, 4), translate: [0.68, 1.22, 0] },
      // Slim wings
      { geo: box(0.55, 0.035, 0.32), translate: [-0.02, 0.18, 0.36] },
      { geo: box(0.55, 0.035, 0.32), translate: [-0.02, 0.18, -0.36] },
      { geo: box(0.25, 0.03, 0.15), rotateZ: PI / 12, translate: [0.15, 0.12, 0.4] },
      { geo: box(0.25, 0.03, 0.15), rotateZ: -PI / 12, translate: [0.15, 0.12, -0.4] },
      // Short tail
      { geo: cone(0.09, 0.2, 5), rotateZ: PI / 3, translate: [-0.48, 0, 0] },
      // Long thin legs + knee joints + second segment
      { geo: cyl(0.032, 0.032, 0.55, 6), translate: [0.05, -0.35, 0.1] },
      { geo: cyl(0.032, 0.032, 0.55, 6), translate: [0.05, -0.35, -0.1] },
      { geo: sphere(0.048, 5, 4), translate: [0.05, -0.62, 0.1] },
      { geo: sphere(0.048, 5, 4), translate: [0.05, -0.62, -0.1] },
      { geo: cyl(0.028, 0.03, 0.65, 6), translate: [0.08, -1.05, 0.1] },
      { geo: cyl(0.028, 0.03, 0.65, 6), translate: [0.08, -1.05, -0.1] },
      // Webbed feet
      { geo: box(0.16, 0.04, 0.12), translate: [0.1, -1.42, 0.1] },
      { geo: box(0.16, 0.04, 0.12), translate: [0.1, -1.42, -0.1] },
    ],
  },

  duck: {
    color: 0x2E7D32,
    parts: [
      // Plump rounded body
      { geo: sphere(0.92, 10, 8), scale: [1.18, 0.72, 0.82] },
      // Breast fullness
      { geo: sphere(0.4, 6, 5), scale: [1.1, 0.7, 0.9], translate: [0.35, 0.05, 0] },
      // Round head
      { geo: sphere(0.42, 8, 6), translate: [0.88, 0.48, 0] },
      // Flat wide bill (upper + lower)
      { geo: box(0.45, 0.09, 0.24), translate: [1.28, 0.36, 0] },
      { geo: box(0.38, 0.07, 0.2), translate: [1.35, 0.28, 0] },
      { geo: box(0.2, 0.05, 0.16), translate: [1.42, 0.32, 0] },
      // Compact wings (layered)
      { geo: box(0.68, 0.042, 0.42), translate: [0, 0.22, 0.52] },
      { geo: box(0.68, 0.042, 0.42), translate: [0, 0.22, -0.52] },
      { geo: box(0.45, 0.035, 0.35), rotateX: PI / 14, translate: [-0.05, 0.18, 0.52] },
      { geo: box(0.45, 0.035, 0.35), rotateX: -PI / 14, translate: [-0.05, 0.18, -0.52] },
      // Upturned tail
      { geo: cone(0.13, 0.28, 5), rotateX: PI / 2.2, translate: [-0.95, 0.32, 0] },
      { geo: box(0.2, 0.06, 0.18), rotateZ: PI / 4, translate: [-0.85, 0.38, 0] },
      // Short legs + webbed feet
      { geo: cyl(0.038, 0.048, 0.22, 5), translate: [0.22, -0.52, 0.2] },
      { geo: cyl(0.038, 0.048, 0.22, 5), translate: [0.22, -0.52, -0.2] },
      { geo: box(0.2, 0.045, 0.15), translate: [0.24, -0.65, 0.2] },
      { geo: box(0.2, 0.045, 0.15), translate: [0.24, -0.65, -0.2] },
      { geo: box(0.08, 0.03, 0.1), translate: [0.32, -0.66, 0.24] },
      { geo: box(0.08, 0.03, 0.1), translate: [0.32, -0.66, -0.24] },
    ],
  },

  sparrow: {
    color: 0x9E7B5A,
    parts: [
      // Small round body
      { geo: sphere(0.56, 8, 6), scale: [0.98, 0.72, 0.68] },
      // Round head
      { geo: sphere(0.32, 8, 6), translate: [0.58, 0.4, 0] },
      // Small conical beak
      { geo: cone(0.048, 0.2, 6), rotateZ: -PI / 2, translate: [0.88, 0.36, 0] },
      // Short wings
      { geo: box(0.48, 0.038, 0.32), translate: [0, 0.16, 0.4] },
      { geo: box(0.48, 0.038, 0.32), translate: [0, 0.16, -0.4] },
      { geo: box(0.28, 0.032, 0.22), rotateZ: PI / 12, translate: [0.15, 0.14, 0.42] },
      { geo: box(0.28, 0.032, 0.22), rotateZ: -PI / 12, translate: [0.15, 0.14, -0.42] },
      // Notched tail (forked)
      { geo: box(0.28, 0.028, 0.12), rotateZ: PI / 5, translate: [-0.62, -0.02, 0.08] },
      { geo: box(0.28, 0.028, 0.12), rotateZ: PI / 5, translate: [-0.62, -0.02, -0.08] },
      { geo: box(0.18, 0.024, 0.08), rotateZ: PI / 4, translate: [-0.75, -0.08, 0] },
      // Tiny legs
      { geo: cyl(0.022, 0.032, 0.16, 5), translate: [0.12, -0.44, 0.11] },
      { geo: cyl(0.022, 0.032, 0.16, 5), translate: [0.12, -0.44, -0.11] },
      { geo: box(0.08, 0.02, 0.05), translate: [0.14, -0.54, 0.12] },
      { geo: box(0.08, 0.02, 0.05), translate: [0.14, -0.54, -0.12] },
    ],
  },

  crow: {
    color: 0x1A1A1A,
    parts: [
      // Sleek elongated body
      { geo: sphere(0.82, 10, 8), scale: [1.32, 0.68, 0.72] },
      // Angular head + throat
      { geo: sphere(0.4, 8, 6), translate: [0.92, 0.42, 0] },
      { geo: sphere(0.18, 5, 4), scale: [0.5, 0.6, 0.7], translate: [0.75, 0.25, 0] },
      // Strong straight beak
      { geo: cone(0.085, 0.5, 6), rotateZ: -PI / 2, translate: [1.38, 0.36, 0] },
      { geo: box(0.1, 0.05, 0.08), translate: [1.55, 0.32, 0] },
      // Long pointed wings + tips (layered thin boxes)
      { geo: box(1.15, 0.048, 0.48), translate: [0.06, 0.24, 0.58] },
      { geo: box(1.15, 0.048, 0.48), translate: [0.06, 0.24, -0.58] },
      { geo: box(0.85, 0.04, 0.42), rotateZ: PI / 12, translate: [0.2, 0.22, 0.58] },
      { geo: box(0.85, 0.04, 0.42), rotateZ: -PI / 12, translate: [0.2, 0.22, -0.58] },
      { geo: box(0.35, 0.032, 0.24), rotateZ: PI / 8, translate: [0.78, 0.26, 0.82] },
      { geo: box(0.35, 0.032, 0.24), rotateZ: -PI / 8, translate: [0.78, 0.26, -0.82] },
      { geo: box(0.22, 0.028, 0.18), rotateZ: PI / 6, translate: [1.05, 0.24, 0.9] },
      { geo: box(0.22, 0.028, 0.18), rotateZ: -PI / 6, translate: [1.05, 0.24, -0.9] },
      // Long wedge tail
      { geo: box(0.55, 0.038, 0.28), rotateZ: PI / 7, translate: [-1.08, -0.04, 0] },
      { geo: box(0.35, 0.03, 0.18), rotateZ: PI / 5, translate: [-1.35, -0.12, 0.1] },
      { geo: box(0.35, 0.03, 0.18), rotateZ: PI / 5, translate: [-1.35, -0.12, -0.1] },
      // Sturdy legs
      { geo: cyl(0.042, 0.055, 0.32, 6), translate: [0.16, -0.56, 0.16] },
      { geo: cyl(0.042, 0.055, 0.32, 6), translate: [0.16, -0.56, -0.16] },
      { geo: box(0.12, 0.03, 0.1), translate: [0.2, -0.76, 0.18] },
      { geo: box(0.12, 0.03, 0.1), translate: [0.2, -0.76, -0.18] },
    ],
  },

  toucan: {
    color: 0x1A1A1A,
    parts: [
      // Compact body
      { geo: sphere(0.68, 10, 8), scale: [0.88, 0.82, 0.66] },
      // Round head
      { geo: sphere(0.38, 8, 6), translate: [0.58, 0.48, 0] },
      // Enormous colorful beak — prominent upper + lower + ridge
      { geo: box(0.95, 0.22, 0.28), translate: [1.25, 0.32, 0] },
      { geo: box(0.75, 0.16, 0.24), rotateZ: -PI / 18, translate: [1.45, 0.22, 0] },
      { geo: sphere(0.12, 6, 5), scale: [2.2, 0.55, 0.85], translate: [1.05, 0.38, 0] },
      { geo: cone(0.07, 0.18, 5), rotateZ: -PI / 2, translate: [1.78, 0.2, 0] },
      { geo: box(0.25, 0.08, 0.12), translate: [1.55, 0.12, 0] },
      // Medium wings
      { geo: box(0.58, 0.042, 0.36), translate: [0, 0.22, 0.44] },
      { geo: box(0.58, 0.042, 0.36), translate: [0, 0.22, -0.44] },
      { geo: box(0.4, 0.035, 0.3), rotateZ: PI / 16, translate: [-0.08, 0.18, 0.44] },
      { geo: box(0.4, 0.035, 0.3), rotateZ: -PI / 16, translate: [-0.08, 0.18, -0.44] },
      // Long graduated tail
      { geo: box(0.45, 0.038, 0.16), rotateZ: PI / 5, translate: [-0.72, -0.1, 0] },
      { geo: box(0.32, 0.032, 0.12), rotateZ: PI / 4.5, translate: [-0.95, -0.18, 0.08] },
      { geo: box(0.32, 0.032, 0.12), rotateZ: PI / 4.5, translate: [-0.95, -0.18, -0.08] },
      { geo: box(0.22, 0.028, 0.1), rotateZ: PI / 4, translate: [-1.12, -0.26, 0] },
      // Perching feet
      { geo: cyl(0.036, 0.048, 0.3, 5), translate: [0.06, -0.58, 0.14] },
      { geo: cyl(0.036, 0.048, 0.3, 5), translate: [0.06, -0.58, -0.14] },
      { geo: box(0.14, 0.03, 0.08), translate: [0.12, -0.76, 0.16] },
      { geo: box(0.14, 0.03, 0.08), translate: [0.12, -0.76, -0.16] },
    ],
  },

  peacock: {
    color: 0x0D47A1,
    parts: [
      // Elegant body
      { geo: sphere(0.72, 10, 8), scale: [0.88, 0.92, 0.66] },
      // Long neck (two segments)
      { geo: cyl(0.05, 0.05, 0.38, 6), translate: [0.28, 0.62, 0] },
      { geo: cyl(0.045, 0.045, 0.28, 5), rotateZ: -PI / 12, translate: [0.22, 0.92, 0] },
      // Small head
      { geo: sphere(0.24, 8, 6), translate: [0.18, 1.18, 0] },
      { geo: cone(0.05, 0.2, 4), rotateZ: -PI / 2, translate: [0.42, 1.12, 0] },
      // Crown crest — multiple feathers
      { geo: cone(0.045, 0.26, 4), translate: [0.15, 1.42, 0] },
      { geo: cone(0.035, 0.2, 4), translate: [0.08, 1.38, 0.1] },
      { geo: cone(0.035, 0.2, 4), translate: [0.08, 1.38, -0.1] },
      { geo: cone(0.03, 0.18, 3), translate: [0.22, 1.4, 0.08] },
      { geo: cone(0.03, 0.18, 3), translate: [0.22, 1.4, -0.08] },
      // Wings
      { geo: box(0.58, 0.042, 0.36), translate: [0, 0.22, 0.44] },
      { geo: box(0.58, 0.042, 0.36), translate: [0, 0.22, -0.44] },
      { geo: box(0.35, 0.035, 0.28), translate: [-0.05, 0.15, 0.44] },
      { geo: box(0.35, 0.035, 0.28), translate: [-0.05, 0.15, -0.44] },
      // Magnificent train — multi-segment fan (eyespots implied by torus hints)
      { geo: box(0.045, 1.15, 0.85), rotateZ: PI / 3.6, translate: [-0.65, 0.55, 0] },
      { geo: box(0.04, 1.02, 0.72), rotateZ: PI / 3.2, translate: [-0.78, 0.48, 0.28] },
      { geo: box(0.04, 1.02, 0.72), rotateZ: PI / 3.2, translate: [-0.78, 0.48, -0.28] },
      { geo: box(0.038, 0.88, 0.58), rotateZ: PI / 2.9, translate: [-0.88, 0.4, 0.48] },
      { geo: box(0.038, 0.88, 0.58), rotateZ: PI / 2.9, translate: [-0.88, 0.4, -0.48] },
      { geo: box(0.035, 0.72, 0.45), rotateZ: PI / 2.6, translate: [-0.95, 0.32, 0.62] },
      { geo: box(0.035, 0.72, 0.45), rotateZ: PI / 2.6, translate: [-0.95, 0.32, -0.62] },
      { geo: torus(0.35, 0.025, 12, 6), rotateX: PI / 2.2, rotateZ: PI / 4, translate: [-0.75, 0.45, 0] },
      // Legs
      { geo: cyl(0.038, 0.05, 0.38, 6), translate: [0.06, -0.68, 0.16] },
      { geo: cyl(0.038, 0.05, 0.38, 6), translate: [0.06, -0.68, -0.16] },
    ],
  },

  woodpecker: {
    color: 0xCC2222,
    parts: [
      // Compact upright body
      { geo: sphere(0.58, 10, 8), scale: [0.82, 1.05, 0.62] },
      // Head
      { geo: sphere(0.32, 8, 6), translate: [0.12, 0.82, 0] },
      // Red crest (woodpecker signature)
      { geo: sphere(0.16, 6, 5), scale: [1.1, 0.55, 0.85], translate: [0.05, 1.08, 0] },
      { geo: cone(0.07, 0.22, 5), translate: [-0.05, 1.18, 0] },
      { geo: box(0.18, 0.06, 0.2), translate: [0.08, 1.12, 0] },
      // Long chisel beak
      { geo: cone(0.048, 0.55, 6), rotateZ: -PI / 2, translate: [0.62, 0.78, 0] },
      { geo: box(0.08, 0.05, 0.06), translate: [0.78, 0.72, 0] },
      // Stiff wings (layered)
      { geo: box(0.52, 0.04, 0.32), translate: [0, 0.32, 0.4] },
      { geo: box(0.52, 0.04, 0.32), translate: [0, 0.32, -0.4] },
      { geo: box(0.35, 0.035, 0.26), rotateZ: PI / 14, translate: [-0.05, 0.28, 0.4] },
      { geo: box(0.35, 0.035, 0.26), rotateZ: -PI / 14, translate: [-0.05, 0.28, -0.4] },
      // Stiff prop tail (broad support)
      { geo: box(0.1, 0.52, 0.18), translate: [-0.32, -0.48, 0] },
      { geo: box(0.08, 0.35, 0.14), rotateZ: PI / 12, translate: [-0.42, -0.55, 0] },
      { geo: box(0.06, 0.22, 0.1), translate: [-0.48, -0.62, 0] },
      // Strong clinging feet
      { geo: cyl(0.032, 0.042, 0.24, 5), translate: [0.04, -0.68, 0.12] },
      { geo: cyl(0.032, 0.042, 0.24, 5), translate: [0.04, -0.68, -0.12] },
      { geo: box(0.12, 0.03, 0.08), rotateZ: PI / 4, translate: [0.12, -0.82, 0.14] },
      { geo: box(0.12, 0.03, 0.08), rotateZ: PI / 4, translate: [0.12, -0.82, -0.14] },
    ],
  },

  seagull: {
    color: 0xF5F5F5,
    parts: [
      // Streamlined body
      { geo: sphere(0.78, 10, 8), scale: [1.22, 0.62, 0.72] },
      // Round head
      { geo: sphere(0.34, 8, 6), translate: [0.88, 0.38, 0] },
      // Medium straight beak with gape hint
      { geo: cone(0.07, 0.38, 6), rotateZ: -PI / 2, translate: [1.25, 0.32, 0] },
      { geo: box(0.12, 0.04, 0.06), translate: [1.38, 0.28, 0] },
      // Long narrow gliding wings + angled tips (multi-layer)
      { geo: box(1.45, 0.038, 0.36), translate: [0.1, 0.2, 0.58] },
      { geo: box(1.45, 0.038, 0.36), translate: [0.1, 0.2, -0.58] },
      { geo: box(1.1, 0.032, 0.32), rotateZ: PI / 18, translate: [0.15, 0.18, 0.58] },
      { geo: box(1.1, 0.032, 0.32), rotateZ: -PI / 18, translate: [0.15, 0.18, -0.58] },
      { geo: box(0.38, 0.028, 0.22), rotateZ: PI / 7, rotateY: PI / 10, translate: [0.95, 0.22, 0.82] },
      { geo: box(0.38, 0.028, 0.22), rotateZ: -PI / 7, rotateY: -PI / 10, translate: [0.95, 0.22, -0.82] },
      { geo: box(0.22, 0.024, 0.16), rotateZ: PI / 5, translate: [1.2, 0.2, 0.92] },
      { geo: box(0.22, 0.024, 0.16), rotateZ: -PI / 5, translate: [1.2, 0.2, -0.92] },
      // Short square tail
      { geo: box(0.32, 0.038, 0.22), rotateZ: PI / 7, translate: [-0.92, 0.02, 0] },
      { geo: box(0.18, 0.03, 0.14), translate: [-1.05, 0, 0] },
      // Short legs + webbed feet
      { geo: cyl(0.028, 0.038, 0.2, 5), translate: [0.14, -0.46, 0.13] },
      { geo: cyl(0.028, 0.038, 0.2, 5), translate: [0.14, -0.46, -0.13] },
      { geo: box(0.14, 0.032, 0.11), translate: [0.18, -0.58, 0.14] },
      { geo: box(0.14, 0.032, 0.11), translate: [0.18, -0.58, -0.14] },
    ],
  },
};

function main() {
  console.log("Building high-quality bird GLB assets (v20)...\n");

  for (const [name, def] of Object.entries(BIRDS)) {
    const geometry = buildBird(def.parts);
    const { glb, triCount } = geometryToGLB(geometry, def.color);
    const outPath = path.join(OUT_DIR, `${name}.glb`);
    fs.writeFileSync(outPath, glb);
    console.log(`  ✓ ${name}.glb  (${glb.length} bytes, ~${triCount} tris)`);
  }

  console.log(`\nDone! ${Object.keys(BIRDS).length} bird models written to ${OUT_DIR}`);
}

main();
