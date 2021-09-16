import { Gen } from "../Gen"
import { makeSeedState, SeedState } from "../prng"
import Range from "../Range"
import * as G from "."
import Seq from "lazy-sequences"

describe("generators/objects", () => {
    describe("obj_", () => {
        it("should generate empty objects when given an empty generator", () => {
            const g = G.obj_({})

            for (const seed of seeds) {
                const r = run(g, 10, seed)

                expect(r).toEqual({})
            }
        })

        it("should generate objects with the specified properties", () => {
            const g = G.obj_({
                a: G.int,
                b: G.bool,
                c: G.alpha,
            })

            for (const seed of seeds) {
                const r = run(g, 10, seed)

                expect(r).toEqual({
                    a: expect.any(Number),
                    b: expect.any(Boolean),
                    c: expect.any(String),
                })
            }
        })

        it("should generate inherited properties", () => {
            const g = G.obj_(new BarGen(G.nat, G.alpha))

            for (const seed of seeds) {
                const r = run(g, 10, seed)

                expect(r).toEqual({
                    foo: expect.any(Number),
                    bar: expect.any(String),
                })
            }
        })

        it("should generate no shrink trees", () => {
            const g = G.obj_({
                // This should normally always generate shrinks
                n: G.integral(new Range(10, 100, 0)),
            })

            for (const seed of seeds) {
                const r = g.run(1000, seed, 0)

                expect([...r.children]).toHaveLength(0)
            }
        })
    })

    describe("obj", () => {
        it("should generate empty objects when given an empty generator", () => {
            const g = G.obj({})

            for (const seed of seeds) {
                const r = run(g, 10, seed)

                expect(r).toEqual({})
            }
        })

        it("should generate objects with the specified properties", () => {
            const g = G.obj({
                a: G.int,
                b: G.bool,
                c: G.alpha,
            })

            for (const seed of seeds) {
                const r = run(g, 10, seed)

                expect(r).toEqual({
                    a: expect.any(Number),
                    b: expect.any(Boolean),
                    c: expect.any(String),
                })
            }
        })

        it("should generate inherited properties", () => {
            const g = G.obj(new BarGen(G.nat, G.alpha))

            for (const seed of seeds) {
                const r = run(g, 10, seed)

                expect(r).toEqual({
                    foo: expect.any(Number),
                    bar: expect.any(String),
                })
            }
        })

        it("should generate shrink trees if sub-generators do", () => {
            const g = G.obj({
                // This should always generate shrinks
                n: G.integral(new Range(10, 100, 0)),
            })

            for (const seed of seeds) {
                const r = g.run(1000, seed, 0)

                expect([...r.children].length).toBeGreaterThan(0)
            }
        })

        it("[sanity] shrink trees", () => {
            const g = G.obj({
                a: Gen.const(0).shrink(_ => Seq.singleton(1)),
                b: Gen.const("a").shrink(_ => Seq.singleton("b")),
            })

            for (const seed of seeds) {
                const r = [...g.run(0, seed, 0)]

                expect(r).toEqual(
                    expect.arrayContaining([
                        { a: 0, b: "a" },
                        { a: 1, b: "a" },
                        { a: 0, b: "b" },
                        { a: 1, b: "b" },
                    ]),
                )
                expect(r).toHaveLength(4)
            }
        })
    })

    describe("propertyNameOf", () => {
        it("should correctly generate array keys", () => {
            const g = G.propertyNameOf([1, 2, 3]).repeat(100)

            for (const seed of seeds) {
                const r = g.run(0, seed, 0).value

                expect(r).toMatchObject(
                    expect.arrayContaining(["0", "1", "2", "length"]),
                )
            }
        })

        it("should only generate strings or symbols present in input", () => {
            const g = G.propertyNameOf({
                foo: undefined,
                bar: undefined,
            }).repeat(100)

            const r0 = g.run(0, s0, 0).value
            const r1 = g.run(0, s1, 0).value
            const r2 = g.run(0, s2, 0).value

            expect(r0.every(k => k === "foo" || k === "bar"))
            expect(r1.every(k => k === "foo" || k === "bar"))
            expect(r2.every(k => k === "foo" || k === "bar"))
        })

        it("should throw if input has no properties", () => {
            expect(() => G.propertyNameOf({})).toThrow()
        })
    })
})

class FooGen {
    constructor(public foo: Gen<number>) {}
}

class BarGen extends FooGen {
    constructor(foo: Gen<number>, public bar: Gen<string>) {
        super(foo)
    }
}

function run<T>(g: Gen<T>, size: number, seed: SeedState): T {
    const t = g.run(size, seed, 0)
    return t.value
}

const s0 = makeSeedState("object0")
const s1 = makeSeedState("object1")
const s2 = makeSeedState("object2")

const seeds = [s0, s1, s2]
