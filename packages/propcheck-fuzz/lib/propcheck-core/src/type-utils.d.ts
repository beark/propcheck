/**
 * Maps any tuple type to a union of its element types.
 *
 * @example
 * type Tup = [number, string, boolean];
 * type Union = TupleToUnion<Tup>;
 *
 * // Equivalent to
 * type Union = number | string | boolean;
 *
 * @template T The tuple type.
 * @template U Optional type to union the result with.
 */
export declare type TupleToUnion<T extends unknown[], U = never> = T[number] | U;
//# sourceMappingURL=type-utils.d.ts.map