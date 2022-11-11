/**
 * Simple inclusive range of numbers.
 */
export declare class Range {
    /**
     * Inclusive start of the range.
     */
    readonly minBound: number;
    /**
     * Inclusive end of the range.
     */
    readonly maxBound: number;
    /**
     * The origin of the range.
     *
     * Typically, this number is used as a kind of "goal" when generating
     * shrink trees for a generator.
     */
    readonly origin: number;
    constructor(
    /**
     * Inclusive start of the range.
     */
    minBound: number, 
    /**
     * Inclusive end of the range.
     */
    maxBound: number, 
    /**
     * The origin of the range.
     *
     * Typically, this number is used as a kind of "goal" when generating
     * shrink trees for a generator.
     */
    origin: number);
}
export default Range;
//# sourceMappingURL=Range.d.ts.map