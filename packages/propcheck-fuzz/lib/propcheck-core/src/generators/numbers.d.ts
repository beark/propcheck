import Gen from "../Gen";
import Range from "../Range";
/**
 * Generator of integral values within a given (inclusive) range.
 *
 * - Size invariant.
 * - Shrinks towards the origin of the {@link Range}.
 *
 * @nosideeffects
 * @param {Range} r The desired range of integral values to generate within.
 * @returns {Gen<number>}
 */
export declare function integral(r: Range): Gen<number>;
/**
 * Generator of integral values within a given (inclusive) range.
 *
 * - Size invariant.
 * - No shrink tree.
 *
 * @nosideeffects
 * @param {Range} r The desired range of integral values to generate within.
 * @returns {Gen<number>}
 */
export declare function integral_(r: Range): Gen<number>;
/**
 * Generator for the natural numbers (0, 1, 2, ...).
 *
 * - Grows linearly with size.
 * - Shrinks towards 0.
 */
export declare const nat: Gen<number>;
/**
 * Generator for integers (..., -1, 0, 1, 2, ...).
 *
 * - Abs of generated integer grows linearly with size.
 * - Shrinks towards 0.
 */
export declare const int: Gen<number>;
/**
 * Generator of floating numbers.
 *
 * - Size invariant.
 * - Shrinks towards the origin of the given {@link Range}.
 *
 * @nosideeffects
 * @param {Range<number>} r Range to generate numbers within.
 * @returns {Gen<number>}
 */
export declare function num(r: Range): Gen<number>;
/**
 * Generator of floating numbers.
 *
 * - Size invariant.
 * - No shrink tree.
 *
 * @nosideeffects
 * @param {Range<number>} r Range to generate within.
 * @returns {Gen<number>}
 */
export declare function num_(r: Range): Gen<number>;
//# sourceMappingURL=numbers.d.ts.map