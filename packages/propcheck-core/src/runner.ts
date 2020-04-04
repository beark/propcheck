import { makeSeedState, SeedState, split } from "./prng"
import Tree from "./Tree"

import type { Gen, GeneratedType } from "./Gen"

/**
 * The result of a propcheck run.
 *
 * Either a pass, or a failure.
 */
export type PropCheckResult<T> = PropCheckPass | PropCheckFailure<T>

/**
 * Represents a propcheck run that passed.
 */
export type PropCheckPass = {
    /**
     * Discriminant to identify whether the run passed or failed.
     */
    pass: true

    /**
     * The name of the property that was tested.
     *
     * Typically, this is simply the name of the function that describes the
     * property.
     */
    propName: string

    /**
     * Which iteration the check ended on.
     *
     * This effectively indicates how many tests the property was put through.
     */
    iteration: number

    /**
     * The size at the time the last test of the property was run.
     */
    size: number
}

export type PropCheckFailure<T> = {
    /**
     * Discriminant to identify whether the run passed or failed.
     */
    pass: false

    /**
     * The name of the property that was tested.
     *
     * Typically, this is simply the name of the function that describes the
     * property.
     */
    propName: string

    /**
     * The arguments found that caused the property to fail, including their
     * shrink tree.
     *
     * The very first `value` in each tree is the original argument which the
     * property was tested against.
     */
    args: ApplyTree<T>

    /**
     * The seed state at the time the property failed.
     */
    seed: SeedState

    /**
     * Which iteration the check ended on.
     *
     * This effectively indicates how many tests the property was put through.
     */
    iteration: number

    /**
     * The size at the time the property failed to pass.
     */
    size: number

    /**
     * The thrown error (if any) that caused the property to fail.
     *
     * If not defined, then the property failed by returning `false`.
     */
    error?: unknown
}

/**
 * Options that can be passed to {@link Runner.check}, for example
 * to repeat a failed run exactly, or to simply customize the run.
 */
export type PropCheckOpts = {
    /**
     * The number of iterations/tests to run the property through.
     *
     * Defaults to `100`, should be an integer >= 1.
     */
    iterations: number

    /**
     * Which iteration the test run should start on.
     *
     * The primary use case for this option is to deterministically repeat a
     * specific check iteration that failed.
     *
     * For example, it might be that it is difficult to hit the particular case
     * for which a property fails. You don't want to run 10s of thousands of
     * iterations to assue yourself that you've now fixed it.
     *
     * Instead, whenever a check fails, the result will have all the information
     * you need to repeat the _failing_ iteration completely deterministically.
     * Since it is possible to compose generators that depend on the current
     * iteration, it must be possible to specify which iteration to start on to
     * get those perfectly deterministic repeat runs.
     *
     * Defaults to `1`, should be an integer >= 1.
     */
    startIteration: number

    /**
     * Size to start the runs at.
     *
     * Each consecutive iteration will increment the size until `maxSize` is
     * reached.
     *
     * Defaults to `3`, should be an integer >= 0.
     */
    startSize: number

    /**
     * The maximum size to run the property check with.
     *
     * Defaults to `10_000`, should be an integer >= `startSize`.
     */
    maxSize: number

    /**
     * Initial seed to start the property check with.
     *
     * Defaults to `"default"`.
     */
    seed: string | SeedState
}

/**
 * A property test runner that can be applied to any property with parameters
 * matching `TParams`.
 *
 * @template TParams
 *   Tuple type of the property parameter types this runner can check.
 */
export type Runner<TParams extends unknown[]> = {
    /**
     * Run a full set of tests of the given property.
     *
     * @nosideeffects
     * @param {(...args: TParams) => unknown} property The property to test.
     * @returns {PropCheckResult<TParams>}
     * @example
     * given(nat, nat, nat)
     *   .check(plusAssoc);
     */
    check(property: (...args: TParams) => unknown): PropCheckResult<TParams>

    /**
     * Apply options to the runner.
     *
     * The returned object will have its configuration overriden by the given
     * options.
     *
     * @nosideeffects
     * @param {Partial<PropCheckOpts>} opts Options to configure the run with.
     * @throws {RangeError} If any of the given options are nonsensical.
     * @returns {Runner<TParams>}
     *   A new runner configured with the given options.
     * @example
     * given(someGenerator)
     *   .withOptions({ iterations: 1000 })
     *   .check(someProperty);
     */
    withOptions(opts: Partial<PropCheckOpts>): Runner<TParams>
}

/**
 * The result of shrinking a set of arguments of type `TArgs`.
 *
 * @template TArgs
 */
export type ShrinkResult<TArgs> = {
    /**
     * The number of shrinks attempted.
     */
    shrinks: number

    /**
     * The smallest argument set found for which the property failed.
     */
    smallestFailingArgs: TArgs
}

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
export function given<TGens extends Gen<unknown>[]>(
    ...gens: TGens
): Runner<Given<TGens>> {
    return makeTestConfig(gens, defaultOpts)
}

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
export function shrink<TArgs extends unknown[]>(
    prop: (...args: TArgs) => unknown,
    args: ApplyTree<TArgs>,
): ShrinkResult<TArgs> {
    let shrinks = 0
    const smallestFailingArgs = args.slice().map(t => t.value)

    for (let i = 0; i < args.length; ++i) {
        const singleResult = tryShrinkSingle(prop, args, i)
        shrinks += singleResult.shrinks
        if (singleResult.smallestFailingArgs !== undefined) {
            smallestFailingArgs[i] = singleResult.smallestFailingArgs[i]
            args[i] = Tree.singleton(smallestFailingArgs[i])
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return { shrinks, smallestFailingArgs: smallestFailingArgs as any }
}

type Given<TArgs> = {
    [K in keyof TArgs]: GeneratedType<TArgs[K]>
}

type ApplyTree<T> = { [K in keyof T]: Tree<T[K]> }

type ApplyGen<T> = { [K in keyof T]: Gen<[T[K]]> }

const defaultOpts: Readonly<PropCheckOpts> = Object.freeze({
    iterations: 100,
    startIteration: 1,
    startSize: 3,
    maxSize: 10_000,
    seed: "default",
})

function makeTestConfig<TGens extends Gen<unknown>[]>(
    gens: TGens,
    opts: PropCheckOpts,
): Runner<Given<TGens>> {
    if (!(opts.iterations > 0 && Number.isInteger(opts.iterations))) {
        throw new RangeError(
            "@propcheck/core/runner: iterations must be an integer > 0",
        )
    }

    if (!(opts.startIteration >= 1 && Number.isInteger(opts.startIteration))) {
        throw new RangeError(
            "@propcheck/core/runner: startIteration must be an integer >= 1",
        )
    }

    if (!(opts.startSize >= 0 && Number.isInteger(opts.startSize))) {
        throw new RangeError(
            "@propcheck/core/runner: startSize must be an integer >= 0",
        )
    }

    if (!(opts.maxSize >= opts.startSize && Number.isInteger(opts.maxSize))) {
        throw new RangeError(
            "@propcheck/core/runner: maxSize must be an integer >= startSize",
        )
    }

    return {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        check: prop => checkProperty(prop, gens as any, opts),
        withOptions: optOverride =>
            makeTestConfig(gens, { ...opts, ...optOverride }),
    }
}

function checkProperty<TArgs extends unknown[]>(
    prop: (...args: TArgs) => unknown,
    gens: ApplyGen<TArgs>,
    options: PropCheckOpts,
): PropCheckResult<TArgs> {
    let iteration = options.startIteration
    let seed =
        typeof options.seed === "string"
            ? makeSeedState(options.seed)
            : options.seed
    let size = options.startSize
    const sizeStep =
        (options.maxSize - options.startSize) /
        Math.max(1, options.iterations - 1)

    let lastIterationSeed = seed
    for (; iteration <= options.iterations; ++iteration) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const args: ApplyTree<TArgs> = [] as any
        let thisIterationSeed: SeedState | undefined
        for (const g of gens) {
            const [s0, s1] = split(seed)
            seed = s1

            thisIterationSeed = s0
            args.push(g.run(Math.floor(size), s0, iteration - 1))
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const testResult = check(prop, ...(args.map(t => t.value) as any))
        if (!testResult.ok) {
            return {
                pass: false,
                propName: prop.name,
                args,
                seed: lastIterationSeed,
                iteration,
                size: Math.floor(size),
                error: testResult.exception,
            }
        }

        size =
            iteration === options.iterations - 1
                ? options.maxSize
                : Math.min(size + sizeStep, options.maxSize)

        lastIterationSeed =
            thisIterationSeed !== undefined
                ? thisIterationSeed
                : lastIterationSeed
    }

    return {
        pass: true,
        propName: prop.name,
        iteration: iteration - 1,
        size: Math.floor(size),
    }
}

type CheckResult = Pass | Fail
type Pass = {
    ok: true
}
type Fail = {
    ok: false
    exception?: unknown
}

function check<TArgs extends unknown[]>(
    prop: (...args: TArgs) => unknown,
    ...args: TArgs
): CheckResult {
    try {
        if (prop(...args) === true) {
            return { ok: true }
        }
    } catch (e) {
        return { ok: false, exception: e }
    }

    return { ok: false }
}

type SingleShrinkResult<TArgs> = {
    shrinks: number
    smallestFailingArgs?: TArgs
}

function tryShrinkSingle<TArgs extends unknown[]>(
    prop: (...args: TArgs) => unknown,
    argsTree: ApplyTree<TArgs>,
    i: number,
): SingleShrinkResult<TArgs> {
    let localShrinks = 0
    const argsTreeCopy: ApplyTree<TArgs> = argsTree
        .slice()
        .map(t => t.prune()) as ApplyTree<TArgs>

    for (const c of argsTree[i].children) {
        ++localShrinks
        argsTreeCopy[i] = c
        const testResult = check(
            prop,
            ...(argsTreeCopy.map(t => t.value) as TArgs),
        )
        if (!testResult.ok) {
            const { shrinks, smallestFailingArgs } = tryShrinkSingle(
                prop,
                argsTreeCopy,
                i,
            )
            if (smallestFailingArgs !== undefined) {
                return {
                    shrinks: localShrinks + shrinks,
                    smallestFailingArgs,
                }
            } else {
                return {
                    shrinks: localShrinks + shrinks,
                    smallestFailingArgs: argsTreeCopy.map(
                        t => t.value,
                    ) as TArgs,
                }
            }
        }
    }

    return {
        shrinks: localShrinks,
    }
}
