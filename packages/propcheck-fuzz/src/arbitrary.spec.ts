import { arbitraryObj, arbitraryFn } from "./arbitrary"
import { makeSeedState, SeedState } from "@propcheck/core/lib/prng"

describe("Arbitrary", () => {
    describe("arbitraryFn", () => {
        it("should generate functions returning anything", () => {
            for (const seed of seeds) {
                const fn = arbitraryFn.run(0, seed, 0).value
                expect(typeof fn).toBe("function")
            }
        })
    })

    describe("arbitraryObj", () => {
        it("should generate empty objects at size 0", () => {
            for (const seed of seeds) {
                const obj = arbitraryObj.run(0, seed, 0).value
                expect(obj).toEqual({})
            }
        })

        it("should generate some non-empty objects at larger sizes", () => {
            const objs: object[] = []
            for (const seed of seeds) {
                objs.push(arbitraryObj.repeat(10).run(5, seed, 0).value)
            }

            expect(objs.every(obj => typeof obj === "object")).toBe(true)
            expect(objs.some(obj => Object.keys(obj).length > 0))
        })
    })
})

const seeds: SeedState[] = []
for (let i = 0; i < 20; ++i) {
    seeds.push(makeSeedState(i.toString() + "arbitrary"))
}
