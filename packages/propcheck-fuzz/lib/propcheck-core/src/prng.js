"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
function makeSeedState(key) {
    let h0 = 2166136261;
    for (let i = 0 >>> 0; i < key.length; i++) {
        h0 = Math.imul(h0 ^ key.charCodeAt(i), 16777619);
    }
    const [h1, a] = iterateH(h0);
    const [h2, b] = iterateH(h1);
    const [h3, c] = iterateH(h2);
    const [, d] = iterateH(h3);
    return [a, b, c, d];
}
exports.makeSeedState = makeSeedState;
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
function split(state) {
    return [step(state), jump(state)];
}
exports.split = split;
/**
 * Steps the state once without producing a pseudo random number.
 *
 * @nosideefects
 * @param {SeedState} state Input seed state.
 * @returns {SeedState}
 */
function step(state) {
    return xoshiro128ss(state)[0];
}
exports.step = step;
const defaultNumRange = {
    minBound: 0,
    maxBound: 1,
};
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
function nextNum(state, range) {
    const { minBound, maxBound } = Object.assign(Object.assign({}, defaultNumRange), range);
    const r = xoshiro128ss(state)[1];
    const diff = maxBound - minBound;
    return minBound + r / (1 / diff);
}
exports.nextNum = nextNum;
const defaultIntRange = {
    minBound: Number.MIN_SAFE_INTEGER,
    maxBound: Number.MAX_SAFE_INTEGER - 1,
};
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
function nextInt(state, range) {
    const rng = range || defaultIntRange;
    return Math.min(Math.floor(nextNum(state, Object.assign(Object.assign({}, rng), { maxBound: rng.maxBound + 1 }))), rng.maxBound);
}
exports.nextInt = nextInt;
// We're using 32bit xoshiro128** because JS only supports integers up to
// 2^53-ish, which obviously isn't enough to do 64bit
function xoshiro128ss(state) {
    let [s0, s1, s2, s3] = state;
    let r = s0 * 5;
    r = ((r << 7) | (r >>> 25)) * 9;
    const t = s0 << 9;
    s2 ^= s0;
    s3 ^= s1;
    s1 ^= s2;
    s0 ^= s3;
    s2 = t;
    s3 = (s3 << 11) | (s3 >>> 21);
    // Zero flll rightshift by 0 to ensure r has no bits set over its 32nd,
    // Then divide by 2^32-1 to get a number in [0..1]
    return [[s0, s1, s2, s3], (r >>> 0) / 4294967295];
}
const j0 = 0x8764000b;
const j1 = 0xf542d2d3;
const j2 = 0x6fa035c3;
const j3 = 0x77f2db5b;
// Jumps the state 2^64 iterations forward.
// This can be used to generate a total of 2^64 non-overlapping subsequences of
// the full xoshiro128** sequence.
function jump(state) {
    let s0 = 0;
    let s1 = 0;
    let s2 = 0;
    let s3 = 0;
    for (let b = 0; b < 32; ++b) {
        if (j0 & (1 << b)) {
            s0 ^= state[0];
            s1 ^= state[1];
            s2 ^= state[2];
            s3 ^= state[3];
            state = xoshiro128ss(state)[0];
        }
    }
    for (let b = 0; b < 32; ++b) {
        if (j1 & (1 << b)) {
            s0 ^= state[0];
            s1 ^= state[1];
            s2 ^= state[2];
            s3 ^= state[3];
            state = xoshiro128ss(state)[0];
        }
    }
    for (let b = 0; b < 32; ++b) {
        if (j2 & (1 << b)) {
            s0 ^= state[0];
            s1 ^= state[1];
            s2 ^= state[2];
            s3 ^= state[3];
            state = xoshiro128ss(state)[0];
        }
    }
    for (let b = 0; b < 32; ++b) {
        if (j3 & (1 << b)) {
            s0 ^= state[0];
            s1 ^= state[1];
            s2 ^= state[2];
            s3 ^= state[3];
            state = xoshiro128ss(state)[0];
        }
    }
    return [s0, s1, s2, s3];
}
function iterateH(h) {
    h += h << 13;
    h ^= h >>> 7;
    h += h << 3;
    h ^= h >>> 17;
    h += h << 5;
    return [h, h >>> 0];
}
