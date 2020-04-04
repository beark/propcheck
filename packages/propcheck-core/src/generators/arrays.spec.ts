import { Gen } from "../Gen"
import { makeSeedState, SeedState } from "../prng"
import { Range } from "../Range"
import * as G from "."

describe("Generators/Arrays", () => {
    describe("array_", () => {
        it("should always generate the same array when given the same seed and size", () => {
            const array_ = G.array_(G.nat, new Range(3, 7, 0))

            expect(run(array_, 0, s0)).toEqual(run(array_, 0, s0))
            expect(run(array_, 5, s1)).toEqual(run(array_, 5, s1))
            expect(run(array_, 10, s2)).toEqual(run(array_, 10, s2))
        })

        it("should always generate an array with a length within the given range", () => {
            const array_ = G.array_(G.nat, new Range(3, 7, 0))

            const r0 = run(array_, 0, s0)
            const r1 = run(array_, 5, s1)
            const r2 = run(array_, 10, s2)

            expect(r0.length).toBeGreaterThan(2)
            expect(r0.length).toBeLessThan(8)
            expect(r1.length).toBeGreaterThan(2)
            expect(r1.length).toBeLessThan(8)
            expect(r2.length).toBeGreaterThan(2)
            expect(r2.length).toBeLessThan(8)
        })

        it("should throw when given an invalid range", () => {
            expect(() => G.array_(G.nat, new Range(0.5, 2, 0))).toThrowError(
                /integral minBound/,
            )
            expect(() => G.array_(G.nat, new Range(-1, 2, 0))).toThrowError(
                /integral minBound/,
            )
            expect(() => G.array_(G.nat, new Range(0, 2.5, 0))).toThrowError(
                /integral maxBound/,
            )
            expect(() => G.array_(G.nat, new Range(2, 2, 0))).toThrowError(
                /integral maxBound/,
            )
        })
    })

    describe("array", () => {
        it("should always generate the same array when given the same seed and size", () => {
            const array = G.array(G.nat, new Range(3, 7, 0))

            expect(run(array, 0, s0)).toEqual(run(array, 0, s0))
            expect(run(array, 5, s1)).toEqual(run(array, 5, s1))
            expect(run(array, 10, s2)).toEqual(run(array, 10, s2))
        })

        it("should always generate an array with a length within the given range", () => {
            const array = G.array(G.nat, new Range(3, 7, 0))

            const r0 = run(array, 0, s0)
            const r1 = run(array, 5, s1)
            const r2 = run(array, 10, s2)

            expect(r0.length).toBeGreaterThan(2)
            expect(r0.length).toBeLessThan(8)
            expect(r1.length).toBeGreaterThan(2)
            expect(r1.length).toBeLessThan(8)
            expect(r2.length).toBeGreaterThan(2)
            expect(r2.length).toBeLessThan(8)
        })

        it("should throw when given an invalid range", () => {
            expect(() => G.array(G.nat, new Range(0.5, 2, 0))).toThrowError(
                /integral minBound/,
            )
            expect(() => G.array(G.nat, new Range(-1, 2, 0))).toThrowError(
                /integral minBound/,
            )
            expect(() => G.array(G.nat, new Range(0, 2.5, 0))).toThrowError(
                /integral maxBound/,
            )
            expect(() => G.array(G.nat, new Range(2, 2, 0))).toThrowError(
                /integral maxBound/,
            )
            expect(() => G.array(G.nat, new Range(2, 5, 0.5))).toThrowError(
                /integral origin/,
            )
        })

        it("should generate sensible shrink trees", () => {
            const array = G.array(G.nat, new Range(3, 7, 0))

            const t0 = array.run(0, s0, 0)
            const t1 = array.run(5, s1, 0)
            const t2 = array.run(10, s2, 0)

            expect(t0.children.count()).toBeGreaterThan(0)
            expect(t0.children.all(t => t.value.length < t0.value.length))

            expect(t1.children.count()).toBeGreaterThan(0)
            expect(t1.children.all(t => t.value.length < t1.value.length))

            expect(t2.children.count()).toBeGreaterThan(0)
            expect(t2.children.all(t => t.value.length < t2.value.length))
        })
    })

    describe("arrayOf", () => {
        it("should always generate an array with a length ranging from 0 to the given size", () => {
            const g = G.arrayOf(G.integral(new Range(0, 10, 0)))

            expect(run(g, 0, s0)).toHaveLength(0)
            expect(run(g, 5, s1).length).toBeGreaterThan(0)
            expect(run(g, 5, s1).length).toBeLessThanOrEqual(5)
            expect(run(g, 25, s2).length).toBeGreaterThan(0)
            expect(run(g, 25, s2).length).toBeLessThanOrEqual(25)
        })

        it("should have a shrink tree with shorter arrays", () => {
            const g = G.arrayOf(G.integral(new Range(0, 10, 0)))

            const t0 = g.run(7, s0, 0)
            const t1 = g.run(10, s1, 0)
            const t2 = g.run(17, s2, 0)

            const l0 = t0.value.length
            for (const t of t0.children) {
                expect(t.value.length).toBeLessThanOrEqual(l0)
            }

            const l1 = t1.value.length
            for (const t of t1.children) {
                expect(t.value.length).toBeLessThanOrEqual(l1)
            }

            const l2 = t2.value.length
            for (const t of t2.children) {
                expect(t.value.length).toBeLessThanOrEqual(l2)
            }
        })
    })

    describe("tuple", () => {
        it("should generate tuples with the right types", () => {
            const g = G.tuple(G.nat, G.alpha, G.bool)

            const r0 = run(g, 10, s0)
            const r1 = run(g, 10, s1)
            const r2 = run(g, 10, s2)

            expect(r0).toEqual([
                expect.any(Number),
                expect.any(String),
                expect.any(Boolean),
            ])

            expect(r1).toEqual([
                expect.any(Number),
                expect.any(String),
                expect.any(Boolean),
            ])

            expect(r2).toEqual([
                expect.any(Number),
                expect.any(String),
                expect.any(Boolean),
            ])
        })

        it("should generate appropriate shrink trees for the elements", () => {
            const g = G.tuple(G.nat)

            const t0 = g.run(10, s0, 0)

            expect(t0.children.count()).toBeGreaterThan(0)
            for (const shrink of t0.children) {
                expect(shrink.value[0]).toBeLessThan(t0.value[0])
            }
        })
    })
})

function run<T>(g: Gen<T>, size: number, seed: SeedState): T {
    const t = g.run(size, seed, 0)
    return t.value
}

const s0 = makeSeedState("array0")
const s1 = makeSeedState("array1")
const s2 = makeSeedState("array2")
