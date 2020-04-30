import { Gen } from "../Gen"
import { elementOf_ } from "./choice"

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

/**
 * Given an object, yields a generator of that object's own properties.
 *
 * Includes both string and symbol properties.
 *
 * Note that due to quirks of the TS type system, this has to return a
 * `string | symbol` generator, not a `keyof` since that would be an absolute
 * lie for many types. For example, `keyof number[]` includes a lot of methods
 * like `pop`, `push`, `concat`, `indexOf`, ..., while none of `Object.keys`,
 * `Object.getOwnPropertyNames`, etc include those members.
 *
 * - Size invariant.
 * - No shrink tree.
 *
 * @nosideeffects
 * @param {unknown} o Object the keys of which will be generated.
 * @returns {Gen<string | symbol>}
 * @example
 * // arrNames will generate one of "0", "1", "2", "length"
 * const arrNames = propertyNameOf(["a", "b", "c"]);
 *
 * // In effect, equivalent of Gen.const("foo")
 * const objNames = propertyNameOf({ foo: null });
 */
export function propertyNameOf(o: unknown): Gen<string | symbol> {
    const propKeys: (string | symbol)[] = Object.getOwnPropertyNames(o)

    return elementOf_(...propKeys.concat(Object.getOwnPropertySymbols(o)))
}
