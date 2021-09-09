import { Range } from "../Range"
import { integral, integral_ } from "./numbers"

import type { Gen, GeneratedType } from "../Gen"
import type { TupleToUnion } from "../type-utils"

/**
 * Generator that picks one of the elements in a given list with uniform
 * distribution.
 *
 * - Size invariant.
 * - No shrink tree.
 *
 * @nosideeffects
 * @param {T[]} options The possible values to choose from.
 * @returns {Gen<T>}
 * @template T
 */
export function elementOf_<T>(...options: T[]): Gen<T> {
    if (options.length === 0) {
        throw new RangeError(
            "@propcheck/core/generators: elementOf needs at least one element to pick from",
        )
    }

    return integral_(new Range(0, options.length - 1, 0)).map(i => options[i])
}

/**
 * Generator that picks one of the elements in a given list with uniform
 * distribution.
 *
 * - Size invariant.
 * - Shrinks towards the first element in the array.
 *
 * @nosideeffects
 * @param {T[]} options The possible values to choose from.
 * @returns {Gen<T>}
 * @template T
 */
export function elementOf<T>(...options: T[]): Gen<T> {
    if (options.length === 0) {
        throw new RangeError(
            "@propcheck/core/generators: elementOf needs at least one element to pick from",
        )
    }

    return integral(new Range(0, options.length - 1, 0)).map(i => options[i])
}

type UnionOfGeneratedTypes<T extends Gen<unknown>[]> = TupleToUnion<
    { [K in keyof T]: GeneratedType<T[K]> }
>

/**
 * Picks one of the given generators with equal probability and lets it generate
 * a value.
 *
 * - Picked generator determines growth properties.
 * - Picked generator determines shrink tree.
 *
 * @nosideeffects
 * @param {Gen<T>[]} gens
 *   One or more generators to pick from. May be of different types, in which
 *   case the generated values will also be of different types.
 * @returns {Gen<T>}
 * @template T
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

    return integral_(new Range(0, gens.length - 1, 0)).andThen(i => gens[i])
}

/**
 * Picks one of the given generators with equal probability and lets it generate
 * a value.
 *
 * - Picked generator determines growth properties.
 * - Shrinks towards the first generator in addition to how the picked generator
 *   shrinks.
 *
 * @nosideeffects
 * @param {Gen<T>[]} gens
 *   One or more generators to pick from. May be of different types, in which
 *   case the generated values will also be of different types.
 * @returns {Gen<T>}
 * @template T
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

    return integral(new Range(0, gens.length - 1, 0)).andThen(i => gens[i])
}

/**
 * A pair consisting of a weight and a generator.
 *
 * @template T
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
 * The probability of picking a particular generator is equal to its weight
 * divided by the sum of all weights.
 *
 * - Picked generator determines growth properties.
 * - Picked generator determines shrink tree.
 *
 * @nosideffects
 * @param {WeightedGen<T>[]} gens
 * @returns {Gen<T>}
 * @template T
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
 * The probability of picking a particular generator is equal to its weight
 * divided by the sum of all weights.
 *
 * - Picked generator determines growth properties.
 * - Shrinks both towards the first given generator, and according to whatever
 *   generator was picked.
 *
 * @nosideffects
 * @param {WeightedGen<T>[]} gens
 * @returns {Gen<T>}
 * @template T
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
    const x = xs[0]
    return n <= x.weight ? x.gen : pick(n - x.weight, xs.slice(1))
}
