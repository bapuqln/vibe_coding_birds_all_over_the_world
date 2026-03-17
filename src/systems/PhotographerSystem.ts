import type { PhotoScore, Bird } from "../types";

export function calculatePhotoScore(
  cameraDistance: number,
  isAnimating: boolean,
  birdScreenX: number,
  birdScreenY: number,
  viewportWidth: number,
  viewportHeight: number,
  rarity: Bird["rarity"],
): PhotoScore {
  const maxDist = 3.0;
  const distScore = Math.max(0, Math.round((1 - Math.min(cameraDistance, maxDist) / maxDist) * 30));

  const poseScore = isAnimating ? 30 : Math.round(Math.random() * 10 + 5);

  const thirdX1 = viewportWidth / 3;
  const thirdX2 = (viewportWidth * 2) / 3;
  const thirdY1 = viewportHeight / 3;
  const thirdY2 = (viewportHeight * 2) / 3;

  const intersections = [
    [thirdX1, thirdY1], [thirdX2, thirdY1],
    [thirdX1, thirdY2], [thirdX2, thirdY2],
  ];

  let minDist = Infinity;
  for (const [ix, iy] of intersections) {
    const d = Math.sqrt((birdScreenX - ix) ** 2 + (birdScreenY - iy) ** 2);
    minDist = Math.min(minDist, d);
  }

  const maxGridDist = Math.sqrt(viewportWidth ** 2 + viewportHeight ** 2) / 3;
  const compScore = Math.max(0, Math.round((1 - Math.min(minDist, maxGridDist) / maxGridDist) * 20));

  let rarityMultiplier = 1;
  if (rarity === "rare") rarityMultiplier = 1.5;
  if (rarity === "legendary") rarityMultiplier = 2;
  const rarityScore = Math.round((rarityMultiplier - 1) * 20);

  const total = Math.min(100, distScore + poseScore + compScore + rarityScore);
  const stars = total >= 90 ? 5 : total >= 70 ? 4 : total >= 50 ? 3 : total >= 30 ? 2 : 1;

  return { distance: distScore, pose: poseScore, composition: compScore, rarity: rarityScore, total, stars };
}
