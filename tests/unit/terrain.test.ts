import { describe, expect, it } from "vitest";
import { generateTerrain, type GenerationParams } from "@/lib/terrain/generate";

const params = (seed: number, overrides: Partial<GenerationParams> = {}): GenerationParams => ({
  seed,
  seaLevel: 55,
  islands: 3,
  relief: 50,
  coast: 50,
  ...overrides,
});

const checksum = (grid: Uint8Array) =>
  grid.reduce((sum, value, index) => sum + ((index % 97) + 1) * value, 0);

describe("generateTerrain", () => {
  it("draws exactly the same maps as the desktop app", () => {
    // Reference values computed by `dreamlee_core::terrain::generate`.
    const a = generateTerrain(params(1234), 96, 64);
    expect(a.waterLevel).toBe(80);
    expect(checksum(a.elevation)).toBe(27105554);
    expect(a.vegetation.reduce((sum, v) => sum + v, 0)).toBe(175406);
    expect([...a.elevation.slice(3000, 3010)]).toEqual([
      142, 133, 117, 100, 84, 76, 73, 75, 71, 64,
    ]);

    const b = generateTerrain(params(48213, { seaLevel: 42, relief: 60, coast: 35 }), 96, 64);
    expect(b.waterLevel).toBe(63);
    expect(checksum(b.elevation)).toBe(26957273);
  });

  it("covers the requested share of the map with water", () => {
    for (const seaLevel of [20, 55, 85]) {
      const terrain = generateTerrain(params(9, { seaLevel }), 120, 80);
      const water = terrain.elevation.filter((e) => e <= terrain.waterLevel).length;
      expect(Math.abs((water / terrain.elevation.length) * 100 - seaLevel)).toBeLessThan(6);
    }
  });
});
