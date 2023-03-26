import { frequency_ } from "./choice"

import type { Gen } from "../Gen"

/**
 * Generator of resolving promises.
 *
 * @remarks
 * Will always generate promises that resolve.
 *
 * - The given value generator determines growth properties.
 * - The given value generator determines shrink tree.
 *
 * @typeParam TVal - Type of values the generated promises will resolve to.
 *
 * @param valueGen - Generator used to generate the value the promise resolves
 *   to.
 * @nosideeffects
 */
export const resolvingPromise = <TVal>(
    valueGen: Gen<TVal>,
): Gen<Promise<TVal>> => valueGen.map(x => Promise.resolve(x))

/**
 * Generator of rejecting promises.
 *
 * @remarks
 * Will always generate promises that reject.
 *
 * - The given error/reason generator determines growth properties.
 * - The given errorr/reason generator determines shrink tree.
 *
 * @typeParam TErr - Type of rejected errors to generate promises of.
 *
 * @param errorGen - Generator used to generate the reason/error of the rejected
 *   promise.
 * @nosideeffects
 */
export const rejectingPromise = <TErr>(
    errorGen: Gen<TErr>,
): Gen<Promise<unknown>> => errorGen.map(err => Promise.reject(err))

/**
 * Generic promise generator.
 *
 * @remarks
 * Will generate resolving promises about 2/3 times, and rejecting promises 1/3
 * of the time.
 *
 * - Picked generator determines growth properties.
 * - Picked generator determines shrink tree.
 *
 * @typeParam TVal - Type of resolved values to generate promises of.
 * @typeParam TErr - Type of rejected errors to generate promises of.
 *
 * @param valueGen - Generator used to generate values for resoling promises.
 * @param errorGen - Generator used to generate errors for rejecting promises.
 * @nosideeffects
 */
export const promise = <TVal, TErr>(
    valueGen: Gen<TVal>,
    errorGen: Gen<TErr>,
): Gen<Promise<TVal>> =>
    frequency_(
        { weight: 1, gen: rejectingPromise(errorGen) as Gen<Promise<TVal>> },
        { weight: 2, gen: resolvingPromise(valueGen) },
    )
