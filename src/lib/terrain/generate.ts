import { Perlin, Rng } from "./noise";

/** Settings of the relief, as in the app's « Générer le relief » dialog. */
export interface GenerationParams {
  seed: number;
  /** Share of the map covered by water, in percent (0–95). */
  seaLevel: number;
  /** Number of land masses (1–8). */
  islands: number;
  /** Strength of mountains and valleys, in percent. */
  relief: number;
  /** Jaggedness of the coastlines, in percent. */
  coast: number;
}

/** Terrain grids, row by row, plus the elevation below which it is water. */
export interface Terrain {
  width: number;
  height: number;
  elevation: Uint8Array;
  vegetation: Uint8Array;
  waterLevel: number;
}

/** Size of the noise features relative to the map (lower = larger shapes). */
const BASE_FREQUENCY = 3.2;

const smoothstep = (t: number) => t * t * (3 - 2 * t);
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/** 1 inside, fading to 0 on the last 8 % near the borders. */
function edgeFalloff(u: number, v: number): number {
  const distance = Math.max(Math.min(u, 1 - u, v, 1 - v), 0);
  return smoothstep(Math.min(distance / 0.08, 1));
}

/** Scales values to 0–255. */
function normalize(values: Float64Array): Uint8Array {
  let min = Infinity;
  let max = -Infinity;
  for (const value of values) {
    min = Math.min(min, value);
    max = Math.max(max, value);
  }
  const span = Math.max(max - min, Number.EPSILON);
  return Uint8Array.from(values, (value) => Math.round(((value - min) / span) * 255));
}

/** Elevation below which `percent` % of the cells lie. */
function percentile(values: Uint8Array, percent: number): number {
  const histogram = new Array<number>(256).fill(0);
  for (const value of values) histogram[value] = (histogram[value] ?? 0) + 1;
  const target = Math.floor((values.length * percent) / 100);
  let seen = 0;
  for (let level = 0; level < 256; level += 1) {
    seen += histogram[level] ?? 0;
    if (seen >= target) return level;
  }
  return 255;
}

/**
 * Procedural terrain: island masks with noisy coastlines plus fractal
 * noise for mountains and valleys; the water level is chosen so that the
 * requested share of the map is water. A port of the app's generator.
 */
export function generateTerrain(params: GenerationParams, width: number, height: number): Terrain {
  const seed = ((BigInt(params.seed >>> 0) * 0x2545f4914f6cdd1dn) & ((1n << 64n) - 1n)) ^ 0xd5een;
  const rng = new Rng(seed);
  const reliefNoise = new Perlin(rng);
  const coastNoise = new Perlin(rng);
  const moistureNoise = new Perlin(rng);
  const rangeNoise = new Perlin(rng);

  const aspect = width / height;
  const relief = params.relief / 100;
  const coast = params.coast / 100;
  const count = Math.max(params.islands, 1);
  const baseRadius = 0.62 / Math.sqrt(count);
  const islands = Array.from({ length: count }, () => ({
    cx: rng.range(0.22, 0.78) * aspect,
    cy: rng.range(0.22, 0.78),
    radius: baseRadius * rng.range(0.75, 1.25),
  }));

  const heights = new Float64Array(width * height);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const nx = x / height;
      const ny = y / height;
      const warp = coastNoise.fractal(nx * 4, ny * 4, 4, 0.55) * (0.08 + 0.3 * coast);
      let mask = 0;
      for (const { cx, cy, radius } of islands) {
        const distance = Math.hypot(nx - cx, ny - cy) / radius + warp;
        mask = Math.max(mask, smoothstep(1 - clamp(distance, 0, 1)));
      }
      const ridges = reliefNoise.fractal(
        nx * BASE_FREQUENCY,
        ny * BASE_FREQUENCY,
        6,
        0.45 + 0.15 * relief,
      );
      const range = 1 - Math.abs(rangeNoise.fractal(nx * 2.4, ny * 2.4, 5, 0.5));
      const ranges = range ** 3 * Math.sqrt(mask) * (0.15 + 0.65 * relief);
      const border = edgeFalloff(nx / aspect, ny);
      heights[y * width + x] = (mask * 0.42 + ridges * (0.14 + 0.4 * relief) + ranges) * border;
    }
  }

  const elevation = normalize(heights);
  const waterLevel = percentile(elevation, params.seaLevel);
  const vegetation = Uint8Array.from(elevation, (e, i) => {
    if (e <= waterLevel) return 0;
    const x = (i % width) / height;
    const y = Math.floor(i / width) / height;
    const moisture = (moistureNoise.fractal(x * 5, y * 5, 4, 0.5) + 1) / 2;
    const altitude = (e - waterLevel) / Math.max(255 - waterLevel, 1);
    const density = (moisture * 1.8 - 0.5) * (1 - altitude * 1.3);
    return Math.round(clamp(density, 0, 1) * 255);
  });

  return { width, height, elevation, vegetation, waterLevel };
}
