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

  const fromNorm = from.clone().normalize();
  const toNorm = to.clone().normalize();
  const angularDistance = fromNorm.angleTo(toNorm);
  const arcHeight = Math.min(0.12, Math.max(0.03, angularDistance * 0.04));
  const numPoints = Math.min(7, Math.max(3, Math.floor(angularDistance / 0.3)));

  const controlPoints: Vector3[] = [];
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;

    const sinTotal = Math.sin(angularDistance);
    let point: Vector3;
    if (sinTotal < 0.001) {
      point = new Vector3().lerpVectors(fromNorm, toNorm, t);
    } else {
      const a = Math.sin((1 - t) * angularDistance) / sinTotal;
      const b = Math.sin(t * angularDistance) / sinTotal;
      point = fromNorm.clone().multiplyScalar(a).add(toNorm.clone().multiplyScalar(b));
    }
    point.normalize();

    const elevation =
      i === 0 || i === numPoints ? globeRadius : globeRadius + arcHeight;
    point.multiplyScalar(Math.max(elevation, globeRadius + 0.01));
    controlPoints.push(point);
  }

  const curve = new CatmullRomCurve3(controlPoints);
  return curve.getPoints(segments);
}
