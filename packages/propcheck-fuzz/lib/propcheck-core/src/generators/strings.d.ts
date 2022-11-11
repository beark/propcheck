import type { Gen } from "../Gen";
/**
 * Generate a single printable ASCII character (excludes code points 0-31).
 *
 * - Size invariant.
 * - No shrink tree.
 */
export declare const ascii: Gen<string>;
/**
 * Generate a single ASCII character from the full set, including non-printable
 * characters.
 *
 * - Size invariant.
 * - No shrink tree.
 */
export declare const asciiAll: Gen<string>;
/**
 * Generate a single character from the printable latin1 set (32-255).
 *
 * - Size invariant
 * - No shrink tree.
 */
export declare const latin1: Gen<string>;
/**
 * Generate a single lower case alphabetic character.
 *
 * - Size invariant.
 * - No shrink tree.
 */
export declare const lower: Gen<string>;
/**
 * Generate a single upper case alphabetic character.
 *
 * - Size invariant.
 * - No shrink tree.
 */
export declare const upper: Gen<string>;
/**
 * Generate a single numeric digit/character.
 *
 * - Size invariant.
 * - No shrink tree.
 */
export declare const digit: Gen<string>;
/**
 * Generate a single alphabetic character.
 *
 * - Size invariant.
 * - No shrink tree.
 */
export declare const alpha: Gen<string>;
/**
 * Generate a single alpha-numeric character.
 *
 * - Size invariant.
 * - No shrink tree.
 */
export declare const alphaNum: Gen<string>;
/**
 * Generates a single unicode character that is _not_ any of the following:
 * - ASCII control character (0x0-0x1F)
 * - A surrogate
 * - In a private use area
 * - A non-character code
 * - Larger than 0xefffd
 *
 * The character may or may not actually be printable.
 *
 * - Size invariant
 * - No shrink tree.
 */
export declare const unicode: Gen<string>;
/**
 * Generate a string from a character generator.
 *
 * - Length of the string grows linearly with size.
 * - Shrinks towards a zero length string.
 *
 * @nosideeffects
 * @param {Gen<string>} char A generator for a single character.
 * @returns {Gen<string>}
 */
export declare function string(char: Gen<string>): Gen<string>;
//# sourceMappingURL=strings.d.ts.map