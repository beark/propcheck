/**
 * Maps any tuple type to a union of its element types.
 *
 * @example
 *
 * ```ts
 * type Tup = [number, string, boolean]
 * type Union = TupleToUnion<Tup>
 *
 * // Equivalent to
 * type Union = number | string | boolean
 * ```
 *
 * @typeParam T - The tuple type.
 * @typeParam U - Optional type to union the result with.
 */
export type TupleToUnion<T extends unknown[], U = never> = T[number] | U
