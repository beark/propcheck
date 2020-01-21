import { Gen } from "../Gen"
import { makeSeedState, SeedState } from "../prng"
import * as G from "."

describe("Generators/Booleans", () => {
    describe("bool", () => {
        it("should always generate the same value for a given seed", () => {
            expect(run(G.bool, 0, s0)).toBe(run(G.bool, 0, s0))
            expect(run(G.bool, 0, s1)).toBe(run(G.bool, 0, s1))
            expect(run(G.bool, 0, s2)).toBe(run(G.bool, 0, s2))
        })

        it("should generate both true and false", () => {
            expect(run(G.bool.repeat(10), 0, s0).some(x => x)).toBe(true)
            expect(run(G.bool.repeat(10), 0, s0).some(x => !x)).toBe(true)
        })
    })
})

function run<T>(g: Gen<T>, size: number, seed: SeedState): T {
    const t = g.run(size, seed, 0)
    return t.value
}

const s0 = makeSeedState("bool0")
const s1 = makeSeedState("bool1")
const s2 = makeSeedState("bool2")
