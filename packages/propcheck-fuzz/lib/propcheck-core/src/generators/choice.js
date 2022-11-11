"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Range_1 = require("../Range");
const numbers_1 = require("./numbers");
/**
 * Generator that picks one of the elements in a given list.
 *
 * - Size invariant.
 * - No shrink tree.
 *
 * @nosideeffects
 * @param {T[]} options The possible values to choose from.
 * @returns {Gen<T>}
 * @template T
 */
function elementOf_(...options) {
    if (options.length === 0) {
        throw new RangeError("@propcheck/core/Choice: elementOf needs at least one element to pick from");
    }
    return numbers_1.integral_(new Range_1.Range(0, options.length - 1, 0)).map(i => options[i]);
}
exports.elementOf_ = elementOf_;
/**
 * Generator that picks one of the elements in a given list.
 *
 * - Size invariant.
 * - Shrinks towards the first element in the array.
 *
 * @nosideeffects
 * @param {T[]} options The possible values to choose from.
 * @returns {Gen<T>}
 * @template T
 */
function elementOf(...options) {
    if (options.length === 0) {
        throw new RangeError("@propcheck/core/Choice: elementOf needs at least one element to pick from");
    }
    return numbers_1.integral(new Range_1.Range(0, options.length - 1, 0)).map(i => options[i]);
}
exports.elementOf = elementOf;
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
function oneOf_(...gens) {
    if (gens.length === 0) {
        throw new RangeError("@propcheck/core/Choice: oneOf needs at least one generator to pick from");
    }
    return numbers_1.integral_(new Range_1.Range(0, gens.length - 1, 0)).andThen(i => gens[i]);
}
exports.oneOf_ = oneOf_;
/**
 * Picks one of the given generators with equal probability and lets it generate
 * a value.
 *
 * - Picked generator determines growth properties.
 * - Shrinks towards the first generator.
 *
 * @nosideeffects
 * @param {Gen<T>[]} gens
 *   One or more generators to pick from. May be of different types, in which
 *   case the generated values will also be of different types.
 * @returns {Gen<T>}
 * @template T
 */
function oneOf(...gens) {
    if (gens.length === 0) {
        throw new RangeError("@propcheck/core/Choice: oneOf needs at least one generator to pick from");
    }
    return numbers_1.integral(new Range_1.Range(0, gens.length - 1, 0)).andThen(i => gens[i]);
}
exports.oneOf = oneOf;
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
function frequency_(...gens) {
    if (gens.length === 0) {
        throw new RangeError("@propcheck/core/Choice: frequency needs at least one generator to pick from");
    }
    const total = gens.reduce((a, e) => a + e.weight, 0);
    return numbers_1.integral_(new Range_1.Range(1, total, 1)).andThen(n => pick(n, gens));
}
exports.frequency_ = frequency_;
/**
 * Pick among a given set of weighted generators.
 *
 * The probability of picking a particular generator is equal to its weight
 * divided by the sum of all weights.
 *
 * - Picked generator determines growth properties.
 * - Shrinks towards the first given generator.
 *
 * @nosideffects
 * @param {WeightedGen<T>[]} gens
 * @returns {Gen<T>}
 * @template T
 */
function frequency(...gens) {
    if (gens.length === 0) {
        throw new RangeError("@propcheck/core/Choice: frequency needs at least one generator to pick from");
    }
    const total = gens.reduce((a, e) => a + e.weight, 0);
    return numbers_1.integral(new Range_1.Range(1, total, 1)).andThen(n => pick(n, gens));
}
exports.frequency = frequency;
const pick = (n, xs) => {
    const x = xs[0];
    return n <= x.weight ? x.gen : pick(n - x.weight, xs.slice(1));
};
