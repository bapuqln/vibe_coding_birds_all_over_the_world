import { Vector3, CatmullRomCurve3 } from "three";
import { latLngToVector3 } from "../utils/coordinates";
import type { MigrationIntelligencePath } from "../types";
import pathData from "../data/migration-intelligence.json";

const GLOBE_RADIUS = 1.0;
const PATH_ELEVATION = 0.02;

export function getAllMigrationIntelligencePaths(): MigrationIntelligencePath[] {
  return pathData as MigrationIntelligencePath[];
}

export function buildCurveFromWaypoints(
  waypoints: [number, number][],
): CatmullRomCurve3 {
  const points = waypoints.map(([lat, lng]) => {
    const [x, y, z] = latLngToVector3(lat, lng, GLOBE_RADIUS + PATH_ELEVATION);
    return new Vector3(x, y, z);
  });
  return new CatmullRomCurve3(points, false, "catmullrom", 0.5);
}

const curveCache = new Map<number, CatmullRomCurve3>();

export function getCurveForPath(pathIndex: number): CatmullRomCurve3 {
  const cached = curveCache.get(pathIndex);
  if (cached) return cached;

  const paths = getAllMigrationIntelligencePaths();
  if (pathIndex < 0 || pathIndex >= paths.length) {
    return new CatmullRomCurve3([new Vector3(0, 1, 0), new Vector3(0, 1.01, 0)]);
  }

  const curve = buildCurveFromWaypoints(paths[pathIndex].waypoints);
  curveCache.set(pathIndex, curve);
  return curve;
}

export function getPointOnPath(
  pathIndex: number,
  t: number,
): Vector3 {
  const curve = getCurveForPath(pathIndex);
  return curve.getPointAt(Math.max(0, Math.min(1, t)));
}

export function getTangentOnPath(
  pathIndex: number,
  t: number,
): Vector3 {
  const curve = getCurveForPath(pathIndex);
  return curve.getTangentAt(Math.max(0, Math.min(1, t)));
}

export function isPathActiveInMonth(
  path: MigrationIntelligencePath,
  month: number,
): boolean {
  if (path.season === "spring") return month >= 2 && month <= 4;
  if (path.season === "autumn") return month >= 8 && month <= 10;
  return false;
}
