import { Range } from "./Range"

describe("Range", () => {
    describe("constructor", () => {
        it("should throw if minBound is not a number", () => {
            expect(() => new Range(NaN, 0, 0)).toThrow(TypeError)
        })

        it("should throw if maxBound is not a number", () => {
            expect(() => new Range(0, NaN, 0)).toThrow(TypeError)
        })

        it("should throw if origin is not a number", () => {
            expect(() => new Range(0, 0, NaN)).toThrow(TypeError)
        })

        it("should throw if maxBound < minBound", () => {
            expect(() => new Range(1, 0, 0)).toThrow(RangeError)
        })

        it("should construct successfully otherwise", () => {
            expect(new Range(0, 1, 0)).toBeDefined()
        })
    })
})
