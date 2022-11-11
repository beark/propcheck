"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Range_1 = require("../Range");
const choice_1 = require("./choice");
const numbers_1 = require("./numbers");
/**
 * Generate a single printable ASCII character (excludes code points 0-31).
 *
 * - Size invariant.
 * - No shrink tree.
 */
exports.ascii = numbers_1.integral_(new Range_1.Range(32, 127, 32)).map(String.fromCodePoint);
/**
 * Generate a single ASCII character from the full set, including non-printable
 * characters.
 *
 * - Size invariant.
 * - No shrink tree.
 */
exports.asciiAll = numbers_1.integral_(new Range_1.Range(0, 127, 0)).map(String.fromCodePoint);
/**
 * Generate a single character from the printable latin1 set (32-255).
 *
 * - Size invariant
 * - No shrink tree.
 */
exports.latin1 = numbers_1.integral_(new Range_1.Range(32, 255, 0)).map(String.fromCodePoint);
/**
 * Generate a single lower case alphabetic character.
 *
 * - Size invariant.
 * - No shrink tree.
 */
exports.lower = numbers_1.integral_(new Range_1.Range(97, 122, 97)).map(String.fromCodePoint);
/**
 * Generate a single upper case alphabetic character.
 *
 * - Size invariant.
 * - No shrink tree.
 */
exports.upper = numbers_1.integral_(new Range_1.Range(65, 90, 65)).map(String.fromCodePoint);
/**
 * Generate a single numeric digit/character.
 *
 * - Size invariant.
 * - No shrink tree.
 */
exports.digit = numbers_1.integral_(new Range_1.Range(48, 57, 48)).map(String.fromCodePoint);
/**
 * Generate a single alphabetic character.
 *
 * - Size invariant.
 * - No shrink tree.
 */
exports.alpha = choice_1.oneOf_(exports.lower, exports.upper);
/**
 * Generate a single alpha-numeric character.
 *
 * - Size invariant.
 * - No shrink tree.
 */
exports.alphaNum = choice_1.frequency_({ weight: 10, gen: exports.digit }, { weight: 26, gen: exports.lower }, { weight: 26, gen: exports.upper });
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
exports.unicode = choice_1.frequency_({
    weight: 0xd7ff - 0x20,
    gen: numbers_1.integral_(new Range_1.Range(0x20, 0xd7ff, 0)),
}, {
    weight: 0xefffd - 0xfdf0,
    gen: numbers_1.integral_(new Range_1.Range(0xfdf0, 0xefffd, 0)),
})
    .suchThat(c => nonCharacters.indexOf(c) === -1)
    .map(String.fromCodePoint);
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
function string(char) {
    return numbers_1.nat.andThen(n => char.repeat(n)).map(ss => ss.join(""));
}
exports.string = string;
/* Invalid code ppoints, for reference
 * - Leading surrogates 0xd800-0xdbff
 * - Trailing surrogates 0xdc00-0xdfff
 * - Private use areas 0xe000-0xf8ff, 0xf0000-0xffffd, 0x100000-0x10fffd
 * - Non-characters 0xfffe, 0xffff; 0x1fffe, 0x1ffff; ...; 0x10fffe, 0x10ffff
 * - Non-characters 0xfdd0-0xfdef
 */
const nonCharacters = [
    0xfffe,
    0xffff,
    0x1fffe,
    0x1ffff,
    0x2fffe,
    0x2ffff,
    0x3fffe,
    0x3ffff,
    0x4fffe,
    0x4ffff,
    0x5fffe,
    0x5ffff,
    0x6fffe,
    0x6ffff,
    0x7fffe,
    0x7ffff,
    0x8fffe,
    0x8ffff,
    0x9fffe,
    0x9ffff,
    0xafffe,
    0xaffff,
    0xbfffe,
    0xbffff,
    0xcfffe,
    0xcffff,
    0xdfffe,
    0xdffff,
];
