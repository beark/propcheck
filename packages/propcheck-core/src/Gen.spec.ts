import Seq from "lazy-sequences"
import { Gen } from "./Gen"
import * as G from "./generators"
import { makeSeedState, split, step, SeedState } from "./prng"
import { Range } from "./Range"
import { towardsIntegral } from "./shrink"

const seeds: SeedState[] = []
for (let i = 0; i < 20; ++i) {
    seeds.push(makeSeedState(i.toString()))
}

describe("Gen", () => {
    describe("andThen", () => {
        it("should combine the shrink trees of both generators", () => {
            const shrinkStr = (s: string) => Seq.singleton(`str * '${s}'`)

            const gen = Gen.const(3)
                .shrink(x => towardsIntegral(0, x))
                .andThen(x => Gen.const(" ".repeat(x)).shrink(shrinkStr))

            for (const seed of seeds) {
                const shrinks = [...gen.run(0, seed, 0)]
                expect(shrinks).toEqual([
                    "   ",
                    "",
                    "str * ''",
                    "  ",
                    "str * '  '",
                    "str * '   '",
                ])
            }

            expect.assertions(seeds.length)
        })
    })

    describe("const", () => {
        it("should generate a constant value, regardless of seed", () => {
            const gen = Gen.const(10)

            for (const seed of seeds) {
                expect(gen.run(0, seed, 0).value).toEqual(10)
            }

            expect.assertions(seeds.length)
        })

        it("should generate a constant value, regardless of size and seed", () => {
            const gen = Gen.const(10)

            for (const seed of seeds) {
                expect(gen.run(0, seed, 0).value).toEqual(10)
            }

            expect.assertions(seeds.length)
        })
    })

    describe("sequence", () => {
        it("should throw when given no generator", () => {
            expect(Gen.sequence).toThrowError(RangeError)
        })

        it("should run the generator associated with the given iteration", () => {
            const gen = Gen.sequence(Gen.const(0), Gen.const(5))

            for (const seed of seeds) {
                expect(gen.run(0, seed, 0).value).toBe(0)
                expect(gen.run(0, seed, 1).value).toBe(5)
            }

            expect.assertions(seeds.length * 2)
        })

        it('should "saturate" on the last generator', () => {
            const gen = Gen.sequence(Gen.const(0), Gen.const(5))

            for (const seed of seeds) {
                for (let i = 1; i < 101; i += 10) {
                    expect(gen.run(0, seed, i).value).toBe(5)
                }
            }
        })

        it("should generate the shrink tree of the picked generator", () => {
            const g0 = Gen.const(0).shrink(_ => new Seq([1]))
            const g1 = Gen.const(1).shrink(_ => new Seq([2, 3]))
            const seqGen = Gen.sequence(g0, g1)

            for (const seed of seeds) {
                const t0 = seqGen.run(0, seed, 0)
                const t1 = seqGen.run(0, seed, 1)

                expect([...t0]).toEqual([0, 1])
                expect([...t1]).toEqual([1, 2, 3])
            }
        })

        it("should not include predecessors in shrink trees", () => {
            const g0 = Gen.const(0).shrink(_ => new Seq([1, 2]))
            const g1 = Gen.const(3).shrink(_ => new Seq([4, 5]))
            const seqGen = Gen.sequence(g0, g1)

            for (const seed of seeds) {
                const t = seqGen.run(0, seed, 1)

                expect([...t]).toEqual([3, 4, 5])
            }
        })
    })

    describe("generate", () => {
        it("should create a generator using the given function", () => {
            const gen = Gen.fromFn((_, sd) => sd)

            for (const seed of seeds) {
                expect(gen.run(0, seed, 0).value).toEqual(seed)
            }

            expect.assertions(seeds.length)
        })
    })

    describe("resize", () => {
        it("should run the input generator with the new size", () => {
            const gen = Gen.sized(sz => Gen.const(sz)).resize(15)

            for (const seed of seeds) {
                expect(gen.run(5, seed, 0).value).toBe(15)
            }

            expect.assertions(seeds.length)
        })

        it("should throw if given an invalid size", () => {
            const gen = Gen.const(0)

            expect(() => gen.resize(-1)).toThrow(RangeError)
            expect(() => gen.resize(NaN)).toThrow(RangeError)
            expect(() => gen.resize(1.5)).toThrow(RangeError)
            expect(() => gen.resize(Infinity)).toThrow(RangeError)
        })
    })

    describe("scale", () => {
        it("should scale the size given to the input generator", () => {
            const gen = Gen.sized(sz => Gen.const(sz)).scale(sz => 2 * sz)

            for (const seed of seeds) {
                expect(gen.run(5, seed, 0).value).toBe(10)
            }

            expect.assertions(seeds.length)
        })
    })

    describe("shrink", () => {
        it("should add shrinks when there are none", () => {
            const gen = Gen.const(10).shrink(x => towardsIntegral(0, x))

            const t = gen.run(0, seeds[0]!, 0)

            expect([...t]).toEqual([10, 0, 5, 8, 9])
        })

        it("should add shrinks to any existing ones", () => {
            const gen = Gen.const(10)
                .shrink(x => towardsIntegral(0, x))
                .shrink(_ => Seq.singleton(100))

            const t = gen.run(0, seeds[0]!, 0)

            expect([...t]).toEqual([10, 0, 5, 8, 9, 100])
        })
    })

    describe("shrinkRecursively", () => {
        it("should recursively add shrinks when there are none", () => {
            const gen = Gen.const(10).shrinkRecursively(x =>
                towardsIntegral(0, x),
            )

            const cs = gen.run(0, seeds[0]!, 0).children

            expect([...cs.map(t => t.value)]).toEqual([0, 5, 8, 9])

            const c1 = cs.drop(2).collect()[0]!
            expect([...c1.children.map(t => t.value)]).toEqual([0, 4, 6, 7])
        })

        it("should add shrinks to any existing set", () => {
            const gen = Gen.const(10)
                .shrink(x => towardsIntegral(0, x))
                .shrinkRecursively(_ => [100])

            const cs = gen.run(0, seeds[0]!, 0).children
            expect([...cs.map(t => t.value)]).toEqual([0, 5, 8, 9, 100])
        })
    })

    describe("suchThatMaybe", () => {
        it("should always produce values that satisfy the predicate, when possible", () => {
            const gen = Gen.sized(sz => Gen.const(sz)).suchThatMaybe(
                x => x > 10,
            )

            for (const seed of seeds) {
                expect(gen.run(6, seed, 0).value).toBe(11)
            }

            expect.assertions(seeds.length)
        })

        it("shouldn't produce anything when the predicate can't be satisfied", () => {
            const gen = Gen.sized(sz => Gen.const(sz)).suchThatMaybe(
                x => x > 10,
            )

            for (const seed of seeds) {
                expect(gen.run(2, seed, 0).value).not.toBeDefined()
            }

            expect.assertions(seeds.length)
        })
    })

    describe("suchThat", () => {
        it("should always produce values that satisfy the predicate", () => {
            const gen = Gen.sized(sz => Gen.const(sz)).suchThat(x => x > 10)

            for (const seed of seeds) {
                expect(gen.run(0, seed, 0).value).toBe(11)
            }

            expect.assertions(seeds.length)
        })
    })

    describe("functor laws", () => {
        it("map(id) === id", () => {
            const gen = G.integral(new Range(0, 10, 0))
            const mappedGen = gen.map(id)

            for (const seed of seeds) {
                const result = gen.run(0, seed, 0)
                const mappedResult = mappedGen.run(0, seed, 0)

                expect([...mappedResult]).toEqual([...result])
                expect([...mappedResult.breadthFirst()]).toEqual([
                    ...result.breadthFirst(),
                ])
            }

            expect.assertions(2 * seeds.length)
        })

        it("map(f * g) === map(f) * map(g)", () => {
            for (const seed of seeds) {
                const fseed = split(seed)[1]
                const fG = G.fn(G.nat)
                const gG = G.fn(G.nat)

                const f = fG.run(10, fseed, 0).value
                const g = gG.run(10, step(fseed), 0).value

                let curSeed = seed
                for (let i = 0; i < 10; ++i) {
                    const lhs = G.nat
                        .map(x => f(g(x)))
                        .run(10, curSeed, 0).value
                    const rhs = G.nat.map(g).map(f).run(10, curSeed, 0).value

                    expect(lhs).toBe(rhs)

                    curSeed = step(curSeed)
                }
            }
        })

        // Note: While Gen has a bind/andThen, it is not a lawful monad!
        // It satifies neither right nor left identity!
    })
})

const id = <T>(x: T) => x
