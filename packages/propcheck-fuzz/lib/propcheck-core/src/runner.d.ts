import { SeedState } from "./prng";
import Tree from "./Tree";
import type { Gen, GeneratedType } from "./Gen";
/**
 * The result of a propcheck run.
 *
 * Either a pass, or a failure.
 */
export declare type PropCheckResult<T> = PropCheckPass | PropCheckFailure<T>;
/**
 * Represents a propcheck run that passed.
 */
export declare type PropCheckPass = {
    /**
     * Discriminant to identify whether the run passed or failed.
     */
    pass: true;
    /**
     * The name of the property that was tested.
     *
     * Typically, this is simply the name of the function that describes the
     * property.
     */
    propName: string;
    /**
     * Which iteration the check ended on.
     *
     * This effectively indicates how many tests the property was put through.
     */
    iteration: number;
    /**
     * The size at the time the last test of the property was run.
     */
    size: number;
};
export declare type PropCheckFailure<T> = {
    /**
     * Discriminant to identify whether the run passed or failed.
     */
    pass: false;
    /**
     * The name of the property that was tested.
     *
     * Typically, this is simply the name of the function that describes the
     * property.
     */
    propName: string;
    /**
     * The arguments found that caused the property to fail, including their
     * shrink tree.
     *
     * The very first `value` in each tree is the original argument which the
     * property was tested against.
     */
    args: ApplyTree<T>;
    /**
     * The seed state at the time the property failed.
     */
    seed: SeedState;
    /**
     * Which iteration the check ended on.
     *
     * This effectively indicates how many tests the property was put through.
     */
    iteration: number;
    /**
     * The size at the time the property failed to pass.
     */
    size: number;
    /**
     * The thrown error (if any) that caused the property to fail.
     *
     * If not defined, then the property failed by returning `false`.
     */
    error?: unknown;
};
/**
 * Options that can be passed to {@link Runner.check}, for example
 * to repeat a failed run exactly, or to simply customize the run.
 */
export declare type PropCheckOpts = {
    /**
     * The number of iterations/tests to run the property through.
     *
     * Defaults to `100`, should be an integer >= 1.
     */
    iterations: number;
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
    startIteration: number;
    /**
     * Size to start the runs at.
     *
     * Each consecutive iteration will increment the size until `maxSize` is
     * reached.
     *
     * Defaults to `3`, should be an integer >= 0.
     */
    startSize: number;
    /**
     * The maximum size to run the property check with.
     *
     * Defaults to `10_000`, should be an integer >= `startSize`.
     */
    maxSize: number;
    /**
     * Initial seed to start the property check with.
     *
     * Defaults to `"default"`.
     */
    seed: string | SeedState;
};
/**
 * A property test runner that can be applied to any property with parameters
 * matching `TParams`.
 *
 * @template TParams
 *   Tuple type of the property parameter types this runner can check.
 */
export declare type Runner<TParams extends unknown[]> = {
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
    check(property: (...args: TParams) => unknown): PropCheckResult<TParams>;
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
    withOptions(opts: Partial<PropCheckOpts>): Runner<TParams>;
};
/**
 * The result of shrinking a set of arguments of type `TArgs`.
 *
 * @template TArgs
 */
export declare type ShrinkResult<TArgs> = {
    /**
     * The number of shrinks attempted.
     */
    shrinks: number;
    /**
     * The smallest argument set found for which the property failed.
     */
    smallestFailingArgs?: TArgs;
};
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
export declare function given<TGens extends Gen<unknown>[]>(...gens: TGens): Runner<Given<TGens>>;
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
export declare function shrink<TArgs extends unknown[]>(prop: (...args: TArgs) => unknown, args: ApplyTree<TArgs>): ShrinkResult<TArgs>;
declare type Given<TArgs> = {
    [K in keyof TArgs]: GeneratedType<TArgs[K]>;
};
declare type ApplyTree<T> = {
    [K in keyof T]: Tree<T[K]>;
};
export {};
//# sourceMappingURL=runner.d.ts.map