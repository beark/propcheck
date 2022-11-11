import Seq from "lazy-sequences";
import { SeedState } from "./prng";
import Tree from "./Tree";
/**
 * Given a type `T` that extends `Gen<any>`, get the type it generates.
 *
 * This is similar to, eg, `ReturnType` for functions, except for generators.
 *
 * @template T
 */
export declare type GeneratedType<T> = T extends Gen<infer U> ? U : never;
/**
 * A generator of values of type `T`.
 *
 * A deterministic source of values for the given type. In a simplified sense, a
 * generator can be thought of as a function from a seed and desired size to a
 * value that is deterministically derived from those.
 *
 * @template T
 */
export declare class Gen<T> {
    /**
     * Runs the generator, producing a shrink tree where the root is the
     * generated value.
     *
     * Note: generally speaking, generators should not have any side effects
     * embedded and `run` should thus be considered as having no side
     * effects. However, nothing particularly stops a library consumer from,
     * eg, `map`-ing a function which has side effects, even if they
     * shouldn't.
     *
     * @param {number} sz
     *   The size at which to run the generator. Any generator that grows
     *   with (or otherwise takes into account) size, will somehow use this
     *   to produce the root value. Often, this sized is used, eg, as an
     *   upper bound on a number to generate as part of the generation, such
     *   as the length of an array or string to produce.
     * @param {SeedState} seed
     *   The input seed state. This is fed to the pseudo random number
     *   generator (prng), from which all "randomness" in a generator is
     *   derived.
     * @param {number} i
     *   The iteration count of the run. It is expected that generators
     *   will usually be run hundreds, if not thousands, of times in a
     *   single property test, and this counter should increase with each
     *   such run. Currently, only `sequence` uses this in its value
     *   generation.
     * @returns {Tree<T>}
     */
    readonly run: (sz: number, seed: SeedState, i: number) => Tree<T>;
    /**
     * Create a constant generator that always produces the same given value.
     *
     * - Size invariant.
     * - No shrink tree.
     *
     * @nosideeffects
     * @param {T} x The value the generator will always produce.
     * @returns {Gen<T>}
     * @template T
     */
    static const<T>(x: T): Gen<T>;
    /**
     * Create a generator from some function that can produce a `T` from some
     * size and seed.
     *
     * - Size invariant.
     * - No shrink tree.
     *
     * @nosideeffects
     * @param {(sz: number, sd: SeedState) => T} f
     * @returns {Gen<T>}
     * @template T
     */
    static fromFn<T>(f: (sz: number, sd: SeedState) => T): Gen<T>;
    /**
     * Sequence a set of generators such that they are run in order.
     *
     * Ie, first iteration of a property test, the first generator gets run,
     * seconds generation runs the second generator, and so on. When the
     * iteration count is greater than or equal to the generator count, the last
     * generator gets called.
     *
     * @nosideeffects
     * @param {Gen<T>[]} gens Set of generators to sequence.
     * @returns {Gen<T>}
     * @template T
     */
    static sequence<T>(...gens: Gen<T>[]): Gen<T>;
    /**
     * Create a generator aware of the current size.
     *
     * - Will vary with size if the generator produced by `f` does.
     * - Will have the shrink tree of the generator produced by `f`.
     *
     * @nosideeffects
     * @param {(sz: number) => Gen<T>} f
     *   Function that, given the current size, produces a generator that
     *   (presumably) uses this size to generate values.
     * @returns {Gen<T>}
     * @template T
     */
    static sized<T>(f: (sz: number) => Gen<T>): Gen<T>;
    /**
     * Constructs a generator from its `run` function.
     */
    constructor(
    /**
     * Runs the generator, producing a shrink tree where the root is the
     * generated value.
     *
     * Note: generally speaking, generators should not have any side effects
     * embedded and `run` should thus be considered as having no side
     * effects. However, nothing particularly stops a library consumer from,
     * eg, `map`-ing a function which has side effects, even if they
     * shouldn't.
     *
     * @param {number} sz
     *   The size at which to run the generator. Any generator that grows
     *   with (or otherwise takes into account) size, will somehow use this
     *   to produce the root value. Often, this sized is used, eg, as an
     *   upper bound on a number to generate as part of the generation, such
     *   as the length of an array or string to produce.
     * @param {SeedState} seed
     *   The input seed state. This is fed to the pseudo random number
     *   generator (prng), from which all "randomness" in a generator is
     *   derived.
     * @param {number} i
     *   The iteration count of the run. It is expected that generators
     *   will usually be run hundreds, if not thousands, of times in a
     *   single property test, and this counter should increase with each
     *   such run. Currently, only `sequence` uses this in its value
     *   generation.
     * @returns {Tree<T>}
     */
    run: (sz: number, seed: SeedState, i: number) => Tree<T>);
    /**
     * Sequence two generators, such that when the resulting generator is run,
     * the input generator is run first, and then the given function is applied
     * to the produced value and finally *that* function's returned generator is
     * run.
     *
     * Seed state is iterated before the second generator is run.
     *
     * The shrink tree of the resulting generator is the combinatorial product
     * of the shrink trees of `this` and the generator returned by `f`.
     *
     * @nosideeffects
     * @param {(x: T) => Gen<U>} f
     *   Function that produces the generator that should be sequenced.
     * @returns {Gen<U>}
     * @template U
     */
    andThen<U>(f: (x: T) => Gen<U>): Gen<U>;
    /**
     * Maps a function, such that when the resulting generator is run, the input
     * generator is first run, and then the given function is applied to the
     * produced value of that.
     *
     * The resulting generator has the same size and shrink properties as
     * `this`.
     *
     * @nosideffects
     * @param {(x: T) => U} f Function to map.
     * @returns {Gen<U>}
     * @template U
     */
    map<U>(f: (x: T) => U): Gen<U>;
    /**
     * Prunes any shrink tree from the result generator.
     *
     * This can be useful, for example, when combining two generators with
     * `andThen`, but we're only interested in the shrink tree of one of them:
     *
     * ```ts
     * g1.pruneShrinkTree().andThen(_ => g2)
     * ```
     *
     * Though, generally, there is both a shrinking and a non-shrinking version
     * of all generators provided by `propcheck-core`.
     *
     * @nosideeffects
     * @returns {Gen<T>}
     */
    pruneShrinkTree(): Gen<T>;
    /**
     * Repeat the generator a given number of times.
     *
     * - Size invariant.
     * - Shrinks from the repeated generator are discarded.
     *
     * @nosideeffects
     * @param {number} n The number of times to repeat the generator.
     * @returns {Gen<T[]>} A generator for an array of `n` elements.
     */
    repeat(n: number): Gen<T[]>;
    /**
     * Resizes the current generator to the given size.
     *
     * The resulting generator is size invariant, as it will always assume a
     * constant size of `sz`.
     *
     * @nosideeffects
     * @param {number} sz Size to resize to.
     * @returns {Gen<T>}
     */
    resize(sz: number): Gen<T>;
    /**
     * Scale the current generator using some function which will be given the
     * current size and should return the desired new size.
     *
     * @nosideeffects
     * @param {(n: number) => number} f Scaling function.
     * @returns {Gen<T>}
     */
    scale(f: (n: number) => number): Gen<T>;
    /**
     * Adds a shrink tree (or expands an existing one) to a generator without
     * recursing.
     *
     * Ie, the possible shrinks added are limited to only those received by
     * calling `f` on the original generated value. Thus, if some generator
     * yields the following tree (where the root is the generated value and the
     * children are shrinks):
     *
     * ```
     * 10
     * |-- 3
     * `-- 4
     * ```
     *
     * And we call `shrink` on that generator with an `f` defined as:
     * ```ts
     * const f = x => towardsIntegral(0, x);
     * ```
     *
     * Then the resulting generator would produce this shrink tree, given the
     * same input seed etc:
     *
     * ```
     * 10
     * |-- 3
     * |-- 4
     * |-- 0
     * |-- 5
     * |-- 8
     * `-- 9
     * ```
     *
     * @nosideffects
     * @param {(x: T) => Seq<T>} f
     *   Function that, given some value, should return its possible shrinks as
     *   a sequence.
     * @returns {Gen<T>}
     */
    shrink(f: (x: T) => Seq<T>): Gen<T>;
    /**
     * Adds a shrink tree (or expands an existing one) to a generator
     * _recusively_.
     *
     * @nosideffects
     * @param {(x: T) => Seq<T>} f
     *   Function that, given some value, should returns its possible shrinks as
     *   a sequence.
     * @returns {Gen<T>}
     */
    shrinkRecursively(f: (x: T) => Seq<T>): Gen<T>;
    /**
     * Modify the current generator with a predicate, such that the final
     * generator will always produce values for which the predicate holds. If a
     * value satisfying the predicate failes to be found, `suchThat` will
     * attempt to grow in size until a valid value is generated.
     *
     * Note: If growing the size does not result in values satisfying the
     * predicate, this generator will loop forever. Further, if it is unlikely
     * for the predicate to be satisfied by the generator, performance will
     * likely be severely degraded.
     *
     * @nosideeffects
     * @param {(x: T) => boolean} pred
     *   Predicate the result generator's output should satisfy.
     * @returns {Gen<T>}
     */
    suchThat(pred: (x: T) => boolean): Gen<T>;
    /**
     * Modify the current generator with a predicate, such that the final
     * generator will always produce values for which the predicate holds, or if
     * that was impossible, it will result in an undefined value.
     *
     * Note: if a generator either can't, or is very unlikely, to produce a
     * value satisfying the predicate, performance may be severely affected.
     *
     * @nosideeffects
     * @param {(x: T) => boolean} pred
     *   Predicate the result generator's output should satisfy.
     * @returns {Gen<T|undefined>}
     */
    suchThatMaybe(pred: (x: T) => boolean): Gen<T | undefined>;
}
export default Gen;
//# sourceMappingURL=Gen.d.ts.map