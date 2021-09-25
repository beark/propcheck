import Seq from "lazy-sequences"
import Gen from "./Gen"
import { ascii, nat, string } from "./generators"
import { given, PropCheckFailure, shrink } from "./runner"
import { towardsIntegral } from "./shrink"
import Tree from "./Tree"

const trivialPass = (..._: unknown[]) => true
const passWithoutReturn = () => {}

function failingProp(a: number, b: number): boolean {
    return a === b
}

function throwingProp(_: string): void {
    throw new Error("error")
}

function failAtTen(...nums: number[]): boolean {
    return nums.some(n => n < 10)
}

describe("Runner", () => {
    describe("given(...).check", () => {
        it("should always return a passing result for a trivially passing property", () => {
            const result = given().check(trivialPass)
            expect(result).toMatchObject({
                pass: true,
                propName: trivialPass.name,
            })
        })

        it("should always return a passing result for a property that neither throws nor returns anything", () => {
            const result = given().check(passWithoutReturn)
            expect(result).toMatchObject({
                pass: true,
                propName: passWithoutReturn.name,
            })
        })

        it("should return a failing result for a property that fails with false", () => {
            const result = given(nat, nat).check(failingProp)
            expect(result).toMatchObject({
                pass: false,
            })
        })

        it("should return a failing result for a property that fails by throwing", () => {
            const result = given(string(ascii)).check(throwingProp)
            expect(result).toMatchObject({
                pass: false,
                error: new Error("error"),
            })
        })
    })

    describe("given(...).withOptions", () => {
        it("should throw when any of the options are invalid", () => {
            const invalidStartIt = () =>
                given().withOptions({ startIteration: NaN })

            const invalidItCount = () =>
                given().withOptions({ iterations: Infinity })

            const invalidStartSz = () => given().withOptions({ startSize: -1 })
            const invalidSzRng = () =>
                given().withOptions({ maxSize: 2, startSize: 3 })

            expect(invalidStartIt).toThrow(RangeError)
            expect(invalidItCount).toThrow(RangeError)
            expect(invalidStartSz).toThrow(RangeError)
            expect(invalidSzRng).toThrow(RangeError)
        })

        it("should override the iteration count, when given one", () => {
            const prop = jest.fn(() => true)
            const r0 = given(nat, nat, nat)
                .withOptions({ iterations: 10 })
                .check(prop)
            const r1 = given(nat, nat, nat)
                .withOptions({ iterations: 19 })
                .check(prop)

            expect(r0.iteration).toBe(10)
            expect(r1.iteration).toBe(19)
            expect(prop).toHaveBeenCalledTimes(29)
        })

        it("should override the seed, when given one", () => {
            const r0 = given(nat).check(failAtTen) as PropCheckFailure<[number]>
            const r1 = given(nat)
                .withOptions({ seed: "anotherSeed" })
                .check(failAtTen) as PropCheckFailure<[number]>
            const r2 = given(nat)
                .withOptions({ seed: [0, 0, 0, 0] })
                .check(failAtTen) as PropCheckFailure<[number]>

            expect(r0.seed).not.toEqual(r1.seed)
            expect(r1.seed).not.toEqual(r2.seed)
        })

        it("should override the start iteration, when given one", () => {
            const prop = jest.fn(() => true)
            const r0 = given(nat)
                .withOptions({ startIteration: 100 })
                .check(prop)

            expect(prop).toHaveBeenCalledTimes(1)
            expect(r0.iteration).toBe(100)
        })

        it("should override the start size, when given one", () => {
            const gen = Gen.sized(n => Gen.const(n))
            const prop = jest.fn(() => true)
            given(gen).withOptions({ startSize: 50, iterations: 1 }).check(prop)

            expect(prop.mock.calls).toEqual([[50]])
        })

        it("should override the max size, when given one", () => {
            const gen = Gen.sized(n => Gen.const(n))
            const prop = jest.fn(() => true)
            given(gen).withOptions({ maxSize: 50, iterations: 5 }).check(prop)

            expect(prop.mock.calls).toEqual([[3], [14], [26], [38], [50]])
        })
    })

    describe("shrink", () => {
        it("should not find any shrinks when given a tree without children", () => {
            const r = shrink(_ => false, [Tree.singleton(1)])

            expect(r.shrinks).toBe(0)
        })

        it("should try the expected number of shrinks for a generator that produces a shrink tree", () => {
            const simpleShrinks = Tree.from([
                10,
                [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            ])

            const two = (n: number) => n < 1 && n < 10
            function three(m: number, n: number) {
                if (n === 10) {
                    return m < 5 && m < 10
                } else {
                    return false
                }
            }
            const threeShrinks = given(
                Gen.const(10).shrink(x => towardsIntegral(0, x)),
                Gen.const(10).shrink(x => towardsIntegral(0, x)),
            ).check(three) as PropCheckFailure<[number, number]>

            const oneShrink = shrink(_ => false, [simpleShrinks])
            const twoShrinks = shrink(two, [simpleShrinks])

            expect(oneShrink.shrinks).toBe(1)
            expect(oneShrink.smallestFailingArgs).toEqual([0])
            expect(twoShrinks.shrinks).toBe(2)
            expect(twoShrinks.smallestFailingArgs).toEqual([1])

            expect(threeShrinks.pass).toBe(false)
            expect(shrink(three, threeShrinks.args).shrinks).toBe(3)
        })

        it("should always return the smallest possible value a property fails for", () => {
            const r0 = given(nat).check(failAtTen) as PropCheckFailure<[number]>
            const r1 = given(nat, nat).check(failingProp) as PropCheckFailure<
                [number, number]
            >
            const r2 = given(nat, nat).check(failAtTen) as PropCheckFailure<
                [number, number]
            >

            expect(shrink(failAtTen, r0.args)).toMatchObject({
                smallestFailingArgs: [10],
            })
            expect(shrink(failingProp, r1.args)).toMatchObject({
                smallestFailingArgs: expect.arrayContaining([0, 1]),
            })
            expect(shrink(failAtTen, r2.args)).toMatchObject({
                smallestFailingArgs: [10, 10],
            })
        })

        it("should not try more than the maximum number of shrinks wanted", () => {
            const r = given(
                nat.pruneShrinkTree().shrink(_ => Seq.repeat(0)),
            ).check(failAtTen) as PropCheckFailure<[number]>

            expect(
                shrink(failAtTen, r.args, {
                    maxShrinks: 20,
                }),
            ).toMatchObject({
                smallestFailingArgs: [expect.any(Number)],
                shrinks: 20,
            })
        })

        it("should not try more than the maximum number of shrinks wanted per argument", () => {
            const r = given(
                nat.pruneShrinkTree().shrink(_ => Seq.repeat(0)),
                nat.pruneShrinkTree().shrink(_ => Seq.repeat(1)),
            ).check(failingProp) as PropCheckFailure<[number, number]>

            expect(
                shrink(failingProp, r.args, {
                    maxShrinksPerArgument: 9,
                }),
            ).toMatchObject({
                smallestFailingArgs: expect.arrayContaining([0, 1]),
                shrinks: 18,
            })
        })

        it("should by default be limited by per argument shrinks", () => {
            const r = given(
                nat.pruneShrinkTree().shrink(_ => Seq.repeat(0)),
                nat.pruneShrinkTree().shrink(_ => Seq.repeat(1)),
            ).check(failingProp) as PropCheckFailure<[number, number]>

            expect(shrink(failingProp, r.args)).toMatchObject({
                smallestFailingArgs: expect.arrayContaining([0, 1]),
                shrinks: 200,
            })
        })
    })
})
