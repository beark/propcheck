import { frequency_ } from "."
import Gen from "../Gen"

/**
 * Generator of optional (possibly `undefined`) values.
 *
 * @remarks
 * An optional generator will always generate `undefined` first, after which
 * values from `g` are picked. This guarantees zero redundancy with regards to
 * `undefined`, and also means that shrinking does not have to account for
 * `undefined` (after all, if a property fails with `undefined` as input, it
 * will do so _immediately_, no shrinking necessary).
 *
 * - Size behavior is that of `g`.
 * - Shrink tree is that of `g`'s.
 *
 * @typeParam T - The generated type of `g`.
 *
 * @param g - Generator to add optionality as a possibility to.
 */
export function optional<T>(g: Gen<T>): Gen<T | undefined> {
    return frequency_(
        {
            weight: 1,
            gen: Gen.const(undefined),
        },
        {
            weight: 9,
            gen: g,
        },
    )
}

/**
 * Generator of nullable (possibly `null`) values.
 *
 * @remarks
 * A nullable generator will always generate `null` first, after which values
 * from `g` are picked. This guarantees zero redundancy with regards to `null`,
 * and also means that shrinking does not have to account for `null` (after all,
 * if a property failes with `null` as input, it will do so _immediately_, no
 * shrinking necessary).
 *
 * - Size behavior is that of `g`.
 * - Shrink tree is that of `g`'s.
 *
 * @typeParam T - The generated type of `g`.
 *
 * @param g - Generator to add `null` as a possibility to.
 */
export function nullable<T>(g: Gen<T>): Gen<T | null> {
    return frequency_(
        {
            weight: 1,
            gen: Gen.const(null),
        },
        {
            weight: 9,
            gen: g,
        },
    )
}

/**
 * Generator of values that are both optional and nullable.
 *
 * @remarks
 * This generator will always generate the sequence `[undefined, null]` first,
 * after which values from `g` are picked. This guarantees zero redundancy with
 * regards to `undefined` and `null`, and also means that shrinking does not
 * have to account for these values since they are the first to be tried.
 *
 * - Size behavior is that of `g`.
 * - Shrink tree is that of `g`'s.
 *
 * @typeParam T - The generated type of `g`.
 *
 * @param g - Generator to add `undefined` and `null` as possibiliities to.
 */
export function optionalNullable<T>(g: Gen<T>): Gen<T | undefined | null> {
    return frequency_(
        {
            weight: 1,
            gen: Gen.const(undefined),
        },
        {
            weight: 1,
            gen: Gen.const(null),
        },
        {
            weight: 9,
            gen: g,
        },
    )
}
