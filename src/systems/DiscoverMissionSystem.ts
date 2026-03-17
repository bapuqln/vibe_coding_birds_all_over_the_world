import birdsData from "../data/birds.json";
import missionsData from "../data/discover-missions.json";
import type { Bird, DiscoveryMission } from "../types";

const birds = birdsData as Bird[];
const missions = missionsData as DiscoveryMission[];

const birdById = new Map(birds.map((b) => [b.id, b]));

function birdMatchesMission(bird: Bird, mission: DiscoveryMission): boolean {
  switch (mission.type) {
    case "habitat": {
      const h = bird.habitatType;
      if (h === undefined) return false;
      if (mission.target === "ocean") {
        return h === "ocean" || h === "coast";
      }
      return h === mission.target;
    }
    case "region":
      return bird.region === mission.target;
    case "trait":
      switch (mission.target) {
        case "wingspan_200":
          return bird.wingspanCm !== undefined && bird.wingspanCm >= 200;
        case "nocturnal":
          return bird.activityPeriod === "nocturnal";
        case "speed_100":
          return bird.flightSpeed !== undefined && bird.flightSpeed >= 100;
        default:
          return false;
      }
    default: {
      const _exhaustive: never = mission.type;
      return _exhaustive;
    }
  }
}

export function getAllDiscoverMissions(): DiscoveryMission[] {
  return [...missions];
}

export function getMissionById(id: string): DiscoveryMission | undefined {
  return missions.find((m) => m.id === id);
}

export function checkMissionProgress(
  missionId: string,
  discoveredBirdIds: string[],
): number {
  const mission = getMissionById(missionId);
  if (!mission) return 0;
  const discovered = new Set(discoveredBirdIds);
  let count = 0;
  for (const birdId of discovered) {
    const bird = birdById.get(birdId);
    if (bird && birdMatchesMission(bird, mission)) count += 1;
  }
  return count;
}
