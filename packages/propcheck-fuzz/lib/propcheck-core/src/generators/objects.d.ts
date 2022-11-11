import { Gen } from "../Gen";
/**
 * Object generator type.
 *
 * Each property is a generator for the corresponding property in `T`.
 *
 * @template T
 */
export declare type ObjectGenerator<T> = {
    [K in keyof T]: Gen<T[K]>;
};
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
export declare function obj_<T extends {}>(gen: ObjectGenerator<T>): Gen<T>;
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
export declare function obj<T extends {}>(gen: ObjectGenerator<T>): Gen<T>;
//# sourceMappingURL=objects.d.ts.map