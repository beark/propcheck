import * as Prng from "./prng"

describe("Prng", () => {
    describe("step", () => {
        it("should yield a different seed from the given one", () => {
            seeds.forEach(s => {
                expect(s).not.toEqual(Prng.step(s))
            })
        })

        it("should yield the same result when given the same seed", () => {
            seeds.forEach(s => {
                expect(Prng.step(s)).toEqual(Prng.step(s))
            })
        })
    })

    describe("split", () => {
        it("should yield two different seeds", () => {
            const splitSeeds = seeds.map(s => Prng.split(s))
            splitSeeds.forEach(([s0, s1]) => {
                expect(s0).not.toEqual(s1)
            })
        })

        it("should always give the same splits when given the same seed", () => {
            seeds.forEach(s => {
                const split0 = Prng.split(s)
                const split1 = Prng.split(s)

                expect(split0).toEqual(split1)
            })
        })
    })

    describe("nextNum", () => {
        it("should return the same number when given the same seed", () => {
            seeds.forEach(s => expect(Prng.nextNum(s)).toBe(Prng.nextNum(s)))
        })

        it("should yield a number within the given bounds", () => {
            const bounds = [
                [0, 1],
                [0, 100],
                [0.5, 0.75],
                [40.5, 1234.5],
            ] as const
            bounds.forEach(([minBound, maxBound]) => {
                seeds.forEach(s => {
                    const n = Prng.nextNum(s, { minBound, maxBound })
                    expect(n).toBeGreaterThanOrEqual(minBound)
                    expect(n).toBeLessThanOrEqual(maxBound)
                })
            })

            expect.assertions(2 * bounds.length * seeds.length)
        })
    })

    describe("nextInt", () => {
        it("should always yield the same integer when given the same seed", () => {
            seeds.forEach(s => {
                const n = Prng.nextInt(s)

                expect(Number.isInteger(n)).toBeTruthy()
                expect(Prng.nextInt(s)).toBe(n)
            })

            expect.assertions(seeds.length * 2)
        })

        it("should generate each integer with equal probability for the 0-1 range", () => {
            seeds.forEach(startSeed => {
                const numbers: number[] = []
                let sum = 0
                let s = startSeed
                for (let i = 0; i < 10_000; ++i) {
                    const n = Prng.nextInt(s, { minBound: 0, maxBound: 1 })

                    numbers.push(n)
                    sum += n
                    s = Prng.step(s)
                }

                numbers.forEach(n => {
                    expect([0, 1]).toContain(n)
                })
                expect(sum / 10_000).toBeGreaterThan(0.48)
                expect(sum / 10_000).toBeLessThan(0.52)
            })

            expect.assertions(seeds.length * 10_002)
        })

        it("should generate each integer with equal probability for the [1, .., 3] range", () => {
            seeds.forEach(startSeed => {
                const numbers: number[] = []
                let s = startSeed
                for (let i = 0; i < 10_000; ++i) {
                    numbers.push(Prng.nextInt(s, { minBound: 1, maxBound: 3 }))
                    s = Prng.step(s)
                }

                expect(numbers.filter(n => n === 1).length).toBeGreaterThan(
                    3200,
                )
                expect(numbers.filter(n => n === 1).length).toBeLessThan(3466)
                expect(numbers.filter(n => n === 2).length).toBeGreaterThan(
                    3200,
                )
                expect(numbers.filter(n => n === 2).length).toBeLessThan(3466)
                expect(numbers.filter(n => n === 3).length).toBeGreaterThan(
                    3200,
                )
                expect(numbers.filter(n => n === 3).length).toBeLessThan(3466)
            })

            expect.assertions(seeds.length * 6)
        })

        it("should generate each integer with equal probability for the [-3, .., 3] range", () => {
            seeds.forEach(startSeed => {
                const numbers: number[] = []
                let s = startSeed
                for (let i = 0; i < 10_000; ++i) {
                    numbers.push(Prng.nextInt(s, { minBound: -3, maxBound: 3 }))
                    s = Prng.step(s)
                }

                // Each number should occur at around 14.28%
                for (let i = -3; i <= 3; ++i) {
                    const count = numbers.filter(n => n === i).length
                    expect(count / 100).toBeGreaterThan(13)
                    expect(count / 100).toBeLessThan(15.5)
                }
            })

            expect.assertions(seeds.length * 14)
        })
    })
})

// Pseudo random pseudo random seed states. Hah.
const seeds: Prng.SeedState[] = []
for (let i = 0; i < 20; ++i) {
    seeds.push(Prng.makeSeedState(i.toString() + "prng"))
}
