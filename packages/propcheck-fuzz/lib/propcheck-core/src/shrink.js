"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lazy_sequences_1 = require("lazy-sequences");
/**
 * Generate a shrink sequence towards some given integral number.
 *
 * @nosideeffects
 * @param {number} destination Integral value to shrink towards.
 * @param {number} x Value to start shrinking from.
 * @returns {Seq<number>}
 * @example
 * towardsIntegral(0, 10).collect()
 *   === [0, 5, 8, 9]
 */
function towardsIntegral(destination, x) {
    if (destination === x) {
        return lazy_sequences_1.Seq.empty();
    }
    const diff = Math.trunc(x / 2) - Math.trunc(destination / 2);
    return consNub(destination, halves(diff).map(y => x - y));
}
exports.towardsIntegral = towardsIntegral;
/**
 * Generate a shrink sequence by edging towards some given number.
 *
 * @nosideeffects
 * @param {number} destination Value to edge towards.
 * @param {number} x Value to start shrinking from.
 * @param {number=} iterationLimit
 *   Optional limit on how many shrink iterations to generate. Defaults to 7.
 * @returns {Seq<number>}
 * @example
 * towardsNum(0, 100).collect()
 *   === [0, 50, 75, 87.5, 93.75, 96.875, 98.4375]
 */
function towardsNum(destination, x, iterationLimit = 7) {
    if (destination === x) {
        return lazy_sequences_1.Seq.empty();
    }
    if (iterationLimit < 1) {
        return lazy_sequences_1.Seq.empty();
    }
    const diff = x - destination;
    const ok = (y) => y !== x && !isNaN(y) && isFinite(y);
    return lazy_sequences_1.Seq.cons(diff, lazy_sequences_1.Seq.iterate(d => d / 2, diff / 2)
        .takeWhile(ok)
        .take(iterationLimit - 1)).map(z => x - z);
}
exports.towardsNum = towardsNum;
// halves(15) === [15, 7, 3, 1]
// halves(100) === [100, 50, 25, 12, 6, 3, 1]
function halves(x) {
    return lazy_sequences_1.Seq.iterate(h => Math.trunc(h / 2), x).takeWhile(h => h !== 0);
}
function consNub(x, xs) {
    return new lazy_sequences_1.Seq({
        [Symbol.iterator]: () => consNubG(x, xs),
    });
}
function* consNubG(x, xs) {
    let once = false;
    for (const y of xs) {
        if (!once) {
            once = true;
            if (x !== y) {
                yield x;
            }
        }
        yield y;
    }
    if (!once) {
        yield x;
    }
}
