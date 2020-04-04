import { Gen } from "../Gen"
import { makeSeedState, SeedState } from "../prng"
import { Range } from "../Range"
import * as G from "."

describe("Generators/Numbers", () => {
    describe("integral_", () => {
        it("should always generate the same value for a given seed", () => {
            const integral_ = G.integral_(new Range(0, 10, 0))

            for (const seed of seeds) {
                expect(run(integral_, 0, seed)).toBe(run(integral_, 0, seed))
            }

            expect.assertions(seeds.length)
        })

        it("should generate every number in the given range eventually", () => {
            const integral_ = G.integral_(new Range(0, 5, 0)).repeat(20)

            const hits = [0, 0, 0, 0, 0, 0]
            for (const seed of seeds) {
                const rs = run(integral_, 0, seed)
                expect(rs.every(n => n >= 0)).toBe(true)
                expect(rs.every(n => n < 6)).toBe(true)
                rs.forEach(n => {
                    ++hits[n]
                })
            }

            expect(hits[0]).toBeGreaterThan(0)
            expect(hits[2]).toBeGreaterThan(0)
            expect(hits[3]).toBeGreaterThan(0)
            expect(hits[4]).toBeGreaterThan(0)
            expect(hits[5]).toBeGreaterThan(0)

            expect.assertions(seeds.length * 2 + 5)
        })

        it("should throw when given an invalid range", () => {
            expect(() => G.integral_(new Range(0.5, 1, 0))).toThrowError(
                /minBound to be an integer/,
            )
            expect(() => G.integral_(new Range(-1, 1.5, 0))).toThrowError(
                /maxBound to be an integer/,
            )
        })
    })

    describe("integral", () => {
        it("should always generate the same value for a given seed", () => {
            const integral = G.integral(new Range(0, 10, 0))

            expect(run(integral, 0, s0)).toBe(run(integral, 0, s0))
            expect(run(integral, 0, s1)).toBe(run(integral, 0, s1))
            expect(run(integral, 0, s2)).toBe(run(integral, 0, s2))
        })

        it("should generate every number in the given range eventually", () => {
            const integral = G.integral(new Range(0, 5, 0)).repeat(20)

            const hits = [0, 0, 0, 0, 0, 0]
            for (const seed of seeds) {
                const rs = run(integral, 0, seed)
                expect(rs.every(n => n >= 0)).toBe(true)
                expect(rs.every(n => n < 6)).toBe(true)
                rs.forEach(n => {
                    ++hits[n]
                })
            }

            expect(hits[0]).toBeGreaterThan(0)
            expect(hits[2]).toBeGreaterThan(0)
            expect(hits[3]).toBeGreaterThan(0)
            expect(hits[4]).toBeGreaterThan(0)
            expect(hits[5]).toBeGreaterThan(0)

            expect.assertions(seeds.length * 2 + 5)
        })

        it("should generate sensible shrinks for the generated value", () => {
            const integral = G.integral(new Range(2, 10, 0))

            const t0 = integral.run(0, s0, 0)
            const t1 = integral.run(0, s1, 0)
            const t2 = integral.run(0, s2, 0)

            expect(t0.children.count()).toBeGreaterThan(0)
            expect(t1.children.count()).toBeGreaterThan(0)
            expect(t2.children.count()).toBeGreaterThan(0)
            expect(t0.children.all(t => t.value < t0.value)).toBe(true)
            expect(t1.children.all(t => t.value < t1.value)).toBe(true)
            expect(t2.children.all(t => t.value < t2.value)).toBe(true)
        })

        it("should throw when given an invalid range", () => {
            expect(() => G.integral(new Range(0.5, 1, 0))).toThrowError(
                /minBound to be an integer/,
            )
            expect(() => G.integral(new Range(-1, 1.5, 0))).toThrowError(
                /maxBound to be an integer/,
            )
            expect(() => G.integral(new Range(-1, 2, 0.5))).toThrowError(
                /origin to be an integer/,
            )
        })
    })

    describe("num_", () => {
        it("should always generate the same value for a given seed", () => {
            const num_ = G.num_(new Range(0, 10, 0))

            expect(run(num_, 0, s0)).toBe(run(num_, 0, s0))
            expect(run(num_, 0, s1)).toBe(run(num_, 0, s1))
            expect(run(num_, 0, s2)).toBe(run(num_, 0, s2))
        })

        it("should generate numbers in the given range", () => {
            const num_ = G.num_(new Range(0, 5, 0)).repeat(25)

            const r0 = run(num_, 0, s0)
            expect(r0.every(n => n >= 0)).toBe(true)
            expect(r0.every(n => n <= 5)).toBe(true)
        })

        it("should generate non-integral numbers", () => {
            const num_ = G.num_(new Range(0, 5, 0)).repeat(25)

            const r0 = run(num_, 0, s0)
            expect(r0.some(n => Math.abs(n - Math.trunc(n)) > 0)).toBe(true)
            expect(r0.some(n => Math.abs(n - Math.trunc(n)) > 0.5)).toBe(true)
        })
    })

    describe("num", () => {
        it("should always generate the same value for a given seed", () => {
            const num = G.num(new Range(0, 10, 0))

            expect(run(num, 0, s0)).toBe(run(num, 0, s0))
            expect(run(num, 0, s1)).toBe(run(num, 0, s1))
            expect(run(num, 0, s2)).toBe(run(num, 0, s2))
        })

        it("should generate numbers in the given range", () => {
            const num = G.num(new Range(0, 5, 0)).repeat(25)

            const r0 = run(num, 0, s0)
            expect(r0.every(n => n >= 0)).toBe(true)
            expect(r0.every(n => n <= 5)).toBe(true)
        })

        it("should generate non-integral numbers", () => {
            const num = G.num(new Range(0, 5, 0)).repeat(25)

            const r0 = run(num, 0, s0)
            expect(r0.some(n => Math.abs(n - Math.trunc(n)) > 0)).toBe(true)
            expect(r0.some(n => Math.abs(n - Math.trunc(n)) > 0.5)).toBe(true)
        })

        it("should generate sensible shrink trees", () => {
            const num = G.num(new Range(2, 7, 0))

            const t0 = num.run(0, s0, 0)
            const t1 = num.run(0, s1, 0)
            const t2 = num.run(0, s2, 0)

            expect(t0.children.count()).toBeGreaterThan(0)
            expect(t1.children.count()).toBeGreaterThan(0)
            expect(t2.children.count()).toBeGreaterThan(0)
            expect(t0.children.all(t => t.value < t0.value)).toBe(true)
            expect(t1.children.all(t => t.value < t1.value)).toBe(true)
            expect(t2.children.all(t => t.value < t2.value)).toBe(true)
        })
    })
})

function run<T>(g: Gen<T>, size: number, seed: SeedState): T {
    const t = g.run(size, seed, 0)
    return t.value
}

const s0 = makeSeedState("numbers0")
const s1 = makeSeedState("numbers1")
const s2 = makeSeedState("numbers2")

const seeds: SeedState[] = []
for (let i = 0; i < 20; ++i) {
    seeds.push(makeSeedState(i.toString()))
}
