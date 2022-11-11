import { Gen, Generators, Range } from "@propcheck/core"

const basecaseGens: Generators.WeightedGen<unknown>[] = [
    { weight: 1, gen: Gen.const(undefined) },
    { weight: 1, gen: Gen.const(null) },
    { weight: 1, gen: Gen.const(Infinity) },
    { weight: 1, gen: Gen.const(-Infinity) },
    { weight: 1, gen: Gen.const(NaN) },
    {
        weight: 2,
        gen: Generators.oneOf_(Gen.const(true), Gen.const(false)),
    },
    { weight: 5, gen: Generators.int },
    {
        weight: 5,
        gen: Gen.sized(sz => Generators.num(new Range(-sz, sz, 0))),
    },
    { weight: 5, gen: Generators.string(Generators.latin1) },
]

export const arbitraryObj: Gen<{}> = makeArbitraryObject(3)
export const arbitraryArray: Gen<unknown[]> = makeArbitraryArray(3)
export const arbitrary: Gen<unknown> = makeArbitrary(3)
export const arbitraryFn: Gen<(
    ...args: unknown[]
) => unknown> = makeArbitraryFn(3)

function makeArbitraryObject(recurDepth: number): Gen<{}> {
    if (recurDepth <= 0) {
        return Gen.const({})
    }

    return Generators.nat
        .scale(sz => Math.ceil(sz / 10))
        .andThen(n =>
            makeProp(recurDepth - 1)
                .repeat(n)
                .andThen(props => {
                    let objGen: { [k: string]: Gen<any> } = {}
                    for (const prop of props) {
                        objGen = { ...objGen, ...prop }
                    }

                    return Generators.obj_(objGen)
                }),
        )
}

function makeArbitraryArray(recurDepth: number): Gen<unknown[]> {
    if (recurDepth <= 0) {
        return Gen.const([])
    }

    return Generators.nat.andThen(len =>
        makeArbitrary(recurDepth - 1).repeat(len),
    )
}

function makeArbitrary(recurDepth: number): Gen<unknown> {
    if (recurDepth <= 0) {
        return Generators.frequency<unknown>(...basecaseGens)
    }

    return Generators.frequency<unknown>(
        ...basecaseGens.concat(
            // Ensure all the recursive generators are smaller than their parent
            { weight: 5, gen: makeArbitraryArray(recurDepth - 1) },
            { weight: 5, gen: makeArbitraryObject(recurDepth - 1) },
            { weight: 5, gen: makeArbitraryFn(recurDepth - 1) },
        ),
    )
}

function makeProp(recurDepth: number): Gen<{ [k: string]: Gen<unknown> }> {
    if (recurDepth <= 0) {
        return Gen.const({})
    }

    return Generators.integral_(new Range(0, 15, 0)).andThen(keyLen => {
        return Generators.alpha
            .andThen(first =>
                Generators.alphaNum
                    .repeat(keyLen)
                    .map(rest => first + rest.join("")),
            )
            .map(key => ({
                [key]: makeArbitrary(recurDepth),
            }))
    })
}

function makeArbitraryFn(
    recurDepth: number,
): Gen<(...args: unknown[]) => unknown> {
    return Generators.fn(makeArbitrary(recurDepth), 16)
}
