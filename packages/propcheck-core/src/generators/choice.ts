import { Range } from "../Range"
import { integral, integral_ } from "./numbers"

import type { Gen, GeneratedType } from "../Gen"
import type { TupleToUnion } from "../type-utils"

/**
 * Generator that picks one of the elements in a given list with uniform
 * distribution.
 *
 * @remarks
 * - Size invariant.
 * - No shrink tree.
 *
 * @param options - The possible values to choose from.
 *
 * @nosideeffects
 */
export function elementOf_<T>(...options: T[]): Gen<T> {
    if (options.length === 0) {
        throw new RangeError(
            "@propcheck/core/generators: elementOf needs at least one element to pick from",
        )
    }

    // Since options.length > 0 and we generate an integer in range [0..options.length-1), the indexing has to be safe.
    return integral_(new Range(0, options.length - 1, 0)).map(i => options[i]!)
}

/**
 * Generator that picks one of the elements in a given list with uniform
 * distribution.
 *
 * @remarks
 * - Size invariant.
 * - Shrinks towards the first element in the array.
 *
 * @param options - The possible values to choose from.
 *
 * @nosideeffects
 */
export function elementOf<T>(...options: T[]): Gen<T> {
    if (options.length === 0) {
        throw new RangeError(
            "@propcheck/core/generators: elementOf needs at least one element to pick from",
        )
    }

    // Since options.length > 0 and we generate an integer in range [0..options.length-1), the indexing has to be safe.
    return integral(new Range(0, options.length - 1, 0)).map(i => options[i]!)
}

type UnionOfGeneratedTypes<T extends Gen<unknown>[]> = TupleToUnion<{
    [K in keyof T]: GeneratedType<T[K]>
}>

/**
 * Picks one of the given generators with equal probability and lets it generate
 * a value.
 *
 * @remarks
 * - Picked generator determines growth properties.
 * - Picked generator determines shrink tree.
 *
 * @param gens - One or more generators to pick from. May be of different types,
 *   in which case the generated values will also be of different types.
 * @nosideeffects
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function oneOf_<T extends Gen<any>[]>(
    ...gens: T
): Gen<UnionOfGeneratedTypes<T>> {
    if (gens.length === 0) {
        throw new RangeError(
            "@propcheck/core/generators: oneOf needs at least one generator to pick from",
        )
    }

    // Since gens.length > 0 and we generate an integer in range [0..gens.length-1), the indexing has to be safe.
    return integral_(new Range(0, gens.length - 1, 0)).andThen(i => gens[i]!)
}

/**
 * Picks one of the given generators with equal probability and lets it generate
 * a value.
 *
 * @remarks
 * - Picked generator determines growth properties.
 * - Shrinks towards the first generator in addition to how the picked generator
 *   shrinks.
 *
 * @param gens - One or more generators to pick from. May be of different types,
 *   in which case the generated values will also be of different types.
 * @nosideeffects
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function oneOf<T extends Gen<any>[]>(
    ...gens: T
): Gen<UnionOfGeneratedTypes<T>> {
    if (gens.length === 0) {
        throw new RangeError(
            "@propcheck/core/generators: oneOf needs at least one generator to pick from",
        )
    }

    // Since gens.length > 0 and we generate an integer in range [0..gens.length-1), the indexing has to be safe.
    return integral(new Range(0, gens.length - 1, 0)).andThen(i => gens[i]!)
}

/**
 * A pair consisting of a weight and a generator.
 */
export type WeightedGen<T> = {
    /**
     * The weight assigned to `gen`. Should be a positive integer.
     */
    weight: number

    /**
     * A generator of `T`s.
     */
    gen: Gen<T>
}

/**
 * Pick among a given set of weighted generators.
 *
 * @remarks
 * The probability of picking a particular generator is equal to its weight
 * divided by the sum of all weights.
 *
 * - Picked generator determines growth properties.
 * - Picked generator determines shrink tree.
 *
 * @throws `RangeError` if `gens.length === 0`.
 * @throws `RangeError` if any of the weights are non-integral or `< 0`.
 *
 * @nosideeffects
 */
export function frequency_<T>(...gens: WeightedGen<T>[]): Gen<T> {
    if (gens.length === 0) {
        throw new RangeError(
            "@propcheck/core/generators: frequency_ needs at least one generator to pick from",
        )
    }

    const total = gens.reduce((a, e) => {
        if (!Number.isInteger(e.weight) || e.weight < 0) {
            throw new RangeError(
                "@propcheck/core/generators: frequency_ requires all weights to be positive integers",
            )
        }

        return a + e.weight
    }, 0)

    return integral_(new Range(1, total, 1)).andThen(n => pick(n, gens))
}

/**
 * Pick among a given set of weighted generators.
 *
 * @remarks
 * The probability of picking a particular generator is equal to its weight
 * divided by the sum of all weights.
 *
 * - Picked generator determines growth properties.
 * - Shrinks both towards the first given generator, and according to whatever
 *   generator was picked.
 *
 * @throws `RangeError` if `gens` doesn't have at least one element.
 * @throws `RangeError` if any given weight is non-integral or `< 0`.
 *
 * @nosideeffects
 */
export function frequency<T>(...gens: WeightedGen<T>[]): Gen<T> {
    if (gens.length === 0) {
        throw new RangeError(
            "@propcheck/core/generators: frequency needs at least one generator to pick from",
        )
    }

    const total = gens.reduce((a, e) => {
        if (!Number.isInteger(e.weight) || e.weight < 0) {
            throw new RangeError(
                "@propcheck/core/generators: frequency requires all weights to be positive integers",
            )
        }
        return a + e.weight
    }, 0)

    return integral(new Range(1, total, 1)).andThen(n => pick(n, gens))
}

const pick = <T>(n: number, xs: WeightedGen<T>[]): Gen<T> => {
    const [x] = xs
    if (typeof x === "undefined") {
        throw new Error(
            "@propcheck/core/generators: impossible weight distribution encountered",
        )
    }
    return n <= x.weight ? x.gen : pick(n - x.weight, xs.slice(1))
}
