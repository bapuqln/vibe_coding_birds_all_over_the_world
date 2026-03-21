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
    asset: { version: "2.0", generator: "kids-bird-globe-v19" },
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
    color: 0x6B4226,
    parts: [
      // Muscular body
      { geo: sphere(1, 12, 10), scale: [1.4, 0.75, 0.85] },
      // Broad chest
      { geo: sphere(0.5, 8, 6), scale: [0.9, 0.7, 0.8], translate: [0.5, 0.1, 0] },
      // Strong head
      { geo: sphere(0.4, 10, 8), translate: [1.1, 0.45, 0] },
      // Hooked beak (eagle signature)
      { geo: cone(0.1, 0.5, 5), rotateZ: -PI / 2.2, translate: [1.55, 0.35, 0] },
      { geo: cone(0.06, 0.2, 4), rotateZ: -PI / 1.5, translate: [1.65, 0.2, 0] },
      // Wide spread wings (eagle signature - broad)
      { geo: box(1.6, 0.06, 0.6), rotateZ: PI / 18, translate: [0.1, 0.25, 0.7] },
      { geo: box(1.6, 0.06, 0.6), rotateZ: -PI / 18, translate: [0.1, 0.25, -0.7] },
      // Wing tips (swept back)
      { geo: box(0.4, 0.04, 0.35), rotateZ: PI / 8, translate: [1.0, 0.3, 1.0] },
      { geo: box(0.4, 0.04, 0.35), rotateZ: -PI / 8, translate: [1.0, 0.3, -1.0] },
      // Fan tail
      { geo: box(0.8, 0.04, 0.5), rotateZ: PI / 6, translate: [-1.2, 0.05, 0] },
      // Strong legs
      { geo: cyl(0.06, 0.08, 0.4), translate: [0.2, -0.6, 0.2] },
      { geo: cyl(0.06, 0.08, 0.4), translate: [0.2, -0.6, -0.2] },
      // Talons
      { geo: box(0.15, 0.03, 0.1), translate: [0.25, -0.82, 0.2] },
      { geo: box(0.15, 0.03, 0.1), translate: [0.25, -0.82, -0.2] },
    ],
  },

  owl: {
    color: 0x8B7355,
    parts: [
      // Round plump body
      { geo: sphere(0.85, 12, 10), scale: [0.85, 1.1, 0.8] },
      // Large round head (owl signature)
      { geo: sphere(0.55, 12, 10), translate: [0.3, 0.85, 0] },
      // Facial disc (owl signature)
      { geo: sphere(0.48, 10, 8), scale: [0.3, 0.9, 0.9], translate: [0.65, 0.85, 0] },
      // Short hooked beak
      { geo: cone(0.07, 0.2, 4), rotateZ: -PI / 2, translate: [0.95, 0.78, 0] },
      // Large eyes (owl signature)
      { geo: sphere(0.1, 8, 6), translate: [0.78, 0.95, 0.2] },
      { geo: sphere(0.1, 8, 6), translate: [0.78, 0.95, -0.2] },
      // Ear tufts (owl signature)
      { geo: cone(0.1, 0.3, 4), translate: [0.4, 1.35, 0.25] },
      { geo: cone(0.1, 0.3, 4), translate: [0.4, 1.35, -0.25] },
      // Rounded wings (shorter than eagle)
      { geo: box(0.8, 0.05, 0.45), translate: [0, 0.35, 0.55] },
      { geo: box(0.8, 0.05, 0.45), translate: [0, 0.35, -0.55] },
      // Short fan tail
      { geo: box(0.4, 0.04, 0.35), rotateZ: PI / 5, translate: [-0.8, -0.15, 0] },
      // Short legs with feathered look
      { geo: cyl(0.06, 0.08, 0.3), translate: [0.05, -0.85, 0.15] },
      { geo: cyl(0.06, 0.08, 0.3), translate: [0.05, -0.85, -0.15] },
    ],
  },

  parrot: {
    color: 0x2ECC40,
    parts: [
      // Compact body
      { geo: sphere(0.8, 12, 10), scale: [1.0, 0.8, 0.7] },
      // Round head
      { geo: sphere(0.42, 10, 8), translate: [0.8, 0.5, 0] },
      // Large curved beak (parrot signature)
      { geo: sphere(0.18, 8, 6), scale: [1.2, 0.8, 0.7], translate: [1.15, 0.35, 0] },
      { geo: cone(0.12, 0.3, 5), rotateZ: -PI / 2.3, translate: [1.3, 0.28, 0] },
      // Colorful crest hint
      { geo: cone(0.08, 0.2, 4), translate: [0.75, 0.9, 0] },
      // Medium wings
      { geo: box(0.7, 0.05, 0.4), translate: [0, 0.2, 0.5] },
      { geo: box(0.7, 0.05, 0.4), translate: [0, 0.2, -0.5] },
      // Long tail feathers (parrot signature)
      { geo: box(0.12, 0.04, 0.15), rotateZ: PI / 4, translate: [-0.95, -0.15, 0.08] },
      { geo: box(0.12, 0.04, 0.15), rotateZ: PI / 4, translate: [-0.95, -0.15, -0.08] },
      { geo: box(0.15, 0.03, 0.08), rotateZ: PI / 3.5, translate: [-1.1, -0.25, 0] },
      // Perching feet
      { geo: cyl(0.04, 0.05, 0.25), translate: [0.15, -0.6, 0.15] },
      { geo: cyl(0.04, 0.05, 0.25), translate: [0.15, -0.6, -0.15] },
    ],
  },

  penguin: {
    color: 0x1A1A2E,
    parts: [
      // Upright oval body (penguin signature)
      { geo: sphere(0.7, 12, 10), scale: [0.65, 1.25, 0.6] },
      // White belly patch
      { geo: sphere(0.5, 10, 8), scale: [0.3, 1.0, 0.5], translate: [0.2, 0, 0] },
      // Round head
      { geo: sphere(0.35, 10, 8), translate: [0, 1.05, 0] },
      // Small beak
      { geo: cone(0.07, 0.25, 4), rotateZ: -PI / 2, translate: [0.35, 1.0, 0] },
      // Flipper wings (penguin signature - small, flat)
      { geo: box(0.08, 0.55, 0.2), rotateZ: -PI / 10, translate: [0, 0.15, 0.42] },
      { geo: box(0.08, 0.55, 0.2), rotateZ: PI / 10, translate: [0, 0.15, -0.42] },
      // Short stubby tail
      { geo: cone(0.12, 0.2, 4), rotateZ: PI, translate: [-0.15, -0.85, 0] },
      // Webbed feet
      { geo: box(0.2, 0.06, 0.14), translate: [0.05, -0.95, 0.15] },
      { geo: box(0.2, 0.06, 0.14), translate: [0.05, -0.95, -0.15] },
    ],
  },

  flamingo: {
    color: 0xFF6B8A,
    parts: [
      // Slender body
      { geo: sphere(0.55, 12, 10), scale: [0.8, 0.85, 0.55] },
      // Long curved neck (flamingo signature)
      { geo: cyl(0.06, 0.06, 0.5, 6), rotateZ: PI / 8, translate: [0.25, 0.6, 0] },
      { geo: cyl(0.06, 0.06, 0.4, 6), rotateZ: -PI / 12, translate: [0.35, 1.0, 0] },
      // Small head
      { geo: sphere(0.2, 8, 6), translate: [0.3, 1.3, 0] },
      // Bent beak (flamingo signature)
      { geo: cone(0.07, 0.3, 4), rotateZ: -PI / 2.5, translate: [0.55, 1.2, 0] },
      { geo: sphere(0.05, 6, 4), translate: [0.65, 1.1, 0] },
      // Wings
      { geo: box(0.6, 0.04, 0.35), translate: [0, 0.15, 0.38] },
      { geo: box(0.6, 0.04, 0.35), translate: [0, 0.15, -0.38] },
      // Short tail
      { geo: cone(0.1, 0.2, 4), rotateZ: PI / 3, translate: [-0.5, -0.05, 0] },
      // Very long legs (flamingo signature)
      { geo: cyl(0.035, 0.035, 1.2, 6), translate: [0, -1.0, 0.08] },
      { geo: cyl(0.035, 0.035, 1.2, 6), translate: [0, -1.0, -0.08] },
      // Knee joints
      { geo: sphere(0.05, 6, 4), translate: [0, -0.6, 0.08] },
      { geo: sphere(0.05, 6, 4), translate: [0, -0.6, -0.08] },
    ],
  },

  duck: {
    color: 0x3D7A3F,
    parts: [
      // Plump rounded body
      { geo: sphere(0.9, 12, 10), scale: [1.15, 0.7, 0.8] },
      // Round head
      { geo: sphere(0.4, 10, 8), translate: [0.85, 0.45, 0] },
      // Flat wide bill (duck signature)
      { geo: box(0.4, 0.08, 0.22), translate: [1.25, 0.35, 0] },
      { geo: box(0.35, 0.06, 0.2), translate: [1.3, 0.3, 0] },
      // Compact wings
      { geo: box(0.65, 0.04, 0.4), translate: [0, 0.2, 0.5] },
      { geo: box(0.65, 0.04, 0.4), translate: [0, 0.2, -0.5] },
      // Upturned tail (duck signature)
      { geo: cone(0.12, 0.25, 4), translate: [-0.9, 0.25, 0] },
      // Short legs
      { geo: cyl(0.04, 0.05, 0.2), translate: [0.2, -0.5, 0.18] },
      { geo: cyl(0.04, 0.05, 0.2), translate: [0.2, -0.5, -0.18] },
      // Webbed feet
      { geo: box(0.18, 0.04, 0.14), translate: [0.22, -0.62, 0.18] },
      { geo: box(0.18, 0.04, 0.14), translate: [0.22, -0.62, -0.18] },
    ],
  },

  sparrow: {
    color: 0xA0785A,
    parts: [
      // Small round body
      { geo: sphere(0.55, 12, 10), scale: [0.95, 0.7, 0.65] },
      // Round head
      { geo: sphere(0.3, 10, 8), translate: [0.55, 0.38, 0] },
      // Small conical beak (sparrow signature)
      { geo: cone(0.05, 0.18, 5), rotateZ: -PI / 2, translate: [0.85, 0.35, 0] },
      // Short wings
      { geo: box(0.45, 0.04, 0.3), translate: [0, 0.15, 0.38] },
      { geo: box(0.45, 0.04, 0.3), translate: [0, 0.15, -0.38] },
      // Notched tail
      { geo: box(0.25, 0.03, 0.12), rotateZ: PI / 5, translate: [-0.6, -0.02, 0.06] },
      { geo: box(0.25, 0.03, 0.12), rotateZ: PI / 5, translate: [-0.6, -0.02, -0.06] },
      // Tiny legs
      { geo: cyl(0.025, 0.035, 0.18), translate: [0.1, -0.42, 0.1] },
      { geo: cyl(0.025, 0.035, 0.18), translate: [0.1, -0.42, -0.1] },
    ],
  },

  crow: {
    color: 0x1A1A1A,
    parts: [
      // Sleek body
      { geo: sphere(0.8, 12, 10), scale: [1.25, 0.7, 0.7] },
      // Angular head
      { geo: sphere(0.38, 10, 8), translate: [0.9, 0.4, 0] },
      // Strong straight beak (crow signature)
      { geo: cone(0.08, 0.45, 5), rotateZ: -PI / 2, translate: [1.35, 0.35, 0] },
      // Long pointed wings
      { geo: box(1.1, 0.05, 0.45), translate: [0.05, 0.22, 0.55] },
      { geo: box(1.1, 0.05, 0.45), translate: [0.05, 0.22, -0.55] },
      // Wing tips
      { geo: box(0.3, 0.03, 0.2), rotateZ: PI / 10, translate: [0.7, 0.25, 0.8] },
      { geo: box(0.3, 0.03, 0.2), rotateZ: -PI / 10, translate: [0.7, 0.25, -0.8] },
      // Long wedge tail (crow signature)
      { geo: box(0.5, 0.04, 0.25), rotateZ: PI / 6, translate: [-1.05, -0.05, 0] },
      // Sturdy legs
      { geo: cyl(0.04, 0.06, 0.3), translate: [0.15, -0.55, 0.15] },
      { geo: cyl(0.04, 0.06, 0.3), translate: [0.15, -0.55, -0.15] },
    ],
  },

  toucan: {
    color: 0x1A1A1A,
    parts: [
      // Compact body
      { geo: sphere(0.65, 12, 10), scale: [0.85, 0.8, 0.65] },
      // Round head
      { geo: sphere(0.35, 10, 8), translate: [0.6, 0.45, 0] },
      // Enormous colorful beak (toucan signature)
      { geo: sphere(0.15, 8, 6), scale: [2.8, 0.7, 0.6], translate: [1.2, 0.3, 0] },
      { geo: cone(0.08, 0.2, 5), rotateZ: -PI / 2, translate: [1.65, 0.25, 0] },
      // Medium wings
      { geo: box(0.55, 0.04, 0.35), translate: [0, 0.2, 0.42] },
      { geo: box(0.55, 0.04, 0.35), translate: [0, 0.2, -0.42] },
      // Long graduated tail
      { geo: box(0.4, 0.04, 0.15), rotateZ: PI / 5, translate: [-0.7, -0.08, 0] },
      // Perching feet
      { geo: cyl(0.035, 0.05, 0.28), translate: [0.08, -0.55, 0.12] },
      { geo: cyl(0.035, 0.05, 0.28), translate: [0.08, -0.55, -0.12] },
    ],
  },

  peacock: {
    color: 0x1565C0,
    parts: [
      // Elegant body
      { geo: sphere(0.7, 12, 10), scale: [0.85, 0.9, 0.65] },
      // Long neck
      { geo: cyl(0.055, 0.055, 0.5, 6), translate: [0.3, 0.7, 0] },
      // Small head
      { geo: sphere(0.22, 10, 8), translate: [0.3, 1.05, 0] },
      // Small beak
      { geo: cone(0.05, 0.18, 4), rotateZ: -PI / 2, translate: [0.52, 1.0, 0] },
      // Crown crest (peacock signature)
      { geo: cone(0.04, 0.22, 3), translate: [0.3, 1.28, 0] },
      { geo: cone(0.03, 0.18, 3), translate: [0.25, 1.25, 0.08] },
      { geo: cone(0.03, 0.18, 3), translate: [0.25, 1.25, -0.08] },
      // Wings
      { geo: box(0.55, 0.04, 0.35), translate: [0, 0.2, 0.42] },
      { geo: box(0.55, 0.04, 0.35), translate: [0, 0.2, -0.42] },
      // Magnificent train/tail fan (peacock signature)
      { geo: box(0.04, 1.0, 0.7), rotateZ: PI / 3.5, translate: [-0.7, 0.5, 0] },
      { geo: box(0.04, 0.9, 0.55), rotateZ: PI / 3, translate: [-0.8, 0.45, 0.3] },
      { geo: box(0.04, 0.9, 0.55), rotateZ: PI / 3, translate: [-0.8, 0.45, -0.3] },
      { geo: box(0.04, 0.75, 0.4), rotateZ: PI / 2.8, translate: [-0.85, 0.35, 0.5] },
      { geo: box(0.04, 0.75, 0.4), rotateZ: PI / 2.8, translate: [-0.85, 0.35, -0.5] },
      // Legs
      { geo: cyl(0.04, 0.06, 0.35), translate: [0.08, -0.65, 0.15] },
      { geo: cyl(0.04, 0.06, 0.35), translate: [0.08, -0.65, -0.15] },
    ],
  },

  woodpecker: {
    color: 0xCC2222,
    parts: [
      // Compact upright body
      { geo: sphere(0.55, 12, 10), scale: [0.8, 1.0, 0.6] },
      // Strong head
      { geo: sphere(0.3, 10, 8), translate: [0.15, 0.8, 0] },
      // Red crest (woodpecker signature)
      { geo: sphere(0.15, 8, 6), scale: [1.0, 0.6, 0.8], translate: [0.1, 1.05, 0] },
      // Long chisel beak (woodpecker signature)
      { geo: cone(0.05, 0.5, 5), rotateZ: -PI / 2, translate: [0.6, 0.75, 0] },
      // Stiff wings
      { geo: box(0.5, 0.04, 0.3), translate: [0, 0.3, 0.38] },
      { geo: box(0.5, 0.04, 0.3), translate: [0, 0.3, -0.38] },
      // Stiff prop tail (woodpecker signature - used for support)
      { geo: box(0.08, 0.45, 0.15), translate: [-0.3, -0.5, 0] },
      // Strong clinging feet
      { geo: cyl(0.035, 0.045, 0.22), translate: [0.05, -0.65, 0.1] },
      { geo: cyl(0.035, 0.045, 0.22), translate: [0.05, -0.65, -0.1] },
    ],
  },

  seagull: {
    color: 0xEEEEEE,
    parts: [
      // Streamlined body
      { geo: sphere(0.75, 12, 10), scale: [1.2, 0.65, 0.7] },
      // Round head
      { geo: sphere(0.32, 10, 8), translate: [0.85, 0.35, 0] },
      // Medium straight beak
      { geo: cone(0.07, 0.35, 5), rotateZ: -PI / 2, translate: [1.22, 0.3, 0] },
      // Long narrow wings (seagull signature - gliding)
      { geo: box(1.4, 0.04, 0.35), translate: [0.1, 0.2, 0.55] },
      { geo: box(1.4, 0.04, 0.35), translate: [0.1, 0.2, -0.55] },
      // Angled wing tips
      { geo: box(0.3, 0.03, 0.2), rotateZ: PI / 8, translate: [0.95, 0.25, 0.78] },
      { geo: box(0.3, 0.03, 0.2), rotateZ: -PI / 8, translate: [0.95, 0.25, -0.78] },
      // Short square tail
      { geo: box(0.3, 0.04, 0.2), rotateZ: PI / 6, translate: [-0.9, 0.0, 0] },
      // Short legs
      { geo: cyl(0.03, 0.04, 0.2), translate: [0.15, -0.45, 0.12] },
      { geo: cyl(0.03, 0.04, 0.2), translate: [0.15, -0.45, -0.12] },
      // Webbed feet
      { geo: box(0.12, 0.03, 0.1), translate: [0.18, -0.57, 0.12] },
      { geo: box(0.12, 0.03, 0.1), translate: [0.18, -0.57, -0.12] },
    ],
  },
};

function main() {
  console.log("Building high-quality bird GLB assets (v19)...\n");

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
