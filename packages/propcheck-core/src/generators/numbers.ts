import Gen from "../Gen"
import { nextInt, nextNum } from "../prng"
import Range from "../Range"
import { towardsIntegral, towardsNum } from "../shrink"

/**
 * Generator of integral values within a given (inclusive) range.
 *
 * @remarks
 * - Size invariant.
 * - Shrinks towards the origin of the {@link Range}.
 *
 * @param r - The desired range of integral values to generate within.
 *
 * @throws `RangeError` if `r.origin` is not an integer.
 * @throws `RangeError` if `r.minBound` is not an integer.
 * @throws `RangeError` if `r.maxBound` is not an integer.
 *
 * @nosideeffects
 */
export function integral(r: Range): Gen<number> {
    if (!Number.isInteger(r.origin)) {
        throw new RangeError(
            "@propcheck/core/generators: integral requires origin to be an integer",
        )
    }

    return integral_(r).shrinkRecursively(x => towardsIntegral(r.origin, x))
}

/**
 * Generator of integral values within a given (inclusive) range.
 *
 * @remarks
 * - Size invariant.
 * - No shrink tree.
 *
 * @param r - The desired range of integral values to generate within.
 *
 * @throws `RangeError` if `r.minBound` is not an integer.
 * @throws `RangeError` if `r.maxBound` is not an integer.
 *
 * @nosideeffects
 */
export function integral_(r: Range): Gen<number> {
    const { minBound, maxBound } = r

    if (!Number.isInteger(minBound)) {
        throw new RangeError(
            "@propcheck/core/generators: integral_ requires minBound to be an integer",
        )
    }

    if (!Number.isInteger(maxBound)) {
        throw new RangeError(
            "@propcheck/core/generators: integral_ requires maxBound to be an integer",
        )
    }

    return Gen.fromFn((_, st) => nextInt(st, { minBound, maxBound }))
}

/**
 * Generator for the natural numbers (0, 1, 2, ...).
 *
 * @remarks
 * - Grows linearly with size.
 * - Shrinks towards 0.
 */
export const nat: Gen<number> = Gen.sized(sz => integral(new Range(0, sz, 0)))

/**
 * Generator for integers (..., -1, 0, 1, 2, ...).
 *
 * @remarks
 * - Abs of generated integer grows linearly with size.
 * - Shrinks towards 0.
 */
export const int: Gen<number> = Gen.sized(sz => integral(new Range(-sz, sz, 0)))

/**
 * Generator of floating numbers.
 *
 * @remarks
 * - Size invariant.
 * - Shrinks towards the origin of the given {@link Range}.
 *
 * @param r - Range to generate numbers within.
 *
 * @nosideeffects
 */
export function num(r: Range): Gen<number> {
    return num_(r).shrinkRecursively(x => towardsNum(r.origin, x))
}

/**
 * Generator of floating numbers.
 *
 * @remarks
 * - Size invariant.
 * - No shrink tree.
 *
 * @param r - Range to generate within.
 *
 * @nosideeffects
 */
export function num_(r: Range): Gen<number> {
    const { minBound, maxBound } = r

    return Gen.fromFn((_, st) => nextNum(st, { minBound, maxBound }))
}
