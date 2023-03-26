import { Range } from "../Range"
import { frequency, frequency_, oneOf_ } from "./choice"
import { integral_, nat } from "./numbers"

import type { Gen } from "../Gen"

/**
 * Generate a single printable ASCII character (excludes code points 0-31).
 *
 * @remarks
 * Characters are picked with a uniform distribution.
 *
 * - Size invariant.
 * - No shrink tree.
 */
export const ascii: Gen<string> = integral_(new Range(32, 127, 32)).map(
    String.fromCodePoint,
)

/**
 * Generate a single ASCII character from the full set, including non-printable
 * characters.
 *
 * @remarks
 * Characters are picked with a uniform distribution.
 *
 * - Size invariant.
 * - No shrink tree.
 */
export const asciiAll: Gen<string> = integral_(new Range(0, 127, 0)).map(
    String.fromCodePoint,
)

/**
 * Generate a single character from the printable latin1 set (32-255).
 *
 * @remarks
 * - Size invariant.
 * - No shrink tree.
 */
export const latin1: Gen<string> = integral_(new Range(32, 255, 0)).map(
    String.fromCodePoint,
)

/**
 * Generate a single lower case alphabetic character.
 *
 * @remarks
 * Characters are picked with a uniform distribution.
 *
 * - Size invariant.
 * - No shrink tree.
 */
export const lower: Gen<string> = integral_(new Range(97, 122, 97)).map(
    String.fromCodePoint,
)

/**
 * Generate a single upper case alphabetic character.
 *
 * @remarks
 * Characters are picked with a uniform distribution.
 *
 * - Size invariant.
 * - No shrink tree.
 */
export const upper: Gen<string> = integral_(new Range(65, 90, 65)).map(
    String.fromCodePoint,
)

/**
 * Generate a single numeric digit/character.
 *
 * @remarks
 * Characters are picked with a uniform distribution.
 *
 * - Size invariant.
 * - No shrink tree.
 */
export const digit: Gen<string> = integral_(new Range(48, 57, 48)).map(
    String.fromCodePoint,
)

/**
 * Generate a single alphabetic character.
 *
 * @remarks
 * Characters are picked with a uniform distribution.
 *
 * - Size invariant.
 * - No shrink tree.
 */
export const alpha: Gen<string> = oneOf_(lower, upper)

/**
 * Generate a single alpha-numeric character.
 *
 * @remarks
 * Characters are picked with a uniform distribution.
 *
 * - Size invariant.
 * - No shrink tree.
 */
export const alphaNum: Gen<string> = frequency_(
    { weight: 10, gen: digit },
    { weight: 26, gen: lower },
    { weight: 26, gen: upper },
)

/**
 * Generates a single unicode character that is _not_ any of the following:
 *
 * @remarks
 * - ASCII control character (0x0-0x1F)
 * - A surrogate.
 * - In a private use area.
 * - A non-character code.
 * - Larger than 0xefffd.
 *
 * Characters are picked with a uniform distribution and may or may not actually
 * be printable.
 *
 * - Size invariant.
 * - No shrink tree.
 */
export const unicode: Gen<string> = frequency_(
    {
        weight: 0xd7ff - 0x20,
        gen: integral_(new Range(0x20, 0xd7ff, 0)),
    },
    {
        weight: 0xefffd - 0xfdf0,
        gen: integral_(new Range(0xfdf0, 0xefffd, 0)),
    },
)
    .suchThat(c => nonCharacters.indexOf(c) === -1)
    .map(String.fromCodePoint)

/**
 * Generates a single unicode character that is _not_ any of the following:
 *
 * @remarks
 * - ASCII control character (0x0-0x1F)
 * - A surrogate.
 * - In a private use area.
 * - A non-character code.
 * - Larger than 0xefffd.
 *
 * Characters are picked from the ASCII set approximately 3/4th of the time, and
 * from the rest of the unicode set the remaining time. Generated characters may
 * or may not be printable.
 *
 * - Size invariant.
 * - Shrinks towards the ASCII set.
 */
export const asciiBiasedUnicode: Gen<string> = frequency(
    {
        weight: 3,
        gen: ascii,
    },
    {
        weight: 1,
        gen: integral_(new Range(0xfdf0, 0xefffd, 0))
            .suchThat(c => nonCharacters.indexOf(c) === -1)
            .map(String.fromCharCode),
    },
)

/**
 * Generate a string from a character generator.
 *
 * @remarks
 * - Length of the string grows linearly with size.
 * - Shrinks towards a zero length string. Shrinks from the `char` generator are
 *   not propagated.
 *
 * @param char - A generator for a single character.
 *
 * @nosideeffects
 */
export function string(char: Gen<string>): Gen<string> {
    return nat.andThen(n => char.repeat(n)).map(ss => ss.join(""))
}

/* Invalid code points, for reference
 * - Leading surrogates 0xd800-0xdbff
 * - Trailing surrogates 0xdc00-0xdfff
 * - Private use areas 0xe000-0xf8ff, 0xf0000-0xffffd, 0x100000-0x10fffd
 * - Non-characters 0xfffe, 0xffff; 0x1fffe, 0x1ffff; ...; 0x10fffe, 0x10ffff
 * - Non-characters 0xfdd0-0xfdef
 */

const nonCharacters = [
    0xfffe, 0xffff, 0x1fffe, 0x1ffff, 0x2fffe, 0x2ffff, 0x3fffe, 0x3ffff,
    0x4fffe, 0x4ffff, 0x5fffe, 0x5ffff, 0x6fffe, 0x6ffff, 0x7fffe, 0x7ffff,
    0x8fffe, 0x8ffff, 0x9fffe, 0x9ffff, 0xafffe, 0xaffff, 0xbfffe, 0xbffff,
    0xcfffe, 0xcffff, 0xdfffe, 0xdffff,
]
