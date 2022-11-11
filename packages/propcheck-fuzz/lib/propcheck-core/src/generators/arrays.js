"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Gen_1 = require("../Gen");
const numbers_1 = require("./numbers");
/**
 * Generate an array by repeatedly running the given generator.
 *
 * - Length of array grows linearly with size.
 * - Shrinks length toward 0.
 *
 * @nosideeffects
 * @param {Gen<T>} g Element generator.
 * @returns {Gen<T[]>}
 */
function arrayOf(g) {
    return numbers_1.nat.andThen(n => g.repeat(n));
}
exports.arrayOf = arrayOf;
/**
 * Generate an array with length somewhere in the given range.
 *
 * - Size invariant.
 * - No shrink tree.
 *
 * @nosideeffects
 * @param {Gen<T>} g Element generator.
 * @param {Range} r
 *   Integral range deciding which lengths are valid for the generated array.
 * @template T
 */
function array_(g, r) {
    return numbers_1.integral_(r).andThen(n => g.repeat(n));
}
exports.array_ = array_;
/**
 * Generate an array with length somewhere in the given range.
 *
 * - Size invariant.
 * - Shrinks length toward the origin of `r`.
 *
 * @nosideeffects
 * @param {Gen<T>} g Element generator.
 * @param {Range} r
 *   Integral range deciding which lengths are valid for the generated array.
 * @template T
 */
function array(g, r) {
    return numbers_1.integral(r).andThen(n => g.repeat(n));
}
exports.array = array;
/**
 * Generate a fixed length array of heterogenous types (aka a tuple).
 *
 * @nosideeffects
 * @param {Gen<any>[]} gs A tuple of generators.
 * @returns {Gen<any[]>} A generator of tuples.
 * @example
 * // tupleGen: Gen<[number, boolean]>;
 * const tupleGen = tuple(nat, bool);
 */
function tuple(...gs) {
    return gs.reduce((a, c) => a.andThen((xs) => c.map(x => xs.concat([x]))), Gen_1.Gen.const([]));
}
exports.tuple = tuple;
