import migrationsData from "../data/migrations.json";
import type { MigrationRoute } from "../types";

const routes = migrationsData as MigrationRoute[];

export function getAllMigrationRoutes(): MigrationRoute[] {
  return routes;
}

export function getMigrationRouteById(id: string): MigrationRoute | undefined {
  return routes.find((r) => r.id === id);
}
