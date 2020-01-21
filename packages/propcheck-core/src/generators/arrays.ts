import { Gen, GeneratedType } from "../Gen"
import { Range } from "../Range"
import { integral, integral_, nat } from "./numbers"

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
export function arrayOf<T>(g: Gen<T>): Gen<T[]> {
    return nat.andThen(n => g.repeat(n))
}

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
export function array_<T>(g: Gen<T>, r: Range): Gen<T[]> {
    return integral_(r).andThen(n => g.repeat(n))
}

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
export function array<T>(g: Gen<T>, r: Range): Gen<T[]> {
    return integral(r).andThen(n => g.repeat(n))
}

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
export function tuple<T extends Gen<any>[]>(
    ...gs: T
): Gen<{ [K in keyof T]: GeneratedType<T[K]> }> {
    return gs.reduce(
        (a, c) => a.andThen((xs: any[]) => c.map(x => xs.concat([x]))),
        Gen.const([]),
    )
}
