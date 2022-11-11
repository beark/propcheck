import type { Gen, GeneratedType } from "../Gen";
import type { TupleToUnion } from "../type-utils";
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
export declare function elementOf_<T>(...options: T[]): Gen<T>;
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
export declare function elementOf<T>(...options: T[]): Gen<T>;
declare type UnionOfGeneratedTypes<T extends Gen<any>[]> = TupleToUnion<{
    [K in keyof T]: GeneratedType<T[K]>;
}>;
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
export declare function oneOf_<T extends Gen<any>[]>(...gens: T): Gen<UnionOfGeneratedTypes<T>>;
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
export declare function oneOf<T extends Gen<any>[]>(...gens: T): Gen<UnionOfGeneratedTypes<T>>;
/**
 * A pair consisting of a weight and a generator.
 *
 * @template T
 */
export declare type WeightedGen<T> = {
    /**
     * The weight assigned to `gen`. Should be a positive integer.
     */
    weight: number;
    /**
     * A generator of `T`s.
     */
    gen: Gen<T>;
};
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
export declare function frequency_<T>(...gens: WeightedGen<T>[]): Gen<T>;
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
export declare function frequency<T>(...gens: WeightedGen<T>[]): Gen<T>;
export {};
//# sourceMappingURL=choice.d.ts.map