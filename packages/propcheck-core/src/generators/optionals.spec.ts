import { makeSeedState, step } from "../prng"
import { optional, nullable, optionalNullable } from "./optionals"
import Gen from "../Gen"

describe("generators/optionals", () => {
    describe("optional", () => {
        it("should generate a mix of undefineds and defineds", () => {
            const g = optional(Gen.const(1)).repeat(100)
            for (const s of seeds) {
                const t = g.run(10, s, 0).value

                expect(t.filter(x => x === 1).length).toBeGreaterThan(0)
                expect(t.filter(x => x === undefined).length).toBeGreaterThan(0)
            }
        })

        it("should generate the appropriate shrink tree for the defined case", () => {
            const g = optional(Gen.const(1).shrink(_ => [3, 4]))
            for (let s of seeds) {
                for (let i = 1; i < 101; i += 10) {
                    const t = g.run(10, s, i)
                    if (typeof t.value !== "undefined") {
                        expect([...t]).toEqual([1, 3, 4])
                    } else {
                        expect([...t]).toEqual([undefined])
                    }

                    s = step(s)
                }
            }
        })
    })

    describe("nullable", () => {
        it("should generate a mix of nulls and non-nulls", () => {
            const g = nullable(Gen.const(1)).repeat(100)
            for (const s of seeds) {
                const t = g.run(10, s, 0).value

                expect(t.filter(x => x === 1).length).toBeGreaterThan(0)
                expect(t.filter(x => x === null).length).toBeGreaterThan(0)
            }
        })

        it("should generate the appropriate shrink tree for the non-null case", () => {
            const g = nullable(Gen.const(1).shrink(_ => [3, 4]))
            for (let s of seeds) {
                for (let i = 1; i < 101; i += 10) {
                    const t = g.run(10, s, i)
                    if (t.value !== null) {
                        expect([...t]).toEqual([1, 3, 4])
                    } else {
                        expect([...t]).toEqual([null])
                    }

                    s = step(s)
                }
            }
        })
    })

    describe("optionalNullable", () => {
        it("should generate a mix of undefineds, nulls, and regular values", () => {
            const g = optionalNullable(Gen.const(1)).repeat(100)
            for (const s of seeds) {
                const t = g.run(10, s, 0).value

                expect(t.filter(x => x === 1).length).toBeGreaterThan(0)
                expect(t.filter(x => x === undefined).length).toBeGreaterThan(0)
                expect(t.filter(x => x === null).length).toBeGreaterThan(0)
            }
        })

        it("should generate the appropriate shrink tree for the defined case", () => {
            const g = optionalNullable(Gen.const(1).shrink(_ => [3, 4]))
            for (let s of seeds) {
                for (let i = 1; i < 101; i += 10) {
                    const t = g.run(10, s, i)
                    if (typeof t.value === "number") {
                        expect([...t]).toEqual([1, 3, 4])
                    } else if (t.value === null) {
                        expect([...t]).toEqual([null])
                    } else {
                        expect([...t]).toEqual([undefined])
                    }

                    s = step(s)
                }
            }
        })
    })
})

const seeds = [
    makeSeedState("opt0"),
    makeSeedState("opt1"),
    makeSeedState("opt2"),
    makeSeedState("0opt"),
    makeSeedState("1opt"),
    makeSeedState("2opt"),
]
