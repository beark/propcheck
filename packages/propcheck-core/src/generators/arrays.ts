import { Gen, GeneratedType } from "../Gen"
import { Range } from "../Range"
import { integral, integral_, nat } from "./numbers"

/**
 * Generate an array by repeatedly running the given generator.
 *
 * @remarks
 * - Length of array grows linearly with size, elements grow as per `g`.
 * - Shrinks length toward 0.
 *
 * @param g - Element generator.
 *
 * @nosideeffects
 */
export function arrayOf<T>(g: Gen<T>): Gen<T[]> {
    return nat.andThen(n => g.repeat(n))
}

/**
 * Generate an array with length uniformly picked in the given range.
 *
 * @remarks
 * - Elements grow as per `g`.
 * - No shrink tree.
 *
 * @param g - Element generator.
 * @param r - Integral range deciding which lengths are valid for the generated
 *   array.
 * @nosideeffects
 */
export function array_<T>(g: Gen<T>, r: Range): Gen<T[]> {
    if (!Number.isInteger(r.minBound) || r.minBound < 0) {
        throw new RangeError(
            "@propcheck/core/generators: array_ must have an integral minBound >= 0",
        )
    }

    if (!Number.isInteger(r.maxBound) || r.maxBound <= r.minBound) {
        throw new RangeError(
            "@propcheck/core/generators: array_ must have an integral maxBound > minBound",
        )
    }

    return integral_(r).andThen(n => g.repeat(n))
}

/**
 * Generate an array with length uniformly picked in the given range.
 *
 * @remarks
 * - Elements grow as per `g`.
 * - Shrinks length toward the origin of `r`.
 *
 * @param g - Element generator.
 * @param r - Integral range deciding which lengths are valid for the generated
 *   array.
 * @throws `RangeError` if `r.minBound` is not an integer `>= 0`.
 * @throws `RangeError` if `r.maxBound` is not an integer `> r.minBound`.
 * @throws `RangeError` if `r.origin` is not an integer.
 *
 * @nosideeffects
 */
export function array<T>(g: Gen<T>, r: Range): Gen<T[]> {
    if (!Number.isInteger(r.minBound) || r.minBound < 0) {
        throw new RangeError(
            "@propcheck/core/generators: array must have an integral minBound >= 0",
        )
    }

    if (!Number.isInteger(r.maxBound) || r.maxBound <= r.minBound) {
        throw new RangeError(
            "@propcheck/core/generators: array must have an integral maxBound > minBound",
        )
    }

    if (!Number.isInteger(r.origin)) {
        throw new RangeError(
            "@propcheck/core/generators: array must have an integral origin",
        )
    }

    return integral(r).andThen(n => g.repeat(n))
}

/**
 * Generate a fixed length array of heterogenous types (aka a tuple).
 *
 * @remarks
 * - Elements grow as per their generator.
 * - Elements shrink as per their generator.
 *
 * @example
 *
 * ```ts
 * // tupleGen: Gen<[number, boolean]>;
 * const tupleGen = tuple(nat, bool)
 * ```
 *
 * @param gs - A tuple of generators.
 *
 * @returns A generator of tuples.
 *
 * @nosideeffects
 */
export function tuple<T extends Gen<unknown>[]>(
    ...gs: T
): Gen<{ [K in keyof T]: GeneratedType<T[K]> }> {
    return gs.reduce<Gen<unknown[]>>(
        (a, c) => a.andThen(xs => c.map(x => xs.concat([x]))),
        Gen.const([]),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) as any
}
