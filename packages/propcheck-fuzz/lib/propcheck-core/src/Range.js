"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Simple inclusive range of numbers.
 */
class Range {
    constructor(
    /**
     * Inclusive start of the range.
     */
    minBound, 
    /**
     * Inclusive end of the range.
     */
    maxBound, 
    /**
     * The origin of the range.
     *
     * Typically, this number is used as a kind of "goal" when generating
     * shrink trees for a generator.
     */
    origin) {
        this.minBound = minBound;
        this.maxBound = maxBound;
        this.origin = origin;
        if (isNaN(minBound)) {
            throw new TypeError("@propcheck/core/Range: minBound is not a number");
        }
        if (isNaN(maxBound)) {
            throw new TypeError("@propcheck/core/Range: maxBound is not a number");
        }
        if (isNaN(origin)) {
            throw new TypeError("@propcheck/core/Range: origin is not a number");
        }
        if (maxBound < minBound) {
            throw new RangeError("@propcheck/core/Range: maxBound < minBound");
        }
    }
}
exports.Range = Range;
exports.default = Range;
