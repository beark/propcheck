import Gen from "@propcheck/core/Gen"
import {
    given,
    PropCheckFailure,
    PropCheckOpts,
    shrink,
} from "@propcheck/core/runner"

import { SeedState } from "@propcheck/core/prng"

type Forall<R, T> = T extends (...args: infer TParams) => unknown
    ? (...generators: { [K in keyof TParams]: Gen<TParams[K]> }) => R
    : never

type ForallWithOptions<R, T> = T extends (...args: infer TParams) => unknown
    ? (
          options: Partial<PropCheckOpts>,
          ...generators: { [K in keyof TParams]: Gen<TParams[K]> }
      ) => R
    : never

declare global {
    namespace jest {
        // eslint-disable-next-line @typescript-eslint/ban-types
        interface Matchers<R, T = {}> {
            /**
             * Do a full property check run on the given property with default
             * options.
             *
             * To deterministically repeat a past run without changing your test
             * code, you can provide any `propcheck` options as environment
             * variables:
             * - PROPCHECK_SEED -- The seed to begin the run with.
             * - PROPCHECK_STARTITER -- The iteration count to start on.
             * - PROPCHECK_ITERCOUNT -- The number of test iterations to run
             *   (assuming the run starts on iteration 1).
             * - PROPCHECK_STARTSIZE -- The generator size to start on.
             * - PROPCHECK_MAXSIZE -- The maximum size the run should reach for
             *   purposes of value generation.
             *
             * @example
             * describe("The sum of two naturals", () => {
             *   it("should always be zero or more", () => {
             *     const sumIsGEqZero = (a: number, b: number) => {
             *       expect(a + b).toBeGreaterThanOrEqual(0);
             *     };
             *
             *     expect(sumIsGEqZero).forall(nat, nat);
             *   })
             * })
             */
            forall: Forall<R, T>

            /**
             * Do a full property check run on the given property with the given
             * options.
             *
             * To deterministically repeat a past run without changing your test
             * code, you can provide any `propcheck` options as environment
             * variables:
             * - PROPCHECK_SEED -- The seed to begin the run with.
             * - PROPCHECK_STARTITER -- The iteration count to start on.
             * - PROPCHECK_ITERCOUNT -- The number of test iterations to run
             *   (assuming the run starts on iteration 1).
             * - PROPCHECK_STARTSIZE -- The generator size to start on.
             * - PROPCHECK_MAXSIZE -- The maximum size the run should reach for
             *   purposes of value generation.
             *
             * @example
             * describe("The sum of two naturals", () => {
             *   it("should always be zero or more", () => {
             *     const sumIsGEqZero = (a: number, b: number) => {
             *       expect(a + b).toBeGreaterThanOrEqual(0);
             *     };
             *
             *     expect(sumIsGEqZero).forallWithOptions(
             *       { seed: 'customSeed' },
             *       nat,
             *       nat
             *     );
             *   })
             * })
             */
            forallWithOptions: ForallWithOptions<R, T>
        }
    }
}

expect.extend({
    forall(
        this: jest.MatcherUtils,
        received: unknown,
        ...generators: Gen<unknown>[]
    ) {
        return forall(this, received, {}, ...generators)
    },

    forallWithOptions(
        this: jest.MatcherUtils,
        received: unknown,
        options: Partial<PropCheckOpts>,
        ...generators: Gen<unknown>[]
    ) {
        return forall(this, received, options, ...generators)
    },
})

function forall(
    utils: jest.MatcherUtils,
    received: unknown,
    options: Partial<PropCheckOpts>,
    ...generators: Gen<unknown>[]
) {
    if (typeof received !== "function") {
        throw new Error(
            "Attempted to run propcheck on a non-function. Properties must be functions.",
        )
    }

    if (generators.some(g => !(g instanceof Gen))) {
        throw new Error(
            "Attempted to pass a non-generator as a generator argument to 'forall'.",
        )
    }

    try {
        const config: { [k: string]: unknown } = {
            seed: getEnvSeed(),
            startIteration: getEnvStartIteration(),
            iterations: getEnvIterationCount(),
            startSize: getEnvStartSize(),
            maxSize: getEnvMaxSize(),
        }

        // Filter out undefined options
        Object.keys(config).forEach(
            k => config[k] === undefined && delete config[k],
        )

        const result = given(...generators)
            .withOptions(options)
            // Environment options take presedence
            .withOptions(config)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .check(received as any)

        if (result.pass) {
            return {
                pass: true,
                message: () =>
                    `${result.propName} passed after ${result.iteration} ${ss(
                        "iteration",
                        result.iteration,
                    )} with a maximum size of ${result.size}`,
            }
        } else {
            const message = () =>
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                generateMessage(received as any, result, utils)
            return {
                pass: false,
                message,
            }
        }
    } catch (e) {
        return {
            pass: utils.isNot ? true : false,
            message: () =>
                `Error caught when trying to run propcheck: ${utils.utils.stringify(
                    e,
                )}`,
        }
    }
}

function generateMessage<TParams extends unknown[]>(
    prop: (...args: TParams) => unknown,
    result: PropCheckFailure<TParams>,
    utils: jest.MatcherUtils,
): string {
    const { smallestFailingArgs: args } = shrink(prop, result.args)

    const headline = `${result.propName} failed after ${result.iteration} ${ss(
        "iteration",
        result.iteration,
    )}.`
    const printedArgs = `\n\tSmallest failing ${ss(
        "argument",
        result.args.length,
    )}: ${args.map(arg => utils.utils.printReceived(arg)).join(", ")}`
    const error =
        result.error !== undefined
            ? `\n\tFailed with exception: ${utils.utils.printReceived(
                  result.error,
              )}`
            : ""
    const meta = `\n\tSeed: {${result.seed.map(n => n.toString(16))}}, Size: ${
        result.size
    }`

    return headline + printedArgs + error + meta
}

function ss(word: string, count: number): string {
    return count > 1 ? word + "s" : word
}

function getEnvSeed(): string | SeedState | undefined {
    const envSeed = process.env.PROPCHECK_SEED
    if (envSeed) {
        const regex =
            /{\s*([-]?[a-fA-F0-9]+)\s*,\s*([-]?[a-fA-F0-9]+)\s*,\s*([-]?[a-fA-F0-9]+)\s*,\s*([-]?[a-fA-F0-9]+)\s*}/
        const match = envSeed.match(regex)

        if (match) {
            const a = Number.parseInt(match[1].trim(), 16)
            const b = Number.parseInt(match[2].trim(), 16)
            const c = Number.parseInt(match[3].trim(), 16)
            const d = Number.parseInt(match[4].trim(), 16)

            return [a, b, c, d]
        } else {
            return envSeed
        }
    }

    return undefined
}

function getEnvStartIteration(): number | undefined {
    if (typeof process.env.PROPCHECK_STARTITER === "string") {
        return Number.parseInt(process.env.PROPCHECK_STARTITER, 10)
    }

    return undefined
}

function getEnvIterationCount(): number | undefined {
    if (typeof process.env.PROPCHECK_ITERCOUNT === "string") {
        return Number.parseInt(process.env.PROPCHECK_ITERCOUNT, 10)
    }

    return undefined
}

function getEnvStartSize(): number | undefined {
    if (typeof process.env.PROPCHECK_STARTSIZE === "string") {
        return Number.parseInt(process.env.PROPCHECK_STARTSIZE, 10)
    }

    return undefined
}

function getEnvMaxSize(): number | undefined {
    if (typeof process.env.PROPCHECK_MAXSIZE === "string") {
        return Number.parseInt(process.env.PROPCHECK_MAXSIZE, 10)
    }

    return undefined
}
