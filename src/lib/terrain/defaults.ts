import type { GenerationParams } from "./generate";

/** « Le Continent », the map shown across the page. */
export const MAP_DEFAULTS: GenerationParams = {
  seed: 48213,
  seaLevel: 42,
  islands: 3,
  relief: 60,
  coast: 35,
};

/** Bounds of the generator's settings, as in the app. */
export const MAP_LIMITS = {
  seaLevel: { min: 0, max: 95 },
  islands: { min: 1, max: 8 },
  relief: { min: 0, max: 100 },
  coast: { min: 0, max: 100 },
} as const;
