import { Gen } from "../Gen"
import { makeSeedState } from "../prng"
import * as G from "./choice"

describe("Generators/Choice", () => {
    describe("elementOf_", () => {
        it("should throw if given no elements to pick from", () => {
            expect(() => G.elementOf_()).toThrow(RangeError)
        })

        it("should always pick the first element in a list of one", () => {
            const g = G.elementOf_(3)

            expect(g.run(0, s0, 0).value).toBe(3)
            expect(g.run(2, s1, 0).value).toBe(3)
            expect(g.run(10, s2, 0).value).toBe(3)
        })

        it("should always pick one of the given elements", () => {
            const elements = [0, 5, 10, 100]
            const g = G.elementOf_(...elements).repeat(10)
            const picks = g.run(0, s0, 0).value

            expect(picks.every(e => elements.indexOf(e) !== -1)).toBe(true)
        })

        it("should pick different elements from the list", () => {
            const elements = [0, 5, 10, 100]
            const g = G.elementOf_(...elements).repeat(10)
            const picks = g.run(0, s0, 0).value

            expect(picks.every(e1 => picks.some(e2 => e1 !== e2))).toBe(true)
        })

        it("should work with a heterogenous list of picks", () => {
            const elements = ["a", 1, true]
            const g = G.elementOf_(...elements).repeat(10)
            const picks = g.run(0, s0, 2).value

            expect(picks.every(p => p === "a" || p === 1 || p === true)).toBe(
                true,
            )
        })
    })

    describe("elementOf", () => {
        it("should throw if given no elements to pick from", () => {
            expect(() => G.elementOf()).toThrow(RangeError)
        })

        it("should always pick the first element in a list of one", () => {
            const g = G.elementOf(3)

            expect(g.run(0, s0, 0).value).toBe(3)
            expect(g.run(2, s1, 0).value).toBe(3)
            expect(g.run(10, s2, 0).value).toBe(3)
        })

        it("should always pick one of the given elements", () => {
            const elements = [0, 5, 10, 100]
            const g = G.elementOf(...elements).repeat(10)
            const picks = g.run(0, s0, 0).value

            expect(picks.every(e => elements.indexOf(e) !== -1)).toBe(true)
        })

        it("should pick different elements from the list", () => {
            const elements = [0, 5, 10, 100]
            const g = G.elementOf(...elements).repeat(10)
            const picks = g.run(0, s0, 0).value

            expect(picks.every(e1 => picks.some(e2 => e1 !== e2))).toBe(true)
        })

        it("should shrink toward the first element", () => {
            const elements = [0, 5, 10, 100]
            const g = G.elementOf(...elements)

            const t0 = g.run(0, s0, 0)
            const t1 = g.run(5, s1, 0)
            const t2 = g.run(10, s2, 0)

            expect(t0.children.all(t => t.value < t0.value)).toBe(true)
            expect(t1.children.all(t => t.value < t1.value)).toBe(true)
            expect(t2.children.all(t => t.value < t2.value)).toBe(true)
        })
    })

    describe("oneOf_", () => {
        it("should throw if given no generators to pick from", () => {
            expect(() => G.oneOf_()).toThrow(RangeError)
        })

        it("should always pick the first generator in a list of one", () => {
            const g = G.oneOf_(Gen.const(3))

            expect(g.run(0, s0, 0).value).toBe(3)
            expect(g.run(2, s1, 0).value).toBe(3)
            expect(g.run(10, s2, 0).value).toBe(3)
        })

        it("should always pick one of the given generators", () => {
            const oneGen = Gen.const(1)
            const twoGen = Gen.const(2)
            const threeGen = Gen.const(3)
            const g = G.oneOf_(oneGen, twoGen, threeGen).repeat(10)

            const picks = g.run(5, s0, 0).value
            for (const pick of picks) {
                expect(pick === 1 || pick === 2 || pick === 3).toBe(true)
            }
        })

        it("should work with a heterogenous list of generator picks", () => {
            const oneGen = Gen.const(1)
            const trueGen = Gen.const(true)
            const aGen = Gen.const("a")
            const g0 = G.oneOf_(oneGen, trueGen)
            const g = G.oneOf_(g0, aGen).repeat(10)

            const picks = g.run(5, s0, 0).value
            for (const pick of picks) {
                expect(pick === 1 || pick === true || pick === "a").toBe(true)
            }
        })

        it("should always pick the same generator given the same seed", () => {
            const oneGen = Gen.const(1)
            const twoGen = Gen.const(2)
            const threeGen = Gen.const(3)
            const g = G.oneOf_(oneGen, twoGen, threeGen)

            expect(g.run(0, s0, 0).value).toBe(g.run(0, s0, 0).value)
            expect(g.run(2, s1, 0).value).toBe(g.run(2, s1, 0).value)
            expect(g.run(10, s2, 0).value).toBe(g.run(10, s2, 0).value)
        })
    })

    describe("oneOf", () => {
        it("should throw if given no generators to pick from", () => {
            expect(() => G.oneOf()).toThrow(RangeError)
        })

        it("should always pick the first generator in a list of one", () => {
            const g = G.oneOf(Gen.const(3))

            expect(g.run(0, s0, 0).value).toBe(3)
            expect(g.run(2, s1, 0).value).toBe(3)
            expect(g.run(10, s2, 0).value).toBe(3)
        })

        it("should always pick the same generator given the same seed", () => {
            const oneGen = Gen.const(1)
            const twoGen = Gen.const(2)
            const threeGen = Gen.const(3)
            const g = G.oneOf(oneGen, twoGen, threeGen)

            expect(g.run(0, s0, 0).value).toBe(g.run(0, s0, 0).value)
            expect(g.run(2, s1, 0).value).toBe(g.run(2, s1, 0).value)
            expect(g.run(10, s2, 0).value).toBe(g.run(10, s2, 0).value)
        })

        it("should shrink towards the first option", () => {
            const oneGen = Gen.const(1)
            const twoGen = Gen.const(2)
            const threeGen = Gen.const(3)
            const g = G.oneOf(oneGen, twoGen, threeGen)

            const t0 = g.run(0, s0, 0)
            const t1 = g.run(2, s1, 0)
            const t2 = g.run(10, s2, 0)

            expect(t0.children.all(t => t.value < 3))
            expect(t1.children.all(t => t.value < 3))
            expect(t2.children.all(t => t.value < 3))
        })
    })

    describe("frequency_", () => {
        it("should throw if given no generators to pick from", () => {
            expect(() => G.frequency_()).toThrow(RangeError)
        })

        it("should always pick the first generator in a list of one", () => {
            const g = G.frequency_({ weight: 1, gen: Gen.const(3) })

            expect(g.run(0, s0, 0).value).toBe(3)
            expect(g.run(2, s1, 0).value).toBe(3)
            expect(g.run(10, s2, 0).value).toBe(3)
        })

        it("should never pick a generator with zero weight", () => {
            const g0 = G.frequency_(
                { weight: 0, gen: Gen.const(0) },
                { weight: 1, gen: Gen.const(1) },
            )

            const g1 = G.frequency_(
                { weight: 1, gen: Gen.const(1) },
                { weight: 0, gen: Gen.const(0) },
                { weight: 1, gen: Gen.const(1) },
            )

            expect(g0.run(0, s0, 0).value).toBe(1)
            expect(g0.run(2, s1, 0).value).toBe(1)
            expect(g0.run(10, s2, 0).value).toBe(1)
            expect(g1.run(0, s0, 0).value).toBe(1)
            expect(g1.run(2, s1, 0).value).toBe(1)
            expect(g1.run(10, s2, 0).value).toBe(1)
        })

        it("should always pick the same generator given the same seed", () => {
            const oneGen = Gen.const(1)
            const twoGen = Gen.const(2)
            const threeGen = Gen.const(3)
            const g = G.frequency_(
                { gen: oneGen, weight: 1 },
                { gen: twoGen, weight: 2 },
                { gen: threeGen, weight: 1 },
            )

            expect(g.run(0, s0, 0).value).toBe(g.run(0, s0, 0).value)
            expect(g.run(2, s1, 0).value).toBe(g.run(2, s1, 0).value)
            expect(g.run(10, s2, 0).value).toBe(g.run(10, s2, 0).value)
        })

        it("should pick a generator at the statistically expected frequency", () => {
            const g = G.frequency_(
                { weight: 1, gen: Gen.const(0) },
                { weight: 2, gen: Gen.const(1) },
            ).repeat(1000)

            const r0 = g.run(0, s0, 0).value.reduce((a, c) => a + c, 0) / 3
            const r1 = g.run(10, s1, 0).value.reduce((a, c) => a + c, 0) / 3
            const r2 = g.run(100, s2, 0).value.reduce((a, c) => a + c, 0) / 3

            expect(r0 + r1 + r2).toBeGreaterThan(650)
            expect(r0 + r1 + r2).toBeLessThan(670)
        })
    })

    describe("frequency", () => {
        it("should throw if given no generators to pick from", () => {
            expect(() => G.frequency()).toThrow(RangeError)
        })

        it("should always pick the first generator in a list of one", () => {
            const g = G.frequency({ weight: 1, gen: Gen.const(3) })

            expect(g.run(0, s0, 0).value).toBe(3)
            expect(g.run(2, s1, 0).value).toBe(3)
            expect(g.run(10, s2, 0).value).toBe(3)
        })

        it("should never pick a generator with zero weight", () => {
            const g = G.frequency(
                { weight: 0, gen: Gen.const(0) },
                { weight: 1, gen: Gen.const(1) },
            )

            expect(g.run(0, s0, 0).value).toBe(1)
            expect(g.run(2, s1, 0).value).toBe(1)
            expect(g.run(10, s2, 0).value).toBe(1)
        })

        it("should always pick the same generator given the same seed", () => {
            const oneGen = Gen.const(1)
            const twoGen = Gen.const(2)
            const threeGen = Gen.const(3)
            const g = G.frequency(
                { gen: oneGen, weight: 1 },
                { gen: twoGen, weight: 2 },
                { gen: threeGen, weight: 1 },
            )

            expect(g.run(0, s0, 0).value).toBe(g.run(0, s0, 0).value)
            expect(g.run(2, s1, 0).value).toBe(g.run(2, s1, 0).value)
            expect(g.run(10, s2, 0).value).toBe(g.run(10, s2, 0).value)
        })

        it("should shrink towards the first option", () => {
            const oneGen = Gen.const(1)
            const twoGen = Gen.const(2)
            const threeGen = Gen.const(3)
            const g = G.frequency(
                { gen: oneGen, weight: 1 },
                { gen: twoGen, weight: 2 },
                { gen: threeGen, weight: 1 },
            )

            const t0 = g.run(0, s0, 0)
            const t1 = g.run(5, s1, 0)
            const t2 = g.run(10, s2, 0)

            expect(t0.children.all(t => t.value <= t0.value)).toBe(true)
            expect(t1.children.all(t => t.value <= t1.value)).toBe(true)
            expect(t2.children.all(t => t.value <= t2.value)).toBe(true)
        })
    })
})

const s0 = makeSeedState("choise1")
const s1 = makeSeedState("choice2")
const s2 = makeSeedState("choice3")
