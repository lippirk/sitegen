export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * @example
 * ```ts
 * dp(1.23567, 2) === '1.24'
 * ```
 */
export const dp = (x: number, n: number) =>
  x.toLocaleString(undefined, {
    maximumFractionDigits: n,
    minimumFractionDigits: n,
  });

/**
 * @remarks
 * rand_int(a, b) \in { x \in Z | a <= x < b }
 */
export const rand_int = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min)) + min;

/**
 * @example
 * ```ts
 * arg_max([1, 5, 3]) === 1
 * ```
 */
export const arg_max = (array: Array<number>): number => {
  return array.map((x, i) => [x, i]).reduce((r, a) => (a[0] > r[0] ? a : r))[1];
};

export const sum = (array: Array<number>): number =>
  array.reduce((a, b) => a + b, 0);

export const mean = (array: Array<number>): number => sum(array) / array.length;

export const eq_objs_dirty = (o1: object, o2: object) =>
  JSON.stringify(o1) === JSON.stringify(o2);
