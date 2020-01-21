/**
 * Simple inclusive range of numbers.
 */
export class Range {
    constructor(
        /**
         * Inclusive start of the range.
         */
        public readonly minBound: number,
        /**
         * Inclusive end of the range.
         */
        public readonly maxBound: number,
        /**
         * The origin of the range.
         *
         * Typically, this number is used as a kind of "goal" when generating
         * shrink trees for a generator.
         */
        public readonly origin: number,
    ) {
        if (isNaN(minBound)) {
            throw new TypeError(
                "@propcheck/core/Range: minBound is not a number",
            )
        }

        if (isNaN(maxBound)) {
            throw new TypeError(
                "@propcheck/core/Range: maxBound is not a number",
            )
        }

        if (isNaN(origin)) {
            throw new TypeError("@propcheck/core/Range: origin is not a number")
        }

        if (maxBound < minBound) {
            throw new RangeError("@propcheck/core/Range: maxBound < minBound")
        }
    }
}

export default Range
