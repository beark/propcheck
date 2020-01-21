import { Gen } from "../Gen"
import { nextInt } from "../prng"

/**
 * Generate a boolean value.
 *
 * - Size invariant.
 * - No shrink tree.
 */
export const bool: Gen<boolean> = Gen.fromFn((_, st) =>
    nextInt(st, { minBound: 0, maxBound: 1 }) === 0 ? false : true,
)
