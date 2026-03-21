/**
 * Maps bird silhouette types to GLB model paths.
 * All models are high-quality stylized low-poly birds loaded from /public/models/birds/.
 * Each model fits a 1-unit bounding box, < 2000 tris, with Draco compression support.
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
  "great-hornbill": "/models/birds/toucan.glb",
  "snowy-owl": "/models/birds/owl.glb",
  "barn-owl": "/models/birds/owl.glb",
  "peregrine-falcon": "/models/birds/eagle.glb",
  "blue-jay": "/models/birds/crow.glb",
  "american-robin": "/models/birds/sparrow.glb",
  "ruby-throated-hummingbird": "/models/birds/sparrow.glb",
  "scarlet-macaw": "/models/birds/parrot.glb",
  "harpy-eagle": "/models/birds/eagle.glb",
  "resplendent-quetzal": "/models/birds/parrot.glb",
  "mandarin-duck": "/models/birds/duck.glb",
  "indian-peafowl": "/models/birds/peacock.glb",
  "greater-flamingo": "/models/birds/flamingo.glb",
  "african-grey-parrot": "/models/birds/parrot.glb",
  "shoebill": "/models/birds/flamingo.glb",
  "kookaburra": "/models/birds/woodpecker.glb",
  "lyrebird": "/models/birds/peacock.glb",
  "kakapo": "/models/birds/parrot.glb",
  "arctic-tern": "/models/birds/seagull.glb",
  "puffin": "/models/birds/penguin.glb",
  "golden-eagle": "/models/birds/eagle.glb",
  "european-starling": "/models/birds/crow.glb",
  "common-raven": "/models/birds/crow.glb",
  "house-sparrow": "/models/birds/sparrow.glb",
  "mallard": "/models/birds/duck.glb",
  "great-blue-heron": "/models/birds/flamingo.glb",
  "red-crowned-crane": "/models/birds/flamingo.glb",
  "white-bellied-sea-eagle": "/models/birds/eagle.glb",
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
