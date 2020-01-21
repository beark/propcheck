import Seq from "lazy-sequences"
import { towardsIntegral, towardsNum } from "./shrink"

describe("Shrink", () => {
    describe("towards integral", () => {
        it("should pass basic sanity checks", () => {
            expect(towardsIntegral(0, 0).collect()).toEqual([])
            expect(towardsIntegral(0, 1).collect()).toEqual([0])
            expect(towardsIntegral(1, 2).collect()).toEqual([1])
            expect(towardsIntegral(0, 10).collect()).toEqual([0, 5, 8, 9])
            expect(towardsIntegral(-50, -26).collect()).toEqual([
                -50,
                -38,
                -32,
                -29,
                -27,
            ])
        })
    })

    describe("towards num", () => {
        it("should return an empty sequence if iterationLimit < 0", () => {
            expect(towardsNum(0, 10, 0)).toEqual(Seq.empty())
        })

        it("should pass basic sanity checks", () => {
            expect(towardsNum(0, 0).collect()).toEqual([])
            expect(towardsNum(0, 100).collect()).toEqual([
                0,
                50,
                75,
                87.5,
                93.75,
                96.875,
                98.4375,
            ])
            expect(towardsNum(1, 0.5).collect()).toEqual([
                1,
                0.75,
                0.625,
                0.5625,
                0.53125,
                0.515625,
                0.5078125,
            ])
        })
    })
})
