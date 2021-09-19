import Gen, { GeneratedType } from "@propcheck/core/Gen"
import {
    given as givenCore,
    PropCheckFailure,
    PropCheckOpts,
    shrink,
} from "@propcheck/core/runner"

import { SeedState } from "@propcheck/core/prng"

export type GeneratedTypes<T> = {
    [K in keyof T]: GeneratedType<T[K]>
}

/**
 * Options that can be used to configure a propcheck run that was set up using
 * `given`.
 */
export type GivenOptions = {
    /**
     * Gives a name to the operation under test.
     *
     * Any name provided by the `operation` combinator will be overriden by
     * this. If not provided by either method, no `describe` containing an
     * operation name will be generated.
     */
    operation?: string
    /**
     * Gives a name to the property under test.
     *
     * If not provided, the name of the property is assumed to be the name of
     * the function given as property. If an anonymous function is given,
     * the test will have no property name.
     */
    property?: string
} & Partial<PropCheckOpts>

export type Given<TArgs extends unknown[]> = {
    /**
     * Defines the property to be under test.
     *
     * @param prop
     *   Function that defines the property under test. Should either throw, or
     *   return something defined but falsy on failure.
     */
    shouldSatisfy: (prop: (...args: TArgs) => unknown) => void
    /**
     * Defines the property to be under test.
     *
     * Further, _focuses_ on this particular property test (like Jest's `fit`).
     *
     * @param prop
     *   Function that defines the property under test. Should either throw, or
     *   return something defined but falsy on failure.
     */
    fshouldSatisfy: (prop: (...args: TArgs) => unknown) => void
    /**
     * Provide a set of options for the generated test.
     *
     * @see GivenOptions
     */
    withOptions: (options: GivenOptions) => Omit<Given<TArgs>, "withOptions">
    /**
     * Give a name to the general operation for which the property test applies.
     *
     * @param {string} name The name of the operation.
     *
     * @example
     * given(nat, nat, nat)
     *   .operation("plus")
     *   .shouldSatisfy(assoc);
     *
     * // Equivalent test without the short-hands:
     * describe("plus", () => {
     *   it("should satisfy the property 'assoc'", () => {
     *     expect(assoc).forall(nat, nat, nat);
     *   });
     * });
     */
    operation: (name: string) => {
        /**
         * Defines the property to be under test.
         *
         * @param prop
         *   Function that defines the property under test. Should either throw,
         *   or return something defined but falsy on failure.
         */
        shouldSatisfy: (prop: (...args: TArgs) => unknown) => void
        /**
         * Defines the property to be under test.
         *
         * Further, _focuses_ on this particular property test (like Jest's
         * `fit`).
         *
         * @param prop
         *   Function that defines the property under test. Should either throw,
         *   or return something defined but falsy on failure.
         */
        fshouldSatisfy: (prop: (...args: TArgs) => unknown) => void
    }
}

/**
 * Short-hand function to define a property test.
 *
 * @param {TArgs} gens
 *   Generators that will be used as input sources for the property under test.
 * @returns
 * @template TArgs Type of generator arguments.
 *
 * @example
 * given(nat).operation("plus one").shouldSatisfy(positive);
 */
export function given<TArgs extends Gen<unknown>[]>(
    ...gens: TArgs
): Given<GeneratedTypes<TArgs>> {
    return {
        withOptions: opts => ({
            shouldSatisfy: prop => runGiven(gens, prop, opts),
            // Ignore coverage of fshouldSatisfy, since we cannot test it
            fshouldSatisfy: /* istanbul ignore next */ prop =>
                frunGiven(gens, prop, opts),
            operation: name =>
                given(...gens).withOptions({ operation: name, ...opts }),
        }),
        operation: name => ({
            shouldSatisfy: prop => {
                runGiven(gens, prop, { operation: name })
            },
            fshouldSatisfy: /* istanbul ignore next */ prop => {
                frunGiven(gens, prop, { operation: name })
            },
        }),
        shouldSatisfy: prop => runGiven(gens, prop, {}),
        fshouldSatisfy: /* istanbul ignore next */ prop =>
            frunGiven(gens, prop, {}),
    }
}

function runGiven<TGens extends Gen<unknown>[]>(
    gens: TGens,
    prop: (...args: GeneratedTypes<TGens>) => unknown,
    options: GivenOptions,
): void {
    const { operation, property = prop.name, ...remOpts } = options

    if (operation === undefined) {
        describe(`The property ${property}`, () => {
            it("should be satisfied for all inputs", () => {
                expect(prop).forallWithOptions(
                    remOpts,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ...(gens as any),
                )
            })
        })
        return
    }

    describe(operation, () => {
        it(`should satisfy ${property} for all inputs`, () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect(prop).forallWithOptions(remOpts, ...(gens as any))
        })
    })
}

/* istanbul ignore next */
function frunGiven<TGens extends Gen<unknown>[]>(
    gens: TGens,
    prop: (...args: GeneratedTypes<TGens>) => unknown,
    options: GivenOptions,
): void {
    const { operation, property = prop.name, ...remOpts } = options

    if (operation === undefined) {
        describe(`The property ${property}`, () => {
            fit("should be satisfied for all inputs", () => {
                expect(prop).forallWithOptions(
                    remOpts,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ...(gens as any),
                )
            })
        })
        return
    }

    describe(operation, () => {
        fit(`should satisfy ${property} for all inputs`, () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect(prop).forallWithOptions(remOpts, ...(gens as any))
        })
    })
}

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

        const result = givenCore(...generators)
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
            message: () => {
                const errString =
                    typeof e === "object" && e !== null
                        ? utils.utils.stringify(e)
                        : JSON.stringify(e)

                return `Error caught when trying to run propcheck: ${errString}`
            },
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
