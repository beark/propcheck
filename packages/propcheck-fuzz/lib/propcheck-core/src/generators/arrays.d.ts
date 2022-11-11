import { Gen, GeneratedType } from "../Gen";
import { Range } from "../Range";
/**
 * Generate an array by repeatedly running the given generator.
 *
 * - Length of array grows linearly with size.
 * - Shrinks length toward 0.
 *
 * @nosideeffects
 * @param {Gen<T>} g Element generator.
 * @returns {Gen<T[]>}
 */
export declare function arrayOf<T>(g: Gen<T>): Gen<T[]>;
/**
 * Generate an array with length somewhere in the given range.
 *
 * - Size invariant.
 * - No shrink tree.
 *
 * @nosideeffects
 * @param {Gen<T>} g Element generator.
 * @param {Range} r
 *   Integral range deciding which lengths are valid for the generated array.
 * @template T
 */
export declare function array_<T>(g: Gen<T>, r: Range): Gen<T[]>;
/**
 * Generate an array with length somewhere in the given range.
 *
 * - Size invariant.
 * - Shrinks length toward the origin of `r`.
 *
 * @nosideeffects
 * @param {Gen<T>} g Element generator.
 * @param {Range} r
 *   Integral range deciding which lengths are valid for the generated array.
 * @template T
 */
export declare function array<T>(g: Gen<T>, r: Range): Gen<T[]>;
/**
 * Generate a fixed length array of heterogenous types (aka a tuple).
 *
 * @nosideeffects
 * @param {Gen<any>[]} gs A tuple of generators.
 * @returns {Gen<any[]>} A generator of tuples.
 * @example
 * // tupleGen: Gen<[number, boolean]>;
 * const tupleGen = tuple(nat, bool);
 */
export declare function tuple<T extends Gen<any>[]>(...gs: T): Gen<{
    [K in keyof T]: GeneratedType<T[K]>;
}>;
//# sourceMappingURL=arrays.d.ts.map