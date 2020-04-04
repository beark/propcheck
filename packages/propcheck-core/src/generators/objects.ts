import { Gen } from "../Gen"

/**
 * Object generator type.
 *
 * Each property is a generator for the corresponding property in `T`.
 *
 * @template T
 */
export type ObjectGenerator<T> = { [K in keyof T]: Gen<T[K]> }

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
export function obj_<T extends {}>(gen: ObjectGenerator<T>): Gen<T> {
    if (Object.keys(gen).length === 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return Gen.const<{}>({}) as any
    }

    let resultGen: Gen<T> | undefined
    // eslint-disable-next-line guard-for-in
    for (const g in gen) {
        const thisGen = gen[g].map(v => ({ [g]: v }))
        resultGen = resultGen
            ? resultGen.andThen(o =>
                  thisGen
                      .map(p => Object.assign({ ...o }, p))
                      .pruneShrinkTree(),
              )
            : // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (thisGen.pruneShrinkTree() as any)
    }

    return resultGen!
}

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
export function obj<T extends {}>(gen: ObjectGenerator<T>): Gen<T> {
    if (Object.keys(gen).length === 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return Gen.const<{}>({}) as any
    }

    let resultGen: Gen<T> | undefined
    // eslint-disable-next-line guard-for-in
    for (const g in gen) {
        const thisGen = gen[g].map(v => ({ [g]: v }))
        resultGen = resultGen
            ? resultGen.andThen(o =>
                  thisGen.map(p => Object.assign({ ...o }, p)),
              )
            : // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (thisGen as any)
    }

    return resultGen!
}
