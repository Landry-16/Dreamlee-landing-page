import type { Terrain } from "./generate";

/**
 * Paints a terrain like the Dreamlee map editor: colors by altitude,
 * hillshading from the north-west, forest stipple, ink coastlines and a
 * light ring of shallow water. Ported from the app's `render.ts`.
 */

type Rgb = readonly [number, number, number];

const DEEP_WATER: Rgb = [74, 118, 150];
const SHALLOW_WATER: Rgb = [150, 190, 204];
const BEACH: Rgb = [226, 212, 170];
const LOWLAND: Rgb = [182, 196, 142];
const HIGHLAND: Rgb = [170, 158, 122];
const MOUNTAIN: Rgb = [140, 124, 108];
const SNOW: Rgb = [244, 241, 234];
const FOREST: Rgb = [70, 101, 60];
const INK: Rgb = [74, 60, 46];

const LAND_STOPS: readonly (readonly [number, Rgb])[] = [
  [0, BEACH],
  [0.05, LOWLAND],
  [0.45, HIGHLAND],
  [0.75, MOUNTAIN],
  [0.9, SNOW],
  [1, SNOW],
];

function mix(a: Rgb, b: Rgb, t: number): Rgb {
  const k = Math.min(Math.max(t, 0), 1);
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
}

function ramp(t: number): Rgb {
  for (let i = 1; i < LAND_STOPS.length; i += 1) {
    const [position, color] = LAND_STOPS[i] as readonly [number, Rgb];
    const [previousPosition, previousColor] = LAND_STOPS[i - 1] as readonly [number, Rgb];
    if (t <= position) {
      return mix(previousColor, color, (t - previousPosition) / (position - previousPosition));
    }
  }
  return SNOW;
}

/** Color of a point before shading. */
export function cellColor(elevation: number, vegetation: number, waterLevel: number): Rgb {
  if (elevation <= waterLevel) {
    return mix(DEEP_WATER, SHALLOW_WATER, elevation / Math.max(waterLevel, 1));
  }
  const altitude = (elevation - waterLevel) / Math.max(255 - waterLevel, 1);
  const base = ramp(altitude);
  return vegetation > 0 ? mix(base, FOREST, Math.min((vegetation / 255) * 1.3, 0.95)) : base;
}

function sample(grid: Uint8Array, width: number, height: number, u: number, v: number): number {
  const x = Math.min(Math.max(u, 0), width - 1);
  const y = Math.min(Math.max(v, 0), height - 1);
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = Math.min(x0 + 1, width - 1);
  const y1 = Math.min(y0 + 1, height - 1);
  const fx = x - x0;
  const fy = y - y0;
  const top = (grid[y0 * width + x0] ?? 0) * (1 - fx) + (grid[y0 * width + x1] ?? 0) * fx;
  const bottom = (grid[y1 * width + x0] ?? 0) * (1 - fx) + (grid[y1 * width + x1] ?? 0) * fx;
  return top * (1 - fy) + bottom * fy;
}

/** Cheap per-pixel hash, for the forest stipple. */
function hash(x: number, y: number): number {
  let h = (x * 374761393 + y * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return (h ^ (h >>> 16)) >>> 0;
}

/** Paints `terrain` into `image`, with `k` pixels per cell. */
export function renderTerrain(image: ImageData, terrain: Terrain, k: number): void {
  const { width, height, elevation, vegetation, waterLevel } = terrain;
  const data = image.data;
  const shore = waterLevel + 0.5;
  for (let py = 0; py < image.height; py += 1) {
    const v = (py + 0.5) / k - 0.5;
    for (let px = 0; px < image.width; px += 1) {
      const u = (px + 0.5) / k - 0.5;
      const e = sample(elevation, width, height, u, v);
      const gx =
        (sample(elevation, width, height, u + 1, v) - sample(elevation, width, height, u - 1, v)) /
        2;
      const gy =
        (sample(elevation, width, height, u, v + 1) - sample(elevation, width, height, u, v - 1)) /
        2;
      const slope = Math.max(Math.hypot(gx, gy), 0.05);
      const green = sample(vegetation, width, height, u, v);
      let [r, g, b] = cellColor(e, green, shore);
      const isLand = e > shore;
      const coast = (Math.abs(e - shore) / slope) * k;
      if (coast < 1.1) {
        [r, g, b] = INK;
      } else if (!isLand && coast < 2.2 * k) {
        r += (255 - r) * 0.18;
        g += (255 - g) * 0.18;
        b += (255 - b) * 0.18;
      }
      if (isLand) {
        const light = Math.min(Math.max(1 - (gx + gy) * 0.02, 0.6), 1.35);
        r *= light;
        g *= light;
        b *= light;
        if (green > 70 && hash(px, py) % (green > 170 ? 5 : 8) === 0) {
          r *= 0.72;
          g *= 0.72;
          b *= 0.72;
        }
      }
      const index = (py * image.width + px) * 4;
      data[index] = r;
      data[index + 1] = g;
      data[index + 2] = b;
      data[index + 3] = 255;
    }
  }
}
