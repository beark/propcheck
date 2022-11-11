"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prng_1 = require("./prng");
const Tree_1 = require("./Tree");
/**
 * Given a set of generators, produce a test runner that can be used to check a
 * matching property.
 *
 * @nosideeffects
 * @param {TGens} gens
 *   A parameter pack of generators for the parameter types of the property that
 *   is to be tested.
 * @returns {Runner<Given<TGens>>}
 * @template TGens Some tuple of generators.
 * @example
 * declare const property: (x: number) => boolean;
 *
 * const result = given(nat).check(property)
 */
function given(...gens) {
    return makeTestConfig(gens, defaultOpts);
}
exports.given = given;
/**
 * Try to find the smallest arguments for which the given (failed) property
 * still fails.
 *
 * @nosideeffects
 * @param {(...args: TArgs) => unknown} prop A failed property.
 * @param {[Tree<TArgs[0], Tree<TArgs[1]>, ...]>} args
 *   Shrink trees of all the generated arguments for which the given property
 *   failed.
 * @returns {ShrinkResult<TArgs>}
 * @template TArgs The parameter types of the property.
 */
function shrink(prop, args) {
    let shrinks = 0;
    const smallestFailingArgs = args.slice().map(t => t.value);
    for (let i = 0; i < args.length; ++i) {
        const singleResult = tryShrinkSingle(prop, args, i);
        shrinks += singleResult.shrinks;
        if (singleResult.smallestFailingArgs !== undefined) {
            smallestFailingArgs[i] = singleResult.smallestFailingArgs[i];
            args[i] = Tree_1.default.singleton(smallestFailingArgs[i]);
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return { shrinks, smallestFailingArgs: smallestFailingArgs };
}
exports.shrink = shrink;
const defaultOpts = Object.freeze({
    iterations: 100,
    startIteration: 1,
    startSize: 3,
    maxSize: 10000,
    seed: "default",
});
function makeTestConfig(gens, opts) {
    if (!(opts.iterations > 0 && Number.isInteger(opts.iterations))) {
        throw new RangeError("@propcheck/core/Runner: iterations must be an integer > 0");
    }
    if (!(opts.startIteration >= 0 && Number.isInteger(opts.startIteration))) {
        throw new RangeError("@propcheck/core/Runner: startIteration must be an integer >= 0");
    }
    if (!(opts.startSize >= 0 && Number.isInteger(opts.startSize))) {
        throw new RangeError("@propcheck/core/Runner: startSize must be an integer >= 0");
    }
    if (!(opts.maxSize >= opts.startSize && Number.isInteger(opts.maxSize))) {
        throw new RangeError("@propcheck/core/Runner: maxSize must be an integer >= startSize");
    }
    return {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        check: prop => checkProperty(prop, gens, opts),
        withOptions: optOverride => makeTestConfig(gens, Object.assign(Object.assign({}, opts), optOverride)),
    };
}
function checkProperty(prop, gens, options) {
    let iteration = options.startIteration;
    let seed = typeof options.seed === "string"
        ? prng_1.makeSeedState(options.seed)
        : options.seed;
    let size = options.startSize;
    const sizeStep = (options.maxSize - options.startSize) /
        Math.max(1, options.iterations - 1);
    let lastIterationSeed = seed;
    for (; iteration <= options.iterations; ++iteration) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const args = [];
        let thisIterationSeed;
        for (const g of gens) {
            const [s0, s1] = prng_1.split(seed);
            seed = s1;
            thisIterationSeed = s0;
            args.push(g.run(Math.floor(size), s0, iteration));
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const testResult = check(prop, ...args.map(t => t.value));
        if (!testResult.ok) {
            return {
                pass: false,
                propName: prop.name,
                args,
                seed: lastIterationSeed,
                iteration,
                size: Math.floor(size),
                error: testResult.exception,
            };
        }
        size =
            iteration === options.iterations - 1
                ? options.maxSize
                : Math.min(size + sizeStep, options.maxSize);
        lastIterationSeed =
            thisIterationSeed !== undefined
                ? thisIterationSeed
                : lastIterationSeed;
    }
    return {
        pass: true,
        propName: prop.name,
        iteration: iteration - 1,
        size: Math.floor(size),
    };
}
function check(prop, ...args) {
    try {
        if (prop(...args) === true) {
            return { ok: true };
        }
    }
    catch (e) {
        return { ok: false, exception: e };
    }
    return { ok: false };
}
function tryShrinkSingle(prop, argsTree, i) {
    let localShrinks = 0;
    const argsTreeCopy = argsTree
        .slice()
        .map(t => t.prune());
    for (const c of argsTree[i].children) {
        ++localShrinks;
        argsTreeCopy[i] = c;
        const testResult = check(prop, ...argsTreeCopy.map(t => t.value));
        if (!testResult.ok) {
            const { shrinks, smallestFailingArgs } = tryShrinkSingle(prop, argsTreeCopy, i);
            if (smallestFailingArgs !== undefined) {
                return {
                    shrinks: localShrinks + shrinks,
                    smallestFailingArgs,
                };
            }
            else {
                return {
                    shrinks: localShrinks + shrinks,
                    smallestFailingArgs: argsTreeCopy.map(t => t.value),
                };
            }
        }
    }
    return {
        shrinks: localShrinks,
    };
}
