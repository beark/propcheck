import { Seq } from "lazy-sequences";
/**
 * Generate a shrink sequence towards some given integral number.
 *
 * @nosideeffects
 * @param {number} destination Integral value to shrink towards.
 * @param {number} x Value to start shrinking from.
 * @returns {Seq<number>}
 * @example
 * towardsIntegral(0, 10).collect()
 *   === [0, 5, 8, 9]
 */
export declare function towardsIntegral(destination: number, x: number): Seq<number>;
/**
 * Generate a shrink sequence by edging towards some given number.
 *
 * @nosideeffects
 * @param {number} destination Value to edge towards.
 * @param {number} x Value to start shrinking from.
 * @param {number=} iterationLimit
 *   Optional limit on how many shrink iterations to generate. Defaults to 7.
 * @returns {Seq<number>}
 * @example
 * towardsNum(0, 100).collect()
 *   === [0, 50, 75, 87.5, 93.75, 96.875, 98.4375]
 */
export declare function towardsNum(destination: number, x: number, iterationLimit?: number): Seq<number>;
//# sourceMappingURL=shrink.d.ts.map