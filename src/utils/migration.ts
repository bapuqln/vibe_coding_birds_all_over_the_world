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

  const angularDistance = from.angleTo(to);
  const arcHeight = Math.min(0.12, Math.max(0.03, angularDistance * 0.04));
  const numPoints = Math.min(7, Math.max(3, Math.floor(angularDistance / 0.3)));

  const controlPoints: Vector3[] = [];
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const point = new Vector3().lerpVectors(from, to, t);
    point.normalize();

    const elevation =
      i === 0 || i === numPoints
        ? globeRadius
        : globeRadius + arcHeight;
    point.multiplyScalar(Math.max(elevation, globeRadius + 0.01));
    controlPoints.push(point);
  }

  const curve = new CatmullRomCurve3(controlPoints);
  return curve.getPoints(segments);
}
