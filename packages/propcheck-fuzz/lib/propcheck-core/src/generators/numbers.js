"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Gen_1 = require("../Gen");
const prng_1 = require("../prng");
const Range_1 = require("../Range");
const shrink_1 = require("../shrink");
/**
 * Generator of integral values within a given (inclusive) range.
 *
 * - Size invariant.
 * - Shrinks towards the origin of the {@link Range}.
 *
 * @nosideeffects
 * @param {Range} r The desired range of integral values to generate within.
 * @returns {Gen<number>}
 */
function integral(r) {
    return integral_(r).shrinkRecursively(x => shrink_1.towardsIntegral(r.origin, x));
}
exports.integral = integral;
/**
 * Generator of integral values within a given (inclusive) range.
 *
 * - Size invariant.
 * - No shrink tree.
 *
 * @nosideeffects
 * @param {Range} r The desired range of integral values to generate within.
 * @returns {Gen<number>}
 */
function integral_(r) {
    const { minBound, maxBound } = r;
    return Gen_1.default.fromFn((_, st) => prng_1.nextInt(st, { minBound, maxBound }));
}
exports.integral_ = integral_;
/**
 * Generator for the natural numbers (0, 1, 2, ...).
 *
 * - Grows linearly with size.
 * - Shrinks towards 0.
 */
exports.nat = Gen_1.default.sized(sz => integral(new Range_1.default(0, sz, 0)));
/**
 * Generator for integers (..., -1, 0, 1, 2, ...).
 *
 * - Abs of generated integer grows linearly with size.
 * - Shrinks towards 0.
 */
exports.int = Gen_1.default.sized(sz => integral(new Range_1.default(-sz, sz, 0)));
/**
 * Generator of floating numbers.
 *
 * - Size invariant.
 * - Shrinks towards the origin of the given {@link Range}.
 *
 * @nosideeffects
 * @param {Range<number>} r Range to generate numbers within.
 * @returns {Gen<number>}
 */
function num(r) {
    return num_(r).shrinkRecursively(x => shrink_1.towardsNum(r.origin, x));
}
exports.num = num;
/**
 * Generator of floating numbers.
 *
 * - Size invariant.
 * - No shrink tree.
 *
 * @nosideeffects
 * @param {Range<number>} r Range to generate within.
 * @returns {Gen<number>}
 */
function num_(r) {
    const { minBound, maxBound } = r;
    return Gen_1.default.fromFn((_, st) => prng_1.nextNum(st, { minBound, maxBound }));
}
exports.num_ = num_;
