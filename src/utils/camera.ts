import { latLngToVector3 } from "./coordinates";

export function computeCameraTarget(
  lat: number,
  lng: number,
  distance: number,
): { position: [number, number, number]; target: [number, number, number] } {
  const target = latLngToVector3(lat, lng, 1);
  const dir = latLngToVector3(lat, lng, distance);
  return { position: dir, target };
}
