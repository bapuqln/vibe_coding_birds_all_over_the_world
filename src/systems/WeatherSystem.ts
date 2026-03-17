import weatherData from "../data/weather.json";
import type { RegionWeather, WeatherType } from "../types";

const regions = weatherData as RegionWeather[];

export function getRegionWeather(region: string): RegionWeather | undefined {
  return regions.find((r) => r.region === region);
}

export function getAllWeather(): RegionWeather[] {
  return regions;
}

export function getWeatherIntensity(region: string): number {
  return getRegionWeather(region)?.intensity ?? 0;
}

export function getWeatherType(region: string): WeatherType {
  return getRegionWeather(region)?.weather ?? "clear";
}
