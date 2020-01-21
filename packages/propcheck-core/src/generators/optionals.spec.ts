import { makeSeedState } from "../prng"
import { optional, nullable, optionalNullable } from "./optionals"
import Gen from "../Gen"

describe("generators/optionals", () => {
    describe("optional", () => {
        it("should always generate undefined on iteration 1", () => {
            const g = optional(Gen.const(1))
            for (const s of seeds) {
                expect(g.run(10, s, 0).value).toBe(undefined)
            }
        })

        it("should always pick the given generator for all subsequent iterations", () => {
            const g = optional(Gen.const(1))
            for (const s of seeds) {
                for (let i = 1; i < 101; i += 10) {
                    expect(g.run(10, s, i).value).toBe(1)
                }
            }
        })
    })

    describe("nullable", () => {
        it("should always generate null on iteration 1", () => {
            const g = nullable(Gen.const(1))
            for (const s of seeds) {
                expect(g.run(10, s, 0).value).toBe(null)
            }
        })

        it("should always pick the given generator for all subsequent iterations", () => {
            const g = nullable(Gen.const(1))
            for (const s of seeds) {
                for (let i = 1; i < 101; i += 10) {
                    expect(g.run(10, s, i).value).toBe(1)
                }
            }
        })
    })

    describe("optionalNullable", () => {
        it("should always generate undefined on iteration 1", () => {
            const g = optionalNullable(Gen.const(1))
            for (const s of seeds) {
                expect(g.run(10, s, 0).value).toBe(undefined)
            }
        })

        it("should always generate null on iteration 2", () => {
            const g = optionalNullable(Gen.const(1))
            for (const s of seeds) {
                expect(g.run(10, s, 1).value).toBe(null)
            }
        })

        it("should always pick the given generator for all subsequent iterations", () => {
            const g = optionalNullable(Gen.const(1))
            for (const s of seeds) {
                for (let i = 2; i < 101; i += 10) {
                    expect(g.run(10, s, i).value).toBe(1)
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
