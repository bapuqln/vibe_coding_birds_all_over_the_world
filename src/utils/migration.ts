import { Vector3, CatmullRomCurve3 } from "three";
import { latLngToVector3 } from "./coordinates";

export function buildMigrationCurve(
  fromLatLng: [number, number],
  toLatLng: [number, number],
  globeRadius: number,
  segments = 64,
): Vector3[] {
  const fromArr = latLngToVector3(fromLatLng[0], fromLatLng[1], globeRadius);
  const toArr = latLngToVector3(toLatLng[0], toLatLng[1], globeRadius);
  const from = new Vector3(...fromArr);
  const to = new Vector3(...toArr);

  const mid = new Vector3().addVectors(from, to).multiplyScalar(0.5);
  mid.normalize();

  const angularDistance = from.angleTo(to);
  const arcHeight = Math.min(0.4, Math.max(0.15, angularDistance * 0.3));
  mid.multiplyScalar(globeRadius + arcHeight);

  const curve = new CatmullRomCurve3([from, mid, to]);
  return curve.getPoints(segments);
}
