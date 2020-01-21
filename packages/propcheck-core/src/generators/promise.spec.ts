import Seq from "lazy-sequences"

import { promise, rejectingPromise, resolvingPromise } from "./promise"
import { Gen } from "../Gen"
import { makeSeedState } from "../prng"

describe("Generators/Promise", () => {
    describe("promise", () => {
        it("should generate the advertised ratio of rejecting/resolving promises", async () => {
            const gps = promise(Gen.const(1), Gen.const(0)).repeat(1000)
            const ps = gps.run(100, s0, 0).value

            let resolves = 0
            let rejects = 0
            for (const p of ps) {
                try {
                    await p
                    ++resolves
                } catch {
                    ++rejects
                }
            }

            expect(rejects).toBeGreaterThan(0)
            expect(resolves).toBeGreaterThan(rejects)
            expect(rejects).toBeGreaterThan(300)
            expect(rejects).toBeLessThan(360)
        })
    })

    describe("resolvingPromise", () => {
        it("should always resolve", async () => {
            const gps = resolvingPromise(Gen.const(1)).repeat(32)
            const ps = gps.run(100, s0, 0).value

            await expect(Promise.all(ps)).resolves.toEqual(
                Seq.repeat(1)
                    .take(32)
                    .collect(),
            )
        })
    })

    describe("rejectingPromise", () => {
        it("should always reject", async () => {
            const gps = rejectingPromise(Gen.const(1)).repeat(32)
            const ps = gps.run(100, s0, 0).value

            for (const p of ps) {
                await expect(p).rejects.toBe(1)
            }

            expect.assertions(32)
        })
    })
})

const s0 = makeSeedState("promise")
