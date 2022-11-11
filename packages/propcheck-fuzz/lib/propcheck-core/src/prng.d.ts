/**
 * State used for seeding the PRNG used by propcheck.
 *
 * If constructed manually, each component of the state should be an integral
 * number.
 */
export declare type SeedState = [number, number, number, number];
/**
 * Create a {@link SeedState} from some input "key".
 *
 * Providing the same key will always result in the same sequence of pseudo-
 * random values being generated.
 *
 * @nosideeffects
 * @param {string} key
 *   Some string of characters that will be used as basis of the seed.
 * @returns {SeedState}
 */
export declare function makeSeedState(key: string): SeedState;
/**
 * Split a seed state into two states that will not generate overlapping output
 * (within reason).
 *
 * Note that every PRNG has a cycle, so if only one of the outputted seed states
 * is iterated, it will _eventually_ overlap with the other.
 *
 * @nosideeffects
 * @param {SeedState} state Input seed state.
 * @returns {[SeedState, SeedState]} Two new independent seed states.
 */
export declare function split(state: SeedState): [SeedState, SeedState];
/**
 * Steps the state once without producing a pseudo random number.
 *
 * @nosideefects
 * @param {SeedState} state Input seed state.
 * @returns {SeedState}
 */
export declare function step(state: SeedState): SeedState;
/**
 * Generate a number from the input seed state.
 *
 * @nosideeffects
 * @param {SeedState} state Input seed.
 * @param {{ minBound: number, maxBound: number } | undefined} range
 *   Optional inclusive range to generate within. If not provided, the number
 *   will be within the range 0..1.
 * @returns {number}
 */
export declare function nextNum(state: SeedState, range?: {
    minBound: number;
    maxBound: number;
}): number;
/**
 * Generate an integer-truncated number from the input seed state.
 *
 * @nosideeffects
 * @param {SeedState} state Input seed.
 * @param {{ minBound: number, maxBound: number } | undefined} range
 *   Optional inclusive range to generate within. If not provided, the number
 *   will be within the full range of safe ints, as defined in JS.
 * @returns {number}
 */
export declare function nextInt(state: SeedState, range?: {
    minBound: number;
    maxBound: number;
}): number;
//# sourceMappingURL=prng.d.ts.map