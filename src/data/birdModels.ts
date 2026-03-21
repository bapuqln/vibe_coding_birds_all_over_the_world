/**
 * Maps bird silhouette types to GLB model paths.
 * Each model is a stylized low-poly bird (< 2000 tris, 1-unit bounding box).
 */

const SILHOUETTE_TO_MODEL: Record<string, string> = {
  "bald-eagle": "/models/birds/eagle.glb",
  "japanese-crane": "/models/birds/flamingo.glb",
  "common-kingfisher": "/models/birds/sparrow.glb",
  "toco-toucan": "/models/birds/toucan.glb",
  "northern-cardinal": "/models/birds/sparrow.glb",
  "european-robin": "/models/birds/sparrow.glb",
  "atlantic-puffin": "/models/birds/penguin.glb",
  "lilac-breasted-roller": "/models/birds/parrot.glb",
  "secretary-bird": "/models/birds/eagle.glb",
  "andean-condor": "/models/birds/eagle.glb",
  "emperor-penguin": "/models/birds/penguin.glb",
  "kiwi": "/models/birds/duck.glb",
  "superb-fairywren": "/models/birds/sparrow.glb",
  "fairy-pitta": "/models/birds/parrot.glb",
};

const DEFAULT_MODEL = "/models/birds/sparrow.glb";

export const ALL_MODEL_PATHS = [
  "/models/birds/eagle.glb",
  "/models/birds/owl.glb",
  "/models/birds/parrot.glb",
  "/models/birds/penguin.glb",
  "/models/birds/flamingo.glb",
  "/models/birds/duck.glb",
  "/models/birds/sparrow.glb",
  "/models/birds/crow.glb",
  "/models/birds/toucan.glb",
  "/models/birds/peacock.glb",
  "/models/birds/woodpecker.glb",
  "/models/birds/seagull.glb",
];

export function getModelPath(silhouette: string): string {
  return SILHOUETTE_TO_MODEL[silhouette] ?? DEFAULT_MODEL;
}
