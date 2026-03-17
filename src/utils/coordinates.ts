const DEG2RAD = Math.PI / 180;

export function latLngToVector3(
  lat: number,
  lng: number,
  radius: number,
): [number, number, number] {
  const phi = (90 - lat) * DEG2RAD;
  const theta = (lng + 180) * DEG2RAD;

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return [x, y, z];
}
