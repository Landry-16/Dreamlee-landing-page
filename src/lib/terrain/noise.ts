/**
 * Seeded gradient noise, ported from the Dreamlee desktop app
 * (`crates/dreamlee-core/src/terrain/noise.rs`): the same seed gives the
 * same terrain here and in the app.
 */

const MASK_64 = (1n << 64n) - 1n;

/** SplitMix64 pseudo-random generator (64-bit arithmetic with BigInt). */
export class Rng {
  private state: bigint;

  constructor(seed: bigint) {
    this.state = seed & MASK_64;
  }

  nextU64(): bigint {
    this.state = (this.state + 0x9e3779b97f4a7c15n) & MASK_64;
    let z = this.state;
    z = ((z ^ (z >> 30n)) * 0xbf58476d1ce4e5b9n) & MASK_64;
    z = ((z ^ (z >> 27n)) * 0x94d049bb133111ebn) & MASK_64;
    return z ^ (z >> 31n);
  }

  /** Uniform in `[0, 1)`. */
  nextFloat(): number {
    return Number(this.nextU64() >> 11n) / 2 ** 53;
  }

  /** Uniform in `[min, max)`. */
  range(min: number, max: number): number {
    return min + (max - min) * this.nextFloat();
  }
}

const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const lerp = (a: number, b: number, t: number) => a + t * (b - a);

/** Dot product with one of 8 gradient directions chosen by `hash`. */
function gradient(hash: number, x: number, y: number): number {
  switch (hash & 7) {
    case 0:
      return x + y;
    case 1:
      return x - y;
    case 2:
      return -x + y;
    case 3:
      return -x - y;
    case 4:
      return x;
    case 5:
      return -x;
    case 6:
      return y;
    default:
      return -y;
  }
}

/** 2D Perlin noise with a permutation table shuffled from a seed. */
export class Perlin {
  private readonly permutation = new Uint8Array(512);

  constructor(rng: Rng) {
    const table = Array.from({ length: 256 }, (_, i) => i);
    // Fisher–Yates shuffle.
    for (let i = table.length - 1; i >= 1; i -= 1) {
      const j = Number(rng.nextU64() % BigInt(i + 1));
      [table[i], table[j]] = [table[j] as number, table[i] as number];
    }
    for (let i = 0; i < 512; i += 1) this.permutation[i] = table[i % 256] as number;
  }

  /** Noise in roughly `[-1, 1]`. */
  at(x: number, y: number): number {
    const xFloor = Math.floor(x);
    const yFloor = Math.floor(y);
    const xf = x - xFloor;
    const yf = y - yFloor;
    const xi = xFloor & 255;
    const yi = yFloor & 255;
    const p = this.permutation;
    const hash = (i: number, j: number) => p[(p[i] as number) + j] as number;
    const u = fade(xf);
    const v = fade(yf);
    const a = lerp(gradient(hash(xi, yi), xf, yf), gradient(hash(xi + 1, yi), xf - 1, yf), u);
    const b = lerp(
      gradient(hash(xi, yi + 1), xf, yf - 1),
      gradient(hash(xi + 1, yi + 1), xf - 1, yf - 1),
      u,
    );
    return lerp(a, b, v) * Math.SQRT2;
  }

  /** Fractal sum of octaves ("fBm"), normalized to roughly `[-1, 1]`. */
  fractal(x: number, y: number, octaves: number, gain: number): number {
    let sum = 0;
    let amplitude = 1;
    let frequency = 1;
    let total = 0;
    for (let octave = 0; octave < octaves; octave += 1) {
      sum += amplitude * this.at(x * frequency, y * frequency);
      total += amplitude;
      amplitude *= gain;
      frequency *= 2;
    }
    return sum / total;
  }
}
