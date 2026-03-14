export function randomSeed() {
  return Math.floor(Math.abs((Math.random() * 2) ** 32));
}

export function createRNG(seed = randomSeed()): Seeder {
  let state = seed >>> 0; // Ensures the seed is an unsigned 32-bit integer

  function generateNumber() {
    let t = (state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0);
  }

  return {
    next: generateNumber,
    nextInt: generateNumber,
    nextFloatFrom0to1: () => generateNumber() / 2 ** 32,
    nextBoolean: () => (generateNumber() & 1) === 1,
    nextString(length = 8, caseSensitive = false) {
      const chars =
        (caseSensitive ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : '') +
        'abcdefghijklmnopqrstuvwxyz0123456789';
      let s = '';

      for (let i = 0; i < length; i++) {
        s += chars[generateNumber() % chars.length]!;
      }

      return s;
    },

    nextFromIntRange: (min, max) =>
      min + Math.floor((generateNumber() * (max - min + 1)) / 2 ** 32),

    nextFromFloatRange: (min, max) =>
      min + (max - min) * (generateNumber() / 2 ** 32),

    /**
     * Creates a random date between start range and end range
     * @param [start=new Date("01-01-2000")] The beginning date (default is January 1, 2000)
     * @param [end=new Date()]  The end date (defaults to current date).
     */
    nextDate(start = new Date('2000-01-01'), end = new Date()) {
      const range = end.getTime() - start.getTime();
      const offset = Math.floor((generateNumber() * range) / 2 ** 32);
      return new Date(start.getTime() + offset);
    },

    pickFrom: (arr) => arr[generateNumber() % arr.length]!,
  };
}

export interface Seeder {
  next(): number;

  /** This exists just to satisfy some purists. Exactly the same as `next()` anyways */
  nextInt(): number;
  nextFloatFrom0to1(): number;
  nextBoolean(): boolean;
  nextString(length?: number, caseSensitive?: boolean): string;
  nextFromIntRange(min: number, max: number): number;
  nextFromFloatRange(min: number, max: number): number;
  nextDate(start?: Date, end?: Date): Date;
  pickFrom<T>(arr: readonly T[]): T;
}
