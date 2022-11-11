"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Generator of arbitrary functions.
 *
 * There is no computational connection between the arguments given to a
 * generated function and its result; the results are entirely based on the
 * given generator.
 *
 * However, the generated functions are effectively pure, as far as what can be
 * externally observed when they're called. Eg, a generated function `f` will
 * always return the exact same value when called with the same arguments. Of
 * course, it might return the same value for other arguments too.
 *
 * This is achieved by caching the generated return value for each argument
 * combination. `JSON.stringify` is used on the arguments array to generate the
 * cache keys, so make sure they are not recursive objects or arrays.
 *
 * If a test using this generator demonstrates performance or memory concerns,
 * try reducing `domainSize`.
 *
 * - Size of function results varies as per the given generator.
 * - No shrink tree.
 *
 * @nosideeffects
 * @param {Gen<TReturn>} retGen Return value generator.
 * @param {number} domainSize
 *   The number of possible unique input combinations. A new result value is
 *   generated for every new input combination until this amount has been
 *   generated, whereafter the return values loop around.
 * @returns {Gen<(...args: any[]) => TReturn>}
 * @template TReturn
 *   The type of the generated functions' codomain (the type they return).
 */
exports.fn = (retGen, domainSize = 50) => {
    const m = new Map();
    let i = 0;
    return retGen.repeat(domainSize).map(rets => (...args) => {
        const key = JSON.stringify(args);
        if (m.has(key)) {
            return m.get(key);
        }
        else {
            const used = i;
            m.set(key, rets[used]);
            if (++i === domainSize) {
                i = 0;
            }
            return rets[used];
        }
    });
};
