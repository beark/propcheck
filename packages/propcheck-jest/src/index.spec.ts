import { Gen, Generators } from "@propcheck/core"
import { makeSeedState } from "@propcheck/core/prng"
import "."

/* eslint @typescript-eslint/no-explicit-any: 0 */

beforeEach(() => {
    delete process.env.PROPCHECK_SEED
    delete process.env.PROPCHECK_STARTITER
    delete process.env.PROPCHECK_ITERCOUNT
    delete process.env.PROPCHECK_STARTSIZE
    delete process.env.PROPCHECK_MAXSIZE
})

describe("Importing @propcheck/jest", () => {
    it("should populate expect().forall as a side effect", () => {
        expect(expect(0).forall).toBeDefined()
        expect(typeof expect(0).forall).toBe("function")
    })

    it("should populate expect().forallWithOptions as a side effect", () => {
        expect(expect(0).forallWithOptions).toBeDefined()
        expect(typeof expect(0).forallWithOptions).toBe("function")
    })
})

describe("Expecting a property forall arguments", () => {
    it("should pass for a trivial property", () => {
        const prop = (_: number) => true

        expect(prop).forall(Generators.nat)
    })

    it("should fail for a trivial property when isNot", () => {
        const prop = (_: number) => true

        expect(() => expect(prop).not.forall(Generators.nat)).toThrowError(
            /passed after 100 iterations/,
        )
    })

    it("should fail when a proeprty fails by return value", () => {
        const prop = (_: number) => false

        expect(() => expect(prop).forall(Generators.nat)).toThrow()
    })

    it("should fail when a property fails by exception", () => {
        const prop = (_: number) => {
            throw new Error("failure")
        }

        expect(() => expect(prop).forall(Generators.nat)).toThrowError(
            /failure/,
        )
    })

    it("should fail when giving an invalid option", () => {
        const prop = () => true

        expect(() =>
            expect(prop).forallWithOptions({ iterations: -1 }),
        ).toThrowError(/iterations must be an integer > 0/)
    })

    it("should fail when giving an invalid option even when isNot", () => {
        const prop = () => true

        expect(() =>
            expect(prop).not.forallWithOptions({ iterations: -1 }),
        ).toThrowError(/iterations must be an integer > 0/)
    })

    it("should use any configured seed", () => {
        const prop = (_: number) => false

        try {
            expect(prop).forallWithOptions(
                { seed: [0, 1, 2, 3] },
                Generators.nat,
            )
        } catch (e) {
            expect(e.message).toMatch(/Seed: {0,1,2,3}/)
        }

        // Ensure both expects were hit
        expect.assertions(2)
    })

    it("should use any configured starting size", () => {
        const prop = (_: number) => false

        try {
            expect(prop).forallWithOptions({ startSize: 33 }, Generators.nat)
        } catch (e) {
            expect(e.message).toMatch(/Size: 33/)
        }

        // Ensure both expects were hit
        expect.assertions(2)
    })

    it("should use any configured maximum size", () => {
        const prop = jest.fn((_: number) => true)

        expect(prop).forallWithOptions(
            { maxSize: 33 },
            Gen.sized(sz => Gen.const(sz)),
        )

        // Ensure both expects were hit
        expect(prop).toHaveBeenLastCalledWith(33)
    })

    it("should use any configured start iteration", () => {
        const prop = (_: number) => false

        try {
            expect(prop).forallWithOptions(
                { startIteration: 11 },
                Generators.nat,
            )
        } catch (e) {
            expect(e.message).toMatch(/11 iterations/)
        }

        // Ensure both expects were hit
        expect.assertions(2)
    })

    it("should use any configured iteration count", () => {
        const prop = jest.fn((_: number) => true)

        expect(prop).forallWithOptions({ iterations: 13 }, Generators.nat)

        expect(prop).toHaveBeenCalledTimes(13)
    })

    it("should pass if a property fails when isNot", () => {
        const prop = (_: number) => false

        expect(prop).not.forall(Generators.nat)
    })

    it("should fail if a non-property is given", () => {
        expect(() => (expect({}) as any).forall(Generators.nat)).toThrow(
            /non-function/,
        )
    })

    it("should fail if a non-property is given when isNot", () => {
        expect(() =>
            (expect({}) as any).not.forall(Generators.nat),
        ).toThrowError(/non-function/)
    })

    it("should throw if non-generators are passed", () => {
        const prop = (_: number) => true
        expect(() => expect(prop).forall({} as any)).toThrowError(
            /non-generator/,
        )
    })

    it("should throw if non-generators are passed when isNot", () => {
        const prop = (_: number) => true
        expect(() => expect(prop).not.forall({} as any)).toThrowError(
            /non-generator/,
        )
    })

    describe("when propcheck environment variables are defined", () => {
        it("should use any provided seed, even over one given by options", () => {
            process.env.PROPCHECK_SEED = "test"
            const prop = (_: number) => false

            try {
                expect(prop).forallWithOptions(
                    { seed: [0, 1, 2, 3] },
                    Generators.nat,
                )
            } catch (e) {
                const seedStr = makeSeedState("test")
                    .map(n => n.toString(16))
                    .join(",")
                expect(e.message).toMatch(`Seed: {${seedStr}}`)
            }

            // Ensure both expects were hit
            expect.assertions(2)
        })

        it("should use any provided starting size, even over one given by options", () => {
            process.env.PROPCHECK_STARTSIZE = "23"
            const prop = (_: number) => false

            try {
                expect(prop).forallWithOptions(
                    { startSize: 33 },
                    Generators.nat,
                )
            } catch (e) {
                expect(e.message).toMatch(/Size: 23/)
            }

            // Ensure both expects were hit
            expect.assertions(2)
        })

        it("should throw when providing an invalid starting size", () => {
            process.env.PROPCHECK_STARTSIZE = "-1"
            const prop = (_: number) => false

            try {
                expect(prop).forall(Generators.nat)
            } catch (e) {
                expect(e.message).toMatch(/startSize must be an integer >= 0/)
            }

            // Ensure both expects were hit
            expect.assertions(2)
        })

        it("should use any provided maximum size, even over one given by options", () => {
            process.env.PROPCHECK_MAXSIZE = "23"
            const prop = jest.fn(_ => true)

            expect(prop).forallWithOptions(
                { maxSize: 33 },
                Gen.sized(sz => Gen.const(sz)),
            )

            expect(prop).toHaveBeenLastCalledWith(23)
        })

        it("should throw when providing an invalid maximum size", () => {
            process.env.PROPCHECK_MAXSIZE = ""
            const prop = jest.fn(_ => true)

            expect(() =>
                expect(prop).forall(Gen.sized(sz => Gen.const(sz))),
            ).toThrowError(/maxSize must be an integer >= startSize/)
        })

        it("should use any configured start iteration, even over one given by options", () => {
            process.env.PROPCHECK_STARTITER = "21"
            const prop = (_: number) => false

            try {
                expect(prop).forallWithOptions(
                    { startIteration: 11 },
                    Generators.nat,
                )
            } catch (e) {
                expect(e.message).toMatch(/21 iterations/)
            }

            // Ensure both expects were hit
            expect.assertions(2)
        })

        it("should throw when providing an invalid start iteration", () => {
            process.env.PROPCHECK_STARTITER = "abc"
            const prop = (_: number) => false

            expect(() => expect(prop).forall(Generators.nat)).toThrowError(
                /startIteration must be an integer >= 1/,
            )

            // Ensure both expects were hit
            expect.assertions(2)
        })

        it("should use any configured iteration count, even over one given by options", () => {
            process.env.PROPCHECK_ITERCOUNT = "8"
            const prop = jest.fn((_: number) => true)

            expect(prop).forallWithOptions({ iterations: 13 }, Generators.nat)

            expect(prop).toHaveBeenCalledTimes(8)
        })

        it("should throw when providing an invalid iteration count", () => {
            process.env.PROPCHECK_ITERCOUNT = "-1"
            const prop = jest.fn((_: number) => true)

            expect(() => expect(prop).forall(Generators.nat)).toThrowError(
                /iterations must be an integer > 0/,
            )
        })
    })

    describe("when using the options emitted from a failed run", () => {
        it("should fail in exactly the same manner", () => {
            const prop = (n: number) => n < 31 && n > 35

            let lastSeedStr = ""
            for (const seed of seeds) {
                try {
                    expect(prop).forallWithOptions({ seed }, Generators.nat)
                } catch (e) {
                    const message: string = e.message

                    const startIter = /failed after ([0-9]+) iter/.exec(
                        message,
                    )![1]
                    const size = /Size: ([0-9]+)/.exec(message)![1]

                    const seedStr = /Seed: ({.*})/.exec(message)![1]

                    process.env.PROPCHECK_STARTITER = startIter
                    process.env.PROPCHECK_SEED = seedStr
                    process.env.PROPCHECK_STARTSIZE = size

                    expect(seedStr).not.toEqual(lastSeedStr)
                    expect(() =>
                        expect(prop).forall(Generators.nat),
                    ).toThrowError(e)

                    lastSeedStr = seedStr
                }

                delete process.env.PROPCHECK_STARTITER
                delete process.env.PROPCHECK_SEED
                delete process.env.PROPCHECK_STARTSIZE
            }

            expect.assertions(4 * seeds.length)
        })
    })
})

const seeds = [
    makeSeedState("jest0"),
    makeSeedState("jest1"),
    makeSeedState("jest2"),
    makeSeedState("0jest"),
    makeSeedState("1jest"),
    makeSeedState("2jest"),
]
