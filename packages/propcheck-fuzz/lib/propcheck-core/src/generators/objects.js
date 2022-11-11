"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Gen_1 = require("../Gen");
/**
 * Given an object where each property is a generator, returns a generator that
 * will produce an object out of those.
 *
 * - Each sub-generator will vary with size as per their own definition.
 * - No shrink tree.
 *
 * @nosideeffects
 * @param {ObjectGenerator<T>} gen
 *   Effectively a set of key/generator pairs, where each will be used to
 *   compose a generator objects of the desired type.
 * @returns {Gen<T>}
 * @template T
 * @example
 * // g: Gen<{ a: string, b: number }>
 * const g = obj_({ a: alphaChar, b: nat });
 */
function obj_(gen) {
    if (Object.keys(gen).length === 0) {
        return Gen_1.Gen.const({});
    }
    let resultGen;
    // eslint-disable-next-line guard-for-in
    for (const g in gen) {
        const thisGen = gen[g].map(v => ({ [g]: v }));
        resultGen = resultGen
            ? resultGen.andThen(o => thisGen
                .map(p => Object.assign(Object.assign({}, o), p))
                .pruneShrinkTree())
            : thisGen.pruneShrinkTree();
    }
    return resultGen;
}
exports.obj_ = obj_;
/**
 * Given an object where each property is a generator, returns a generator that
 * will produce an object out of those.
 *
 * - Each sub-generator will vary with size as per their own definition.
 * - Each sub-generator will shrink as per their own definition.
 *
 * @nosideeffects
 * @param {ObjectGenerator<T>} gen
 *   Effectively a set of key/generator pairs, where each will be used to
 *   compose a generator objects of the desired type.
 * @returns {Gen<T>}
 * @template T
 * @example
 * // g: Gen<{ a: string, b: number }>
 * const g = obj({ a: alphaChar, b: nat });
 */
function obj(gen) {
    if (Object.keys(gen).length === 0) {
        return Gen_1.Gen.const({});
    }
    let resultGen;
    // eslint-disable-next-line guard-for-in
    for (const g in gen) {
        const thisGen = gen[g].map(v => ({ [g]: v }));
        resultGen = resultGen
            ? resultGen.andThen(o => thisGen.map(p => Object.assign(Object.assign({}, o), p)))
            : thisGen;
    }
    return resultGen;
}
exports.obj = obj;
