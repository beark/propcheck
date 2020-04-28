import { Seq } from "lazy-sequences"
import { Gen } from "../Gen"
import { makeSeedState, SeedState } from "../prng"
import * as G from "./strings"

describe("Generators/Strings", () => {
    describe("lower", () => {
        it("should generate only lower cased alphabetic characters", () => {
            const lower = G.lower.repeat(5)
            const r0 = run(lower, 0, s0).join("")
            const r1 = run(lower, 0, s1).join("")
            const r2 = run(lower, 0, s2).join("")

            expect(r0).toMatch(/^[a-z][a-z][a-z][a-z][a-z]$/)
            expect(r1).toMatch(/^[a-z][a-z][a-z][a-z][a-z]$/)
            expect(r2).toMatch(/^[a-z][a-z][a-z][a-z][a-z]$/)
        })
    })

    describe("upper", () => {
        it("should generate only upper cased alphabetic characters", () => {
            const upper = G.upper.repeat(5)
            const r0 = run(upper, 0, s0).join("")
            const r1 = run(upper, 0, s1).join("")
            const r2 = run(upper, 0, s2).join("")

            expect(r0).toMatch(/^[A-Z][A-Z][A-Z][A-Z][A-Z]$/)
            expect(r1).toMatch(/^[A-Z][A-Z][A-Z][A-Z][A-Z]$/)
            expect(r2).toMatch(/^[A-Z][A-Z][A-Z][A-Z][A-Z]$/)
        })
    })

    describe("digit", () => {
        it("should generate only digits", () => {
            const digit = G.digit.repeat(5)
            const r0 = run(digit, 0, s0).join("")
            const r1 = run(digit, 0, s1).join("")
            const r2 = run(digit, 0, s2).join("")

            expect(r0).toMatch(/^[0-9][0-9][0-9][0-9][0-9]$/)
            expect(r1).toMatch(/^[0-9][0-9][0-9][0-9][0-9]$/)
            expect(r2).toMatch(/^[0-9][0-9][0-9][0-9][0-9]$/)
        })
    })

    describe("alpha", () => {
        it("should generate only alphabetic characters of different cases", () => {
            const alpha = G.alpha.repeat(5)
            const r0 = run(alpha, 0, s0).join("")
            const r1 = run(alpha, 0, s1).join("")
            const r2 = run(alpha, 0, s2).join("")

            expect(r0).toMatch(/^[a-zA-Z][a-zA-Z][a-zA-Z][a-zA-Z][a-zA-Z]$/)
            expect(r1).toMatch(/^[a-zA-Z][a-zA-Z][a-zA-Z][a-zA-Z][a-zA-Z]$/)
            expect(r2).toMatch(/^[a-zA-Z][a-zA-Z][a-zA-Z][a-zA-Z][a-zA-Z]$/)
        })
    })

    describe("alphaNum", () => {
        it("should generate only alphanumeric characters of different cases", () => {
            const alphaNum = G.alphaNum.repeat(5)
            const r0 = run(alphaNum, 0, s0).join("")
            const r1 = run(alphaNum, 0, s1).join("")
            const r2 = run(alphaNum, 0, s2).join("")

            const pattern = new RegExp("[a-zA-Z0-9]".repeat(5))

            expect(r0).toMatch(pattern)
            expect(r1).toMatch(pattern)
            expect(r2).toMatch(pattern)
        })
    })

    describe("unicode", () => {
        it("should generate valid code points, such that a string can be constructed", () => {
            const uc = G.unicode.repeat(10000)

            const cs = uc.run(0, s0, 0).value

            expect(cs).toHaveLength(10000)
            expect(
                cs.every(
                    c => c.charCodeAt(0) >= 0x2 && c.charCodeAt(0) < 0xefffd,
                ),
            ).toBe(true)
        })
    })

    describe("asciiBiasedUnicode", () => {
        it("should generate characters of each set with the expected frequency", () => {
            const csG = G.asciiBiasedUnicode.repeat(10000)
            const cs = csG.run(0, s0, 0).value

            const ascii = cs.filter(c => c.charCodeAt(0) <= 127)
            const uc = cs.filter(c => c.charCodeAt(0) > 127)

            expect(ascii.length / 10000).toBeGreaterThanOrEqual(0.73)
            expect(uc.length / 10000).toBeGreaterThanOrEqual(0.23)
            expect(ascii.length + uc.length).toBe(10000)
        })
    })

    describe("string", () => {
        it("should generate strings using the given character generator", () => {
            const digitString = G.string(G.digit)

            const digits0 = digitString.run(5, s0, 0).value
            const digits1 = digitString.run(5, s1, 0).value
            const digits2 = digitString.run(5, s2, 0).value

            expect(digits0).toMatch(/^[0-9]*$/)
            expect(digits1).toMatch(/^[0-9]*$/)
            expect(digits2).toMatch(/^[0-9]*$/)
        })

        it("should generate a shrink tree with shorter strings", () => {
            const digitString = G.string(G.digit)

            const [x, xs] = new Seq(digitString.run(5, s0, 0)).unCons()
            const [y, ys] = new Seq(digitString.run(10, s1, 0)).unCons()
            const [z, zs] = new Seq(digitString.run(20, s2, 0)).unCons()

            expect(xs.all(s => s.length < x!.length)).toBe(true)
            expect(ys.all(s => s.length < y!.length)).toBe(true)
            expect(zs.all(s => s.length < z!.length)).toBe(true)
        })
    })
})

function run<T>(g: Gen<T>, size: number, seed: SeedState): T {
    const t = g.run(size, seed, 0)
    return t.value
}

const s0 = makeSeedState("string0")
const s1 = makeSeedState("string1")
const s2 = makeSeedState("string2")
